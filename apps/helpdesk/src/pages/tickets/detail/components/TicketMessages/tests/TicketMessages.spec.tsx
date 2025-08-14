import { ComponentProps } from 'react'

import { assumeMock } from '@repo/testing'
import { render, screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { mockFlags } from 'jest-launchdarkly-mock'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { SegmentEvent } from 'common/segment'
import { logEventWithSampling } from 'common/segment/segment'
import { useTicketIsAfterFeedbackCollectionPeriod } from 'common/utils/useIsTicketAfterFeedbackCollectionPeriod'
import { FeatureFlagKey } from 'config/featureFlags'
import { account } from 'fixtures/account'
import { user } from 'fixtures/users'
import { view } from 'fixtures/views'
import { AUTOMATION_BOT_EMAIL_ACROSS_ALL_ACCOUNTS } from 'state/agents/constants'
import { shouldDisplayAuditLogEvents as getShouldDisplayAuditLogEvents } from 'state/ticket/selectors'
import { RootState, StoreDispatch } from 'state/types'
import { getSelectedAIMessage } from 'state/ui/ticketAIAgentFeedback'
import { getLDClient } from 'utils/launchDarkly'

import AIAgentDraftMessage from '../../AIAgentDraftMessage/AIAgentDraftMessage'
import {
    BANNER_TYPE,
    DRAFT_MESSAGE_TAG,
    TRIAL_MESSAGE_TAG,
} from '../../AIAgentFeedbackBar/constants'
import { messageFeedback } from '../../AIAgentFeedbackBar/tests/fixtures'
import TicketMessages from '../TicketMessages'

// Mock the TicketMessageTranslationProvider to avoid QueryClient issues
jest.mock(
    '../TicketMessagesTranslationDisplay/TicketMessageTranslationDisplayProvider',
    () => ({
        TicketMessageTranslationDisplayProvider: ({
            children,
        }: {
            children: React.ReactNode
        }) => (
            <div data-testid="ticket-message-translation-provider">
                {children}
            </div>
        ),
    }),
)

// Mock the withMessageTranslations HOC to avoid QueryClient issues
jest.mock(
    '../TicketMessagesTranslationDisplay/withMessageTranslations',
    () => ({
        withMessageTranslations: (Component: React.ComponentType<any>) =>
            Component,
    }),
)

jest.mock('state/ui/ticketAIAgentFeedback')
jest.mock('state/ticket/selectors')
jest.mock('common/segment/segment', () => ({
    logEventWithSampling: jest.fn(),
    logEvent: jest.fn(),
}))
jest.mock('common/utils/useIsTicketAfterFeedbackCollectionPeriod')

const getSelectedAIMessageMock = assumeMock(getSelectedAIMessage)
const getShouldDisplayAuditLogEventsMock = assumeMock(
    getShouldDisplayAuditLogEvents,
)
const logEventMock = assumeMock(logEventWithSampling)
const useTicketIsAfterFeedbackCollectionPeriodMock = assumeMock(
    useTicketIsAfterFeedbackCollectionPeriod,
)

jest.mock('pages/tickets/detail/components/TicketMessages/Message', () =>
    jest.fn(() => <p>Message</p>),
)

jest.mock('pages/tickets/detail/components/TicketMessages/Body', () =>
    jest.fn(() => <p>Body</p>),
)

jest.mock(
    'pages/tickets/detail/components/TicketMessages/AIAgentBanner',
    () => () => <p>AIAgentBanner</p>,
)

jest.mock(
    'pages/tickets/detail/components/AIAgentDraftMessage/AIAgentDraftMessage',
    () => jest.fn(() => <p>AIAgentDraftMessage</p>),
)

jest.mock('tickets/ticket-detail/components/MessageHeader', () => ({
    MessageHeader: jest.fn(() => <p>MessageHeader</p>),
}))

jest.mock('utils/launchDarkly')
const allFlagsMock = getLDClient().allFlags as jest.MockedFunction<
    ReturnType<typeof getLDClient>['allFlags']
>

const defaultStore: Partial<RootState> = {
    currentAccount: fromJS(account),
    currentUser: fromJS(user),
}

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const defaultState: Partial<RootState> = {
    ...defaultStore,
    views: fromJS({
        active: view,
    }),
}

describe('TicketMessages', () => {
    const defaultProps = {
        id: '1',
        messages: [
            {
                id: 1,
                body: 'message',
                body_html: DRAFT_MESSAGE_TAG,
                created_at: '2021-01-01T00:00:00Z',
                sender: { email: 'test@test.com' },
                public: true,
                sent_datetime: '2021-01-01T00:00:00Z',
            },
        ],
        ticketId: 1,
        timezone: 'UTC',
        hasCursor: false,
        lastMessageDatetimeAfterMount: null,
        setStatus: jest.fn(),
        highlightedElements: null,
        customer: fromJS({}),
        lastCustomerMessage: new Map<any, any>(),
        ticketMeta: null,
    } as unknown as ComponentProps<typeof TicketMessages>

    beforeEach(() => {
        allFlagsMock.mockReturnValue({
            [FeatureFlagKey.SimplifyAiAgentFeedbackCollection]: false,
        })
        getSelectedAIMessageMock.mockReturnValue({
            ticket_id: 1,
            id: messageFeedback.messageId,
        } as unknown as ReturnType<typeof getSelectedAIMessage>)
        getShouldDisplayAuditLogEventsMock.mockReturnValue(true)
        useTicketIsAfterFeedbackCollectionPeriodMock.mockReturnValue(false)
        mockFlags({
            [FeatureFlagKey.FeedbackToAIAgentInTicketViews]: false,
        })
    })

    it('should identify and render AiAgentDraftMessage', () => {
        const draftMessageProps = {
            ...defaultProps,
            messages: [
                {
                    ...defaultProps.messages[0],
                    body_html: DRAFT_MESSAGE_TAG,
                },
            ],
        }

        render(
            <Provider store={mockStore(defaultState)}>
                <TicketMessages {...draftMessageProps} />
            </Provider>,
        )

        expect(screen.getByText('AIAgentDraftMessage')).toBeInTheDocument()
        expect(AIAgentDraftMessage).toHaveBeenCalledWith(
            expect.objectContaining({
                ticketId: draftMessageProps.ticketId,
                message: draftMessageProps.messages[0],
            }),
            expect.anything(),
        )
    })

    it('should identify and render AiAgentTrialMessage', () => {
        const trialMessageProps = {
            ...defaultProps,
            messages: [
                {
                    ...defaultProps.messages[0],
                    body_html: TRIAL_MESSAGE_TAG,
                },
            ],
        }

        render(
            <Provider store={mockStore(defaultState)}>
                <TicketMessages {...trialMessageProps} />
            </Provider>,
        )

        expect(screen.getByText('AIAgentDraftMessage')).toBeInTheDocument()
        expect(AIAgentDraftMessage).toHaveBeenCalledWith(
            expect.objectContaining({
                ticketId: trialMessageProps.ticketId,
                message: trialMessageProps.messages[0],
                isTrial: true,
            }),
            expect.anything(),
        )
    })

    it('should log AiAgentTicketViewed event with bannerType qa_failed for Draft message', async () => {
        mockFlags({
            [FeatureFlagKey.FeedbackToAIAgentInTicketViews]: true,
        })

        const props = {
            ...defaultProps,
            messages: [
                {
                    ...defaultProps.messages[0],
                    body_html: DRAFT_MESSAGE_TAG,
                    sender: {
                        ...defaultProps.messages[0].sender,
                        email: AUTOMATION_BOT_EMAIL_ACROSS_ALL_ACCOUNTS[0],
                    },
                },
            ],
        }

        render(
            <Provider store={mockStore(defaultState)}>
                <TicketMessages {...props} />
            </Provider>,
        )

        await waitFor(() => {
            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.AiAgentTicketViewed,
                {
                    accountId: 1,
                    banner: 'qa_failed',
                    userType: 'admin',
                    viewedFrom: 'new-&-open-tickets',
                },
                1,
            )
        })
    })

    it('should log AiAgentTicketViewed event with bannerType trial for Trial message', async () => {
        mockFlags({
            [FeatureFlagKey.FeedbackToAIAgentInTicketViews]: true,
        })
        const props = {
            ...defaultProps,
            messages: [
                {
                    ...defaultProps.messages[0],
                    body_html: TRIAL_MESSAGE_TAG,
                    sender: {
                        ...defaultProps.messages[0].sender,
                        email: AUTOMATION_BOT_EMAIL_ACROSS_ALL_ACCOUNTS[0],
                    },
                },
            ],
        }

        render(
            <Provider store={mockStore(defaultState)}>
                <TicketMessages {...props} />
            </Provider>,
        )

        await waitFor(() => {
            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.AiAgentTicketViewed,
                {
                    accountId: 1,
                    banner: 'trial',
                    userType: 'admin',
                    viewedFrom: 'new-&-open-tickets',
                },
                1,
            )
        })
    })

    it('should log AiAgentTicketViewed event with bannerType thumbs_up_and_down for ai agent message', async () => {
        mockFlags({
            [FeatureFlagKey.FeedbackToAIAgentInTicketViews]: true,
        })
        const props = {
            ...defaultProps,
            messages: [
                {
                    ...defaultProps.messages[0],
                    body_html: 'message',
                    public: false,
                    sender: {
                        ...defaultProps.messages[0].sender,
                        email: AUTOMATION_BOT_EMAIL_ACROSS_ALL_ACCOUNTS[0],
                    },
                },
            ],
        }

        render(
            <Provider store={mockStore(defaultState)}>
                <TicketMessages {...props} />
            </Provider>,
        )

        await waitFor(() => {
            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.AiAgentTicketViewed,
                {
                    accountId: 1,
                    banner: BANNER_TYPE.THUMBS_UP_AND_DOWN,
                    userType: 'admin',
                    viewedFrom: 'new-&-open-tickets',
                },
                0.1,
            )
        })
    })

    it('should log AiAgentTicketViewed event with bannerType thumbs_up_improve_response for ai agent message', async () => {
        mockFlags({
            [FeatureFlagKey.FeedbackToAIAgentInTicketViews]: true,
        })
        const props = {
            ...defaultProps,
            messages: [
                {
                    ...defaultProps.messages[0],
                    body_html: 'message',
                    sender: {
                        ...defaultProps.messages[0].sender,
                        email: AUTOMATION_BOT_EMAIL_ACROSS_ALL_ACCOUNTS[0],
                    },
                },
            ],
        }

        render(
            <Provider store={mockStore(defaultState)}>
                <TicketMessages {...props} />
            </Provider>,
        )

        await waitFor(() => {
            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.AiAgentTicketViewed,
                {
                    accountId: 1,
                    banner: BANNER_TYPE.THUMBS_UP_IMPROVE_RESPONSE,
                    userType: 'admin',
                    viewedFrom: 'new-&-open-tickets',
                },
                0.1,
            )
        })
    })

    it('should return null if no messages', () => {
        const props = {
            ...defaultProps,
            messages: [],
        }

        const { container } = render(
            <Provider store={mockStore(defaultState)}>
                <TicketMessages {...props} />
            </Provider>,
        )

        expect(container).toBeEmptyDOMElement()
    })
})
