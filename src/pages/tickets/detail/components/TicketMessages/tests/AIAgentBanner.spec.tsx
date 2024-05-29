import React from 'react'
import {Provider} from 'react-redux'
import {render} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {QueryClientProvider} from '@tanstack/react-query'

import {RootState, StoreDispatch} from 'state/types'
import {TicketAIAgentFeedbackTab} from 'state/ui/ticketAIAgentFeedback/constants'

import {TicketMessage} from 'models/ticket/types'
import {assumeMock} from 'utils/testing'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {useGetAiAgentFeedback} from 'models/aiAgentFeedback/queries'

import AIAgentBanner from '../AIAgentBanner'

jest.mock('../AIAgentFeedback', () => () => <div data-testid="feedback" />)

jest.mock('models/aiAgentFeedback/queries')

const useGetAiAgentFeedbackMock = assumeMock(useGetAiAgentFeedback)
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

describe('AIAgentBanner', () => {
    beforeEach(() => {
        useGetAiAgentFeedbackMock.mockReturnValue({
            data: {
                data: {messages: [], shopName: 'shopName', shopType: 'shopify'},
            },
            isLoading: false,
            isError: false,
        } as any)
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

    it('should not render feedback when allowed', () => {
        const {queryByTestId} = render(<AIAgentBanner message={mockMessage} />)

        expect(queryByTestId('feedback')).not.toBeInTheDocument()
    })

    it('should render feedback when allowed', () => {
        useGetAiAgentFeedbackMock.mockReturnValue({
            data: {
                data: {
                    messages: [
                        {
                            messageId: mockMessage.id,
                            actions: [{feedback: 'thumbs_up'}],
                            guidance: [{feedback: 'thumbs_up'}],
                            knowledge: [{feedback: 'thumbs_up'}],
                            summary: 'summary',
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

        const {getByTestId} = render(<AIAgentBanner message={mockMessage} />)

        expect(getByTestId('feedback')).toBeInTheDocument()
    })

    it('should render message in bold', () => {
        useGetAiAgentFeedbackMock.mockReturnValue({
            data: {
                data: {
                    messages: [
                        {
                            messageId: mockMessage.id,
                            actions: [{feedback: 'thumbs_up'}],
                            guidance: [{feedback: null}],
                            knowledge: [{feedback: 'thumbs_up'}],
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

        const {getByText} = render(<AIAgentBanner message={mockMessage} />)

        const message = getByText('summary')

        expect(message).toBeInTheDocument()
        expect(message).toHaveClass('boldMessage')
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
        expect(message).not.toHaveClass('boldMessage')
    })
})
