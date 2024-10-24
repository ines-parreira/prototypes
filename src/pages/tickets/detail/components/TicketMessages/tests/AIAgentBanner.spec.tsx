import {QueryClientProvider} from '@tanstack/react-query'
import {render, screen} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {
    useGetAiAgentFeedback,
    useSubmitAIAgentTicketMessagesFeedback,
} from 'models/aiAgentFeedback/queries'
import {TicketMessage} from 'models/ticket/types'
import {RootState, StoreDispatch} from 'state/types'
import {TicketAIAgentFeedbackTab} from 'state/ui/ticketAIAgentFeedback/constants'

import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {assumeMock} from 'utils/testing'

import AIAgentBanner from '../AIAgentBanner'

jest.mock('../AIAgentFeedback', () => () => <div data-testid="feedback" />)

jest.mock('models/aiAgentFeedback/queries')

const useGetAiAgentFeedbackMock = assumeMock(useGetAiAgentFeedback)
const useSubmitAIAgentTicketMessagesFeedbackMock = assumeMock(
    useSubmitAIAgentTicketMessagesFeedback
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
                data: {messages: [], shopName: 'shopName', shopType: 'shopify'},
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
        const {container} = render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <AIAgentBanner message={mockMessage} />
                </Provider>
            </QueryClientProvider>
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
                                {resourceId: 1, feedback: 'thumbs_up'},
                                {resourceId: 2, feedback: 'thumbs_up'},
                                {resourceId: 3, feedback: 'thumbs_down'},
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

        render(<AIAgentBanner message={{...mockMessage, public: false}} />)

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
                                {resourceId: 1, feedback: 'thumbs_up'},
                                {resourceId: 2, feedback: 'thumbs_up'},
                                {resourceId: 3, feedback: 'thumbs_down'},
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

        render(<AIAgentBanner message={{...mockMessage, public: true}} />)

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
                                {resourceId: 1, feedback: 'thumbs_up'},
                                {resourceId: 2, feedback: 'thumbs_up'},
                                {resourceId: 3, feedback: 'thumbs_up'},
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

        render(<AIAgentBanner message={mockMessage} />)

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
                                {resourceId: 1, feedback: 'thumbs_up'},
                                {resourceId: 2, feedback: 'thumbs_up'},
                                {resourceId: 3, feedback: 'thumbs_down'},
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

        render(<AIAgentBanner message={mockMessage} />)

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

        const {getByText} = render(
            <AIAgentBanner message={{...mockMessage, public: false}} />
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

        const {queryByText} = render(
            <AIAgentBanner
                message={{
                    ...mockMessage,
                    public: false,
                    body_html: 'body_html123',
                }}
            />
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

        const {container} = render(<AIAgentBanner message={mockMessage} />)

        expect(container.firstChild).toHaveClass('hasError')
    })
})
