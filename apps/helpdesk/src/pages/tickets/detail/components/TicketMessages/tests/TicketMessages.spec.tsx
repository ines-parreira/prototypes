import type { ComponentProps } from 'react'

import { logEventWithSampling, SegmentEvent } from '@repo/logging'
import { assumeMock } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { useTicketIsAfterFeedbackCollectionPeriod } from 'common/utils/useIsTicketAfterFeedbackCollectionPeriod'
import { useFlag } from 'core/flags'
import { account } from 'fixtures/account'
import { user } from 'fixtures/users'
import { view } from 'fixtures/views'
import { AUTOMATION_BOT_EMAIL_ACROSS_ALL_ACCOUNTS } from 'state/agents/constants'
import { shouldDisplayAuditLogEvents as getShouldDisplayAuditLogEvents } from 'state/ticket/selectors'
import type { RootState, StoreDispatch } from 'state/types'
import { getSelectedAIMessage } from 'state/ui/ticketAIAgentFeedback'

import AIAgentDraftMessage from '../../AIAgentDraftMessage/AIAgentDraftMessage'
import {
    BANNER_TYPE,
    DRAFT_MESSAGE_TAG,
    TRIAL_MESSAGE_TAG,
} from '../../AIAgentFeedbackBar/constants'
import { messageFeedback } from '../../AIAgentFeedbackBar/tests/fixtures'
import TicketMessages from '../TicketMessages'

jest.mock(
    'tickets/ticket-detail/components/TicketMessagesTranslationDisplay/TicketMessageTranslationDisplayProvider',
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

jest.mock(
    'tickets/ticket-detail/components/TicketMessagesTranslationDisplay/withMessageTranslations',
    () => ({
        withMessageTranslations: (Component: React.ComponentType<any>) =>
            Component,
    }),
)

jest.mock('state/ui/ticketAIAgentFeedback')
jest.mock('state/ticket/selectors')
jest.mock('@repo/logging', () => ({
    ...jest.requireActual('@repo/logging'),
    logEventWithSampling: jest.fn(),
    logEvent: jest.fn(),
}))
jest.mock('common/utils/useIsTicketAfterFeedbackCollectionPeriod')
jest.mock('models/knowledgeService/queries', () => ({
    useGetEarliestExecution: jest.fn(() => ({
        data: {
            reasoningTimestamp: '2021-01-01T00:00:00Z',
        },
        isLoading: false,
        isError: false,
    })),
}))
jest.mock('state/ticket/utils', () => ({
    ...jest.requireActual('state/ticket/utils'),
    buildFirstTicketMessage: jest.fn((message, ...args) => {
        const actual = jest.requireActual('state/ticket/utils')
        if (!message) {
            return {
                created_datetime: '2021-01-01T00:00:00Z',
                sender: { email: 'dummy@test.com' },
                body_html: '',
                public: true,
            }
        }
        return actual.buildFirstTicketMessage(message, ...args)
    }),
}))
jest.mock('models/aiAgentFeedback/queries', () => ({
    useGetAiAgentFeedback: jest.fn(() => ({
        data: {
            data: {
                messages: [],
            },
        },
        isLoading: false,
        isError: false,
    })),
}))
jest.mock('@repo/navigation', () => ({
    ...jest.requireActual('@repo/navigation'),
    useTicketInfobarNavigation: jest.fn(() => ({
        activeTab: null,
        onChangeTab: jest.fn(),
    })),
    TicketInfobarTab: {
        Feedback: 'feedback',
    },
}))

jest.mock('core/flags')
const mockUseFlag = useFlag as jest.Mock

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
    'pages/tickets/detail/components/AIAgentDraftMessage/AIAgentDraftMessage',
    () => jest.fn(() => <p>AIAgentDraftMessage</p>),
)

jest.mock('tickets/ticket-detail/components/MessageHeader', () => ({
    MessageHeader: jest.fn(() => <p>MessageHeader</p>),
}))

const defaultStore: Partial<RootState> = {
    currentAccount: fromJS(account),
    currentUser: fromJS(user),
    ticket: fromJS({
        current: {
            messages: [],
        },
    }),
}

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const defaultState: Partial<RootState> = {
    ...defaultStore,
    views: fromJS({
        active: view,
    }),
    ticket: fromJS({
        current: {
            messages: [],
        },
    }),
}

const createQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
        logger: {
            // eslint-disable-next-line no-console
            log: console.log,
            warn: console.warn,
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            error: () => {},
        },
    })

