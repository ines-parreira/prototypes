import { fireEvent, render, screen } from '@testing-library/react'
import configureMockStore from 'redux-mock-store'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {
    useGetAiAgentFeedback,
    useSubmitAIAgentTicketMessagesFeedback,
} from 'models/aiAgentFeedback/queries'
import { TicketMessage } from 'models/ticket/types'
import { RootState, StoreDispatch } from 'state/types'
import { TicketAIAgentFeedbackTab } from 'state/ui/ticketAIAgentFeedback/constants'
import { assumeMock } from 'utils/testing'

import SimplifiedAIAgentBanner from '../SimplifiedAIAgentBanner'

jest.mock('../AiAgentFailedWorkflowMessage', () => () => (
    <div data-testid="failed-workflow-message" />
))

jest.mock('models/aiAgentFeedback/queries')
jest.mock('hooks/useAppDispatch')
jest.mock('hooks/useAppSelector')
jest.mock('../../../hooks/useAIAgentResourcesWithFeedback')

const useGetAiAgentFeedbackMock = assumeMock(useGetAiAgentFeedback)
const useSubmitAIAgentTicketMessagesFeedbackMock = assumeMock(
    useSubmitAIAgentTicketMessagesFeedback,
)
const useAppDispatchMock = assumeMock(useAppDispatch)
const useAppSelectorMock = assumeMock(useAppSelector)

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

describe('SimplifiedSimplifiedAIAgentBanner', () => {
    beforeEach(() => {
        const dispatch = jest.fn()
        useAppDispatchMock.mockReturnValue(dispatch)
        useAppSelectorMock.mockImplementation(
            () => TicketAIAgentFeedbackTab.AIAgent,
        )

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
            <SimplifiedAIAgentBanner
                message={mockMessage}
                messages={[mockMessage]}
            />,
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
            <SimplifiedAIAgentBanner
                message={{ ...mockMessage, public: true }}
                messages={[mockMessage]}
            />,
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
            <SimplifiedAIAgentBanner
                message={mockMessage}
                messages={[mockMessage]}
            />,
        )

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
            <SimplifiedAIAgentBanner
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
            <SimplifiedAIAgentBanner
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
            <SimplifiedAIAgentBanner
                message={mockMessage}
                messages={[mockMessage]}
            />,
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
            <SimplifiedAIAgentBanner
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
            meta: null,
        }

        render(
            <SimplifiedAIAgentBanner
                message={legacyWorkflowMessage}
                messages={[legacyWorkflowMessage]}
            />,
        )

        expect(
            screen.getByTestId('failed-workflow-message'),
        ).toBeInTheDocument()
    })

    it('should dispatch changeActiveTab when click on "Give feedback"', () => {
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
            <SimplifiedAIAgentBanner
                message={{ ...mockMessage, public: false }}
                messages={[mockMessage]}
            />,
        )

        const feedbackButton = screen.getByRole('button')

        fireEvent.click(feedbackButton)

        expect(useAppDispatchMock).toHaveBeenCalled()
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
            <SimplifiedAIAgentBanner
                message={{ ...mockMessage, public: false }}
                messages={[mockMessage]}
            />,
        )

        const feedbackButton = screen.getByRole('button')

        expect(feedbackButton).toHaveClass('activeButton')
    })
})
