import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {
    useGetAiAgentFeedback,
    useSubmitAIAgentTicketMessagesFeedback,
} from 'models/aiAgentFeedback/queries'
import { TicketMessage } from 'models/ticket/types'
import { RootState, StoreDispatch } from 'state/types'
import { TicketAIAgentFeedbackTab } from 'state/ui/ticketAIAgentFeedback/constants'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'

import AIAgentBanner from '../AIAgentBanner'

jest.mock('../AIAgentFeedback', () => () => <div data-testid="feedback" />)
jest.mock('../AiAgentFailedWorkflowMessage', () => () => (
    <div data-testid="failed-workflow-message" />
))

jest.mock('models/aiAgentFeedback/queries')
jest.mock('../../../hooks/useAIAgentResourcesWithFeedback')

const useGetAiAgentFeedbackMock = assumeMock(useGetAiAgentFeedback)
const useSubmitAIAgentTicketMessagesFeedbackMock = assumeMock(
    useSubmitAIAgentTicketMessagesFeedback,
)
const queryClient = mockQueryClient()

const mockMessage = {
    ticket_id: 1,
    id: '1',
    public: true,
} as unknown as TicketMessage

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const store = mockStore({
    ui: {
        ticketAIAgentFeedback: {
            activeTab: TicketAIAgentFeedbackTab.AIAgent,
        },
    },
} as RootState)
store.dispatch = jest.fn()
const submitAIAgentTicketMessagesFeedbackMock = jest.fn()

describe('AIAgentBanner', () => {
    beforeEach(() => {
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
    })

    it("doesn't render the component when loading", () => {
        useGetAiAgentFeedbackMock.mockReturnValue({
            isLoading: true,
            isError: false,
        } as any)
        const { container } = render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <AIAgentBanner
                        message={mockMessage}
                        messages={[mockMessage]}
                    />
                </Provider>
            </QueryClientProvider>,
        )

        expect(container).toBeEmptyDOMElement()
    })

    it('should not render feedback when not allowed', () => {
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
            <AIAgentBanner
                message={{ ...mockMessage, public: false }}
                messages={[mockMessage]}
            />,
        )

        expect(screen.queryByTestId('feedback')).not.toBeInTheDocument()
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
            <AIAgentBanner
                message={{ ...mockMessage, public: true }}
                messages={[mockMessage]}
            />,
        )

        expect(screen.queryByTestId('feedback')).toBeInTheDocument()
    })

    it('should render feedback when allowed', () => {
        useGetAiAgentFeedbackMock.mockReturnValue({
            data: {
                data: {
                    messages: [
                        {
                            messageId: mockMessage.id,
                            summary: 'summary',
                            allowsFeedback: true,
                            feedbackOnResource: [
                                { resourceId: 1, feedback: 'thumbs_up' },
                                { resourceId: 2, feedback: 'thumbs_up' },
                                { resourceId: 3, feedback: 'thumbs_up' },
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

        render(<AIAgentBanner message={mockMessage} messages={[mockMessage]} />)

        expect(screen.getByTestId('feedback')).toBeInTheDocument()
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

        render(<AIAgentBanner message={mockMessage} messages={[mockMessage]} />)

        const message = screen.getByText('summary')

        expect(message).toBeInTheDocument()
        expect(message.parentElement).toHaveClass('boldMessage')
    })

    it('should not render message in bold', () => {
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

        const { getByText } = render(
            <AIAgentBanner
                message={{ ...mockMessage, public: false }}
                messages={[mockMessage]}
            />,
        )

        const message = getByText('summary')

        expect(message).toBeInTheDocument()
        expect(message.parentElement).not.toHaveClass('boldMessage')
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
            <AIAgentBanner
                message={{
                    ...mockMessage,
                    public: false,
                    body_html: 'body_html123',
                }}
                messages={[mockMessage]}
            />,
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
            <AIAgentBanner message={mockMessage} messages={[mockMessage]} />,
        )

        expect(container.firstChild).toHaveClass('hasError')
    })
    it('should render the feedback if at last one message of the group matches with the returned feedback', () => {
        const messageWithFeedback = { ...mockMessage, id: 2 }
        const lastGroupMessageWithoutFeedback = { ...mockMessage, id: 3 }

        useGetAiAgentFeedbackMock.mockReturnValue({
            data: {
                data: {
                    messages: [
                        {
                            messageId: messageWithFeedback.id,
                            summary: 'summary',
                            feedbackOnResource: [
                                { resourceId: 1, feedback: 'thumbs_up' },
                                { resourceId: 2, feedback: 'thumbs_up' },
                                { resourceId: 3, feedback: 'thumbs_down' },
                            ],
                            allowsFeedback: true,
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
            <AIAgentBanner
                message={mockMessage}
                messages={[
                    mockMessage,
                    messageWithFeedback,
                    lastGroupMessageWithoutFeedback,
                ]}
            />,
        )

        expect(screen.queryByTestId('feedback')).toBeInTheDocument()
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
            <AIAgentBanner
                message={messageWithFailedWorkflow}
                messages={[messageWithFailedWorkflow]}
            />,
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
            meta: null, // Ensure no workflow_execution metadata
        }

        render(
            <AIAgentBanner
                message={legacyWorkflowMessage}
                messages={[legacyWorkflowMessage]}
            />,
        )

        expect(
            screen.getByTestId('failed-workflow-message'),
        ).toBeInTheDocument()
    })
})
