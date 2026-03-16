import { TicketInfobarTab, useTicketInfobarNavigation } from '@repo/navigation'
import { assumeMock } from '@repo/testing'
import { fireEvent, render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { account } from 'fixtures/account'
import { ticket } from 'fixtures/ticket'
import { user } from 'fixtures/users'
import useAppDispatch from 'hooks/useAppDispatch'
import {
    useGetAiAgentFeedback,
    useSubmitAIAgentTicketMessagesFeedback,
} from 'models/aiAgentFeedback/queries'
import type { TicketMessage } from 'models/ticket/types'
import { useCanAccessAIFeedback } from 'pages/tickets/detail/components/TicketFeedback/hooks/useCanAccessAIFeedback'
import { isSessionImpersonated } from 'services/activityTracker/utils'
import type { RootState, StoreDispatch } from 'state/types'

import SimplifiedAIAgentBanner from '../SimplifiedAIAgentBanner'

jest.mock('../AiAgentFailedWorkflowMessage', () => () => (
    <div data-testid="failed-workflow-message" />
))

jest.mock('@repo/navigation', () => ({
    ...jest.requireActual('@repo/navigation'),
    useTicketInfobarNavigation: jest.fn(),
}))
const useTicketInfobarNavigationMock = useTicketInfobarNavigation as jest.Mock

jest.mock(
    'pages/tickets/detail/components/TicketFeedback/hooks/useCanAccessAIFeedback',
)
const useCanAccessAIFeedbackMock = assumeMock(useCanAccessAIFeedback)

jest.mock('models/aiAgentFeedback/queries')
jest.mock('hooks/useAppDispatch')
jest.mock('../../../hooks/useAIAgentResourcesWithFeedback')
jest.mock('services/activityTracker/utils', () => ({
    isSessionImpersonated: jest.fn(() => false),
}))

const useGetAiAgentFeedbackMock = assumeMock(useGetAiAgentFeedback)
const useSubmitAIAgentTicketMessagesFeedbackMock = assumeMock(
    useSubmitAIAgentTicketMessagesFeedback,
)
const useAppDispatchMock = assumeMock(useAppDispatch)

const mockMessage = {
    ticket_id: 1,
    id: '1',
    public: true,
} as unknown as TicketMessage

const defaultStore: Partial<RootState> = {
    currentAccount: fromJS(account),
    currentUser: fromJS(user),
    ticket: fromJS(ticket),
}

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const store = mockStore(defaultStore as RootState)
store.dispatch = jest.fn()
const submitAIAgentTicketMessagesFeedbackMock = jest.fn()

describe('SimplifiedSimplifiedAIAgentBanner', () => {
    let onChangeTab: jest.Mock

    beforeEach(() => {
        const dispatch = jest.fn()
        useAppDispatchMock.mockReturnValue(dispatch)

        useCanAccessAIFeedbackMock.mockReturnValue(true)

        useGetAiAgentFeedbackMock.mockReturnValue({
            data: {
                data: {
                    messages: [],
                    shopName: 'shopName',
                    shopType: 'shopify',
                },
            },
            isLoading: false,
            isError: false,
        } as any)

        useSubmitAIAgentTicketMessagesFeedbackMock.mockImplementation(() => {
            return {
                mutate: submitAIAgentTicketMessagesFeedbackMock,
                mutateAsync: submitAIAgentTicketMessagesFeedbackMock,
            } as unknown as ReturnType<
                typeof useSubmitAIAgentTicketMessagesFeedback
            >
        })

        onChangeTab = jest.fn()
        useTicketInfobarNavigationMock.mockReturnValue({
            activeTab: TicketInfobarTab.AIFeedback,
            onChangeTab,
        })
    })

    it("doesn't render the component when loading", () => {
        useGetAiAgentFeedbackMock.mockReturnValue({
            isLoading: true,
            isError: false,
        } as any)
        const { container } = render(
            <Provider store={store}>
                <SimplifiedAIAgentBanner
                    message={mockMessage}
                    messages={[mockMessage]}
                />
            </Provider>,
        )

        expect(container).toBeEmptyDOMElement()
    })

    it('should render feedback when not allowed but message is public', () => {
        useGetAiAgentFeedbackMock.mockReturnValue({
            data: {
                data: {
                    messages: [
                        {
                            messageId: mockMessage.id,
                            summary: 'summary',
                            feedbackOnResource: [
                                { resourceId: 1, feedback: 'thumbs_up' },
                                { resourceId: 2, feedback: 'thumbs_up' },
                                { resourceId: 3, feedback: 'thumbs_down' },
                            ],
                            allowsFeedback: false,
                        },
                    ],
                    shopName: 'shopName',
                    shopType: 'shopify',
                },
            },
            isLoading: false,
            isError: false,
        } as any)

        render(
            <Provider store={store}>
                <SimplifiedAIAgentBanner
                    message={{ ...mockMessage, public: true }}
                    messages={[mockMessage]}
                />
            </Provider>,
        )

        expect(screen.getByText('summary')).toBeInTheDocument()
    })

    it('should render message in bold', () => {
        useGetAiAgentFeedbackMock.mockReturnValue({
            data: {
                data: {
                    messages: [
                        {
                            messageId: mockMessage.id,
                            summary: 'summary',
                            feedbackOnResource: [
                                { resourceId: 1, feedback: 'thumbs_up' },
                                { resourceId: 2, feedback: 'thumbs_up' },
                                { resourceId: 3, feedback: 'thumbs_down' },
                            ],
                        },
                    ],
                    shopName: 'shopName',
                    shopType: 'shopify',
                },
            },
            isLoading: false,
            isError: false,
        } as any)

        render(
            <Provider store={store}>
                <SimplifiedAIAgentBanner
                    message={mockMessage}
                    messages={[mockMessage]}
                />
            </Provider>,
        )

        const message = screen.getByText('summary')

        expect(message).toBeInTheDocument()
    })

    it('should fall back to body_html if no summary was provided', () => {
        useGetAiAgentFeedbackMock.mockReturnValue({
            data: {
                data: {
                    messages: [
                        {
                            messageId: mockMessage.id,
                            summary: null,
                        },
                    ],
                    shopName: 'shopName',
                    shopType: 'shopify',
                },
            },
            isLoading: false,
            isError: false,
        } as any)

        const { queryByText } = render(
            <Provider store={store}>
                <SimplifiedAIAgentBanner
                    message={{
                        ...mockMessage,
                        public: false,
                        body_html: 'body_html123',
                    }}
                    messages={[mockMessage]}
                />
            </Provider>,
        )

        const summary = queryByText('summary')

        expect(summary).not.toBeInTheDocument()

        const bodyHtml = queryByText('body_html123')

        expect(bodyHtml).toBeInTheDocument()
    })

    it('should render error message', () => {
        useGetAiAgentFeedbackMock.mockReturnValue({
            data: {
                data: {
                    messages: [
                        {
                            messageId: mockMessage.id,
                            summary: '<div data-error-summary="true">bye</div>',
                        },
                    ],
                    shopName: 'shopName',
                    shopType: 'shopify',
                },
            },
            isLoading: false,
            isError: false,
        } as any)

        const { container } = render(
            <Provider store={store}>
                <SimplifiedAIAgentBanner
                    message={mockMessage}
                    messages={[mockMessage]}
                />
            </Provider>,
        )

        expect(container.firstChild).toHaveClass('hasError')
    })

    it('should render with the failed workflow message component when the message has failed workflow execution metadata', () => {
        useGetAiAgentFeedbackMock.mockReturnValue({
            data: {
                data: {
                    messages: [
                        {
                            messageId: mockMessage.id,
                            summary: 'summary',
                        },
                    ],
                },
            },
            isLoading: false,
            isError: false,
        } as any)

        const messageWithFailedWorkflow = {
            ...mockMessage,
            meta: {
                workflow_execution: {
                    success: false,
                    configuration_id: '123',
                    execution_id: '456',
                },
            },
        }

        render(
            <Provider store={store}>
                <SimplifiedAIAgentBanner
                    message={messageWithFailedWorkflow}
                    messages={[messageWithFailedWorkflow]}
                />
            </Provider>,
        )

        expect(
            screen.getByTestId('failed-workflow-message'),
        ).toBeInTheDocument()
    })

    it('should render the failed workflow message component when the message has existing valid workflow failure message and no meta data', () => {
        useGetAiAgentFeedbackMock.mockReturnValue({
            data: {
                data: {
                    messages: [
                        {
                            messageId: mockMessage.id,
                            summary: 'summary',
                        },
                    ],
                },
            },
            isLoading: false,
            isError: false,
        } as any)

        const legacyWorkflowMessage = {
            ...mockMessage,
            body_html:
                '<div data-error-summary="true">AI Agent did not send a response and handed over the ticket to your team because it failed to execute one or more steps in this Action. <a href="/app/automation/shopify/test-store/ai-agent/actions/events/actcion-id?execution_id=execution-id">View the Action events</a> for more details.</div>',
            meta: null,
        }

        render(
            <Provider store={store}>
                <SimplifiedAIAgentBanner
                    message={legacyWorkflowMessage}
                    messages={[legacyWorkflowMessage]}
                />
            </Provider>,
        )

        expect(
            screen.getByTestId('failed-workflow-message'),
        ).toBeInTheDocument()
    })

    it('should call onChangeTab when click on "Give Feedback" button outside the banner', () => {
        useGetAiAgentFeedbackMock.mockReturnValue({
            data: {
                data: {
                    messages: [
                        {
                            messageId: '1',
                            summary: 'summary',
                        },
                    ],
                    shopName: 'shopName',
                    shopType: 'shopify',
                },
            },
            isLoading: false,
            isError: false,
        } as any)
        useTicketInfobarNavigationMock.mockReturnValue({
            activeTab: TicketInfobarTab.Customer,
            onChangeTab,
        })

        render(
            <Provider store={store}>
                <SimplifiedAIAgentBanner
                    message={{ ...mockMessage, public: false }}
                    messages={[mockMessage]}
                />
            </Provider>,
        )

        const feedbackButton = screen.getByText('Give Feedback')
        expect(feedbackButton).toBeInTheDocument()
        expect(feedbackButton).not.toHaveClass('activeButton')

        fireEvent.click(feedbackButton)

        expect(onChangeTab).toHaveBeenCalledWith(TicketInfobarTab.AIFeedback)
    })

    it('should have "activeButton" class name when selected tab is AI_AGENT', () => {
        useGetAiAgentFeedbackMock.mockReturnValue({
            data: {
                data: {
                    messages: [
                        {
                            messageId: '1',
                            summary: 'summary',
                        },
                    ],
                    shopName: 'shopName',
                    shopType: 'shopify',
                },
            },
            isLoading: false,
            isError: false,
        } as any)

        render(
            <Provider store={store}>
                <SimplifiedAIAgentBanner
                    message={{ ...mockMessage, public: false }}
                    messages={[mockMessage]}
                />
            </Provider>,
        )

        const feedbackButton = screen.getByRole('button')

        expect(feedbackButton).toHaveClass('activeButton')
    })

    it('should display execution ID when user is impersonated and execution ID exists', () => {
        const executionId = 'test-execution-id-123'
        const isSessionImpersonatedMock = isSessionImpersonated as jest.Mock
        isSessionImpersonatedMock.mockReturnValue(true)

        useGetAiAgentFeedbackMock.mockReturnValue({
            data: {
                data: {
                    messages: [
                        {
                            messageId: '1',
                            summary: 'summary',
                            executionId: executionId,
                        },
                    ],
                    shopName: 'shopName',
                    shopType: 'shopify',
                },
            },
            isLoading: false,
            isError: false,
        } as any)

        render(
            <Provider store={store}>
                <SimplifiedAIAgentBanner
                    message={{ ...mockMessage, public: false }}
                    messages={[mockMessage]}
                />
            </Provider>,
        )

        expect(
            screen.getByText(`Execution ID: ${executionId}`),
        ).toBeInTheDocument()

        // Reset the mock
        isSessionImpersonatedMock.mockReturnValue(false)
    })

    it('should not display execution ID when user is not impersonated', () => {
        const executionId = 'test-execution-id-123'
        const isSessionImpersonatedMock = isSessionImpersonated as jest.Mock
        isSessionImpersonatedMock.mockReturnValue(false)

        useGetAiAgentFeedbackMock.mockReturnValue({
            data: {
                data: {
                    messages: [
                        {
                            messageId: '1',
                            summary: 'summary',
                            executionId: executionId,
                        },
                    ],
                    shopName: 'shopName',
                    shopType: 'shopify',
                },
            },
            isLoading: false,
            isError: false,
        } as any)

        render(
            <Provider store={store}>
                <SimplifiedAIAgentBanner
                    message={{ ...mockMessage, public: false }}
                    messages={[mockMessage]}
                />
            </Provider>,
        )

        expect(
            screen.queryByText(`Execution ID: ${executionId}`),
        ).not.toBeInTheDocument()
    })

    describe('Give Feedback role-based visibility', () => {
        beforeEach(() => {
            useGetAiAgentFeedbackMock.mockReturnValue({
                data: {
                    data: {
                        messages: [
                            {
                                messageId: '1',
                                summary: 'summary',
                            },
                        ],
                        shopName: 'shopName',
                        shopType: 'shopify',
                    },
                },
                isLoading: false,
                isError: false,
            } as any)
            useTicketInfobarNavigationMock.mockReturnValue({
                activeTab: TicketInfobarTab.Customer,
                onChangeTab: jest.fn(),
            })
        })

        it('should hide Give Feedback button when user cannot access AI feedback', () => {
            useCanAccessAIFeedbackMock.mockReturnValue(false)

            render(
                <Provider store={store}>
                    <SimplifiedAIAgentBanner
                        message={{ ...mockMessage, public: false }}
                        messages={[mockMessage]}
                    />
                </Provider>,
            )

            expect(screen.queryByText('Give Feedback')).not.toBeInTheDocument()
        })

        it('should show Give Feedback button when user can access AI feedback', () => {
            useCanAccessAIFeedbackMock.mockReturnValue(true)

            render(
                <Provider store={store}>
                    <SimplifiedAIAgentBanner
                        message={{ ...mockMessage, public: false }}
                        messages={[mockMessage]}
                    />
                </Provider>,
            )

            expect(screen.getByText('Give Feedback')).toBeInTheDocument()
        })
    })
})
