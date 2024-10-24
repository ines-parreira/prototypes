import {render, screen, waitFor} from '@testing-library/react'
import {mockFlags} from 'jest-launchdarkly-mock'
import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import thunk from 'redux-thunk'

import {SegmentEvent} from 'common/segment'
import {logEventWithSampling} from 'common/segment/segment'
import {FeatureFlagKey} from 'config/featureFlags'
import {AUTOMATION_BOT_EMAIL_ACROSS_ALL_ACCOUNTS} from 'state/agents/constants'
import {getCurrentAccountId} from 'state/currentAccount/selectors'
import {shouldDisplayAuditLogEvents as getShouldDisplayAuditLogEvents} from 'state/ticket/selectors'
import {RootState} from 'state/types'
import {getSelectedAIMessage} from 'state/ui/ticketAIAgentFeedback'
import {assumeMock} from 'utils/testing'

import AIAgentDraftMessage from '../../AIAgentDraftMessage/AIAgentDraftMessage'
import {
    BANNER_TYPE,
    DRAFT_MESSAGE_TAG,
    TRIAL_MESSAGE_TAG,
} from '../../AIAgentFeedbackBar/constants'
import {messageFeedback} from '../../AIAgentFeedbackBar/tests/fixtures'
import TicketMessages from '../TicketMessages'

jest.mock('state/ui/ticketAIAgentFeedback')
jest.mock('state/currentAccount/selectors')
jest.mock('state/ticket/selectors')
jest.mock('common/segment/segment')

const getSelectedAIMessageMock = assumeMock(getSelectedAIMessage)
const getCurrentAccountIdMock = assumeMock(getCurrentAccountId)
const getShouldDisplayAuditLogEventsMock = assumeMock(
    getShouldDisplayAuditLogEvents
)
const logEventMock = assumeMock(logEventWithSampling)

jest.mock(
    'pages/tickets/detail/components/TicketMessages/Message',
    () => () => <p>Message</p>
)

jest.mock(
    'pages/tickets/detail/components/TicketMessages/Container',
    () => () => <p>Container</p>
)

jest.mock(
    'pages/tickets/detail/components/AIAgentDraftMessage/AIAgentDraftMessage',
    () => jest.fn(() => <p>AIAgentDraftMessage</p>)
)

const mockStore = configureMockStore([thunk])
const defaultState: Partial<RootState> = {}

describe('TicketMessages', () => {
    const defaultProps = {
        id: '1',
        messages: [
            {
                id: 1,
                body: 'message',
                body_html: DRAFT_MESSAGE_TAG,
                created_at: '2021-01-01T00:00:00Z',
                sender: {email: 'test@test.com'},
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
        customer: new Map<any, any>(),
        lastCustomerMessage: new Map<any, any>(),
        ticketMeta: null,
    } as unknown as ComponentProps<typeof TicketMessages>

    beforeEach(() => {
        getSelectedAIMessageMock.mockReturnValue({
            ticket_id: 1,
            id: messageFeedback.messageId,
        } as unknown as ReturnType<typeof getSelectedAIMessage>)
        getCurrentAccountIdMock.mockReturnValue(1)
        getShouldDisplayAuditLogEventsMock.mockReturnValue(true)

        mockFlags({
            [FeatureFlagKey.FeedbackToAIAgentInTicketViews]: false,
        })
    })

    it('should get accountId from useAppSelector', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <TicketMessages {...defaultProps} />
            </Provider>
        )

        expect(getCurrentAccountIdMock).toHaveBeenCalled()
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
            </Provider>
        )

        expect(screen.getByText('AIAgentDraftMessage')).toBeInTheDocument()
        expect(AIAgentDraftMessage).toHaveBeenCalledWith(
            expect.objectContaining({
                ticketId: draftMessageProps.ticketId,
                message: draftMessageProps.messages[0],
            }),
            expect.anything()
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
            </Provider>
        )

        expect(screen.getByText('AIAgentDraftMessage')).toBeInTheDocument()
        expect(AIAgentDraftMessage).toHaveBeenCalledWith(
            expect.objectContaining({
                ticketId: trialMessageProps.ticketId,
                message: trialMessageProps.messages[0],
                isTrial: true,
            }),
            expect.anything()
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
            </Provider>
        )

        await waitFor(() => {
            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.AiAgentTicketViewed,
                {
                    accountId: 1,
                    banner: 'qa_failed',
                },
                1
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
            </Provider>
        )

        await waitFor(() => {
            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.AiAgentTicketViewed,
                {
                    accountId: 1,
                    banner: 'trial',
                },
                1
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
            </Provider>
        )

        await waitFor(() => {
            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.AiAgentTicketViewed,
                {
                    accountId: 1,
                    banner: BANNER_TYPE.THUMBS_UP_AND_DOWN,
                },
                0.1
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
            </Provider>
        )

        await waitFor(() => {
            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.AiAgentTicketViewed,
                {
                    accountId: 1,
                    banner: BANNER_TYPE.THUMBS_UP_IMPROVE_RESPONSE,
                },
                0.1
            )
        })
    })

    it('should return null if no messages', () => {
        const props = {
            ...defaultProps,
            messages: [],
        }

        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <TicketMessages {...props} />
            </Provider>
        )

        expect(container).toBeEmptyDOMElement()
    })
})