describe('TicketMessages', () => {
    let queryClient: QueryClient

    beforeEach(() => {
        queryClient = createQueryClient()
    })

    afterEach(() => {
        queryClient.clear()
    })

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
        getSelectedAIMessageMock.mockReturnValue({
            ticket_id: 1,
            id: messageFeedback.messageId,
        } as unknown as ReturnType<typeof getSelectedAIMessage>)
        getShouldDisplayAuditLogEventsMock.mockReturnValue(true)
        useTicketIsAfterFeedbackCollectionPeriodMock.mockReturnValue(false)
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
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(defaultState)}>
                    <TicketMessages {...draftMessageProps} />
                </Provider>
            </QueryClientProvider>,
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
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(defaultState)}>
                    <TicketMessages {...trialMessageProps} />
                </Provider>
            </QueryClientProvider>,
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
        mockUseFlag.mockReturnValue(true)

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
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(defaultState)}>
                    <TicketMessages {...props} />
                </Provider>
            </QueryClientProvider>,
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
        mockUseFlag.mockReturnValue(true)
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
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(defaultState)}>
                    <TicketMessages {...props} />
                </Provider>
            </QueryClientProvider>,
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
        mockUseFlag.mockReturnValue(true)
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
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(defaultState)}>
                    <TicketMessages {...props} />
                </Provider>
            </QueryClientProvider>,
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
        mockUseFlag.mockReturnValue(true)
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
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(defaultState)}>
                    <TicketMessages {...props} />
                </Provider>
            </QueryClientProvider>,
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
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(defaultState)}>
                    <TicketMessages {...props} />
                </Provider>
            </QueryClientProvider>,
        )

        expect(container).toBeEmptyDOMElement()
    })

    it('should render Container with correct props for regular messages', () => {
        const props = {
            ...defaultProps,
            messages: [
                {
                    ...defaultProps.messages[0],
                    body_html: 'regular message',
                    sender: {
                        id: 1,
                        name: 'Test User',
                        firstname: 'Test',
                        lastname: 'User',
                        email: 'user@test.com',
                    },
                },
            ],
        }

        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(defaultState)}>
                    <TicketMessages {...props} />
                </Provider>
            </QueryClientProvider>,
        )

        expect(screen.getByText('Message')).toBeInTheDocument()
    })

    it('should handle feature flag disabled state', () => {
        mockUseFlag.mockReturnValue(false)

        const props = {
            ...defaultProps,
            messages: [
                {
                    ...defaultProps.messages[0],
                    body_html: 'message',
                    sender: {
                        id: 1,
                        name: 'AI Agent',
                        firstname: 'AI',
                        lastname: 'Agent',
                        email: AUTOMATION_BOT_EMAIL_ACROSS_ALL_ACCOUNTS[0],
                    },
                },
            ],
        }

        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(defaultState)}>
                    <TicketMessages {...props} />
                </Provider>
            </QueryClientProvider>,
        )

        expect(screen.getByText('Message')).toBeInTheDocument()
        expect(logEventMock).not.toHaveBeenCalled()
    })

    it('should handle messages with highlighted elements', () => {
        const props = {
            ...defaultProps,
            messages: [
                {
                    ...defaultProps.messages[0],
                    id: 100,
                    from_agent: true,
                    body_html: 'regular message',
                    sender: {
                        id: 1,
                        name: 'Test User',
                        firstname: 'Test',
                        lastname: 'User',
                        email: 'user@test.com',
                    },
                },
            ],
            highlightedElements: { first: 99, last: 101 },
        }

        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(defaultState)}>
                    <TicketMessages {...props} />
                </Provider>
            </QueryClientProvider>,
        )

        expect(screen.getByText('Message')).toBeInTheDocument()
    })

    it('should handle messages outside highlighted range', () => {
        const props = {
            ...defaultProps,
            messages: [
                {
                    ...defaultProps.messages[0],
                    id: 50,
                    from_agent: true,
                    body_html: 'regular message',
                    sender: {
                        id: 1,
                        name: 'Test User',
                        firstname: 'Test',
                        lastname: 'User',
                        email: 'user@test.com',
                    },
                },
            ],
            highlightedElements: { first: 99, last: 101 },
        }

        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(defaultState)}>
                    <TicketMessages {...props} />
                </Provider>
            </QueryClientProvider>,
        )

        expect(screen.getByText('Message')).toBeInTheDocument()
    })

    it('should handle lastCustomerMessage matching a message', () => {
        const props = {
            ...defaultProps,
            messages: [
                {
                    ...defaultProps.messages[0],
                    id: 123,
                    body_html: 'regular message',
                    sender: {
                        id: 1,
                        name: 'Test User',
                        firstname: 'Test',
                        lastname: 'User',
                        email: 'user@test.com',
                    },
                },
            ],
            lastCustomerMessage: fromJS({ id: 123 }),
        }

        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(defaultState)}>
                    <TicketMessages {...props} />
                </Provider>
            </QueryClientProvider>,
        )

        expect(screen.getByText('Message')).toBeInTheDocument()
    })

    it('should handle lastCustomerMessage not matching any message', () => {
        const props = {
            ...defaultProps,
            messages: [
                {
                    ...defaultProps.messages[0],
                    id: 123,
                    body_html: 'regular message',
                    sender: {
                        id: 1,
                        name: 'Test User',
                        firstname: 'Test',
                        lastname: 'User',
                        email: 'user@test.com',
                    },
                },
            ],
            lastCustomerMessage: fromJS({ id: 456 }),
        }

        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(defaultState)}>
                    <TicketMessages {...props} />
                </Provider>
            </QueryClientProvider>,
        )

        expect(screen.getByText('Message')).toBeInTheDocument()
    })

    it('should handle messages without IDs in key generation', () => {
        const props = {
            ...defaultProps,
            messages: [
                {
                    ...defaultProps.messages[0],
                    id: undefined,
                    body_html: 'regular message',
                    sender: {
                        id: 1,
                        name: 'Test User',
                        firstname: 'Test',
                        lastname: 'User',
                        email: 'user@test.com',
                    },
                },
            ],
            messagePosition: 5,
        }

        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(defaultState)}>
                    <TicketMessages {...props} />
                </Provider>
            </QueryClientProvider>,
        )

        expect(screen.getByText('Message')).toBeInTheDocument()
    })

    it('should handle multiple messages', () => {
        const props = {
            ...defaultProps,
            messages: [
                {
                    ...defaultProps.messages[0],
                    id: 1,
                    body_html: 'first message',
                    sender: {
                        id: 1,
                        name: 'Test User',
                        firstname: 'Test',
                        lastname: 'User',
                        email: 'user@test.com',
                    },
                },
                {
                    ...defaultProps.messages[0],
                    id: 2,
                    body_html: 'second message',
                    sender: {
                        id: 1,
                        name: 'Test User',
                        firstname: 'Test',
                        lastname: 'User',
                        email: 'user@test.com',
                    },
                },
            ],
        }

        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(defaultState)}>
                    <TicketMessages {...props} />
                </Provider>
            </QueryClientProvider>,
        )

        expect(screen.getAllByText('Message')).toHaveLength(2)
    })

    it('should handle AI agent message selection state', () => {
        getSelectedAIMessageMock.mockReturnValue({
            ticket_id: 1,
            id: 1,
        } as unknown as ReturnType<typeof getSelectedAIMessage>)

        const props = {
            ...defaultProps,
            messages: [
                {
                    ...defaultProps.messages[0],
                    id: 1,
                    body_html: 'regular message',
                    sender: {
                        id: 1,
                        name: 'Test User',
                        firstname: 'Test',
                        lastname: 'User',
                        email: 'user@test.com',
                    },
                },
            ],
        }

        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(defaultState)}>
                    <TicketMessages {...props} />
                </Provider>
            </QueryClientProvider>,
        )

        expect(screen.getByText('Message')).toBeInTheDocument()
    })

    it('should handle ticket after feedback collection period', () => {
        useTicketIsAfterFeedbackCollectionPeriodMock.mockReturnValue(true)

        const props = {
            ...defaultProps,
            messages: [
                {
                    ...defaultProps.messages[0],
                    body_html: 'regular message',
                    sender: {
                        id: 1,
                        name: 'Test User',
                        firstname: 'Test',
                        lastname: 'User',
                        email: 'user@test.com',
                    },
                },
            ],
        }

        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(defaultState)}>
                    <TicketMessages {...props} />
                </Provider>
            </QueryClientProvider>,
        )

        expect(screen.getByText('Message')).toBeInTheDocument()
    })

    it('should not log events when banner type is empty', () => {
        mockUseFlag.mockReturnValue(true)

        const props = {
            ...defaultProps,
            messages: [
                {
                    ...defaultProps.messages[0],
                    body_html: 'regular message',
                    sender: {
                        id: 1,
                        name: 'Regular User',
                        firstname: 'Regular',
                        lastname: 'User',
                        email: 'regular@test.com',
                    }, // Not AI agent
                },
            ],
        }

        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(defaultState)}>
                    <TicketMessages {...props} />
                </Provider>
            </QueryClientProvider>,
        )

        expect(logEventMock).not.toHaveBeenCalled()
    })

    it('should handle audit log events display setting', () => {
        getShouldDisplayAuditLogEventsMock.mockReturnValue(false)

        const props = {
            ...defaultProps,
            messages: [
                {
                    ...defaultProps.messages[0],
                    body_html: 'regular message',
                    sender: {
                        id: 1,
                        name: 'Test User',
                        firstname: 'Test',
                        lastname: 'User',
                        email: 'user@test.com',
                    },
                },
            ],
        }

        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(defaultState)}>
                    <TicketMessages {...props} />
                </Provider>
            </QueryClientProvider>,
        )

        expect(screen.getByText('Message')).toBeInTheDocument()
    })
})
