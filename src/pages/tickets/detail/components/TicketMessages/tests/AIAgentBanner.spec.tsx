import React from 'react'
import {Provider} from 'react-redux'
import {render, screen} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {QueryClientProvider} from '@tanstack/react-query'

import userEvent from '@testing-library/user-event'
import {RootState, StoreDispatch} from 'state/types'
import {
    changeActiveTab,
    changeTicketMessage,
    getSelectedAIMessage,
} from 'state/ui/ticketAIAgentFeedback'
import {TicketAIAgentFeedbackTab} from 'state/ui/ticketAIAgentFeedback/constants'
import {TicketMessage} from 'models/ticket/types'
import {assumeMock} from 'utils/testing'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {useGetAiAgentFeedback} from 'models/aiAgentFeedback/queries'
import AIAgentBanner, {
    ACCURATE_RESPONSE,
    IMPROVE_RESPONSE,
} from '../AIAgentBanner'

jest.mock('state/ui/ticketAIAgentFeedback')
jest.mock('models/aiAgentFeedback/queries')

const useGetAiAgentFeedbackMock = assumeMock(useGetAiAgentFeedback)
const queryClient = mockQueryClient()

const mockMessage = {
    ticket_id: 1,
    id: '1',
} as unknown as TicketMessage
const mockedChangeActiveTab = assumeMock(changeActiveTab)
const mockedChangeTicketMessage = assumeMock(changeTicketMessage)
const mockedGetSelectedAIMessage = assumeMock(getSelectedAIMessage)

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
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <AIAgentBanner message={mockMessage} />
                </Provider>
            </QueryClientProvider>
        )
        expect(screen.queryByText(ACCURATE_RESPONSE)).not.toBeInTheDocument()
    })

    it('renders the component correctly', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <AIAgentBanner message={mockMessage} />
                </Provider>
            </QueryClientProvider>
        )
        expect(screen.getByText(ACCURATE_RESPONSE)).toBeInTheDocument()
    })

    it('dispatches the changeActiveTab action when improve response button is clicked', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <AIAgentBanner message={mockMessage} />
                </Provider>
            </QueryClientProvider>
        )
        userEvent.click(screen.getByText(IMPROVE_RESPONSE))

        expect(mockedChangeActiveTab).toHaveBeenCalledWith({
            activeTab: TicketAIAgentFeedbackTab.AIAgent,
        })
        expect(mockedChangeTicketMessage).toHaveBeenCalledWith({
            message: mockMessage,
        })
    })

    it('disables the improve response button when selectedAIMessage is equal to message', () => {
        mockedGetSelectedAIMessage.mockReturnValue(mockMessage)
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <AIAgentBanner message={mockMessage} />
                </Provider>
            </QueryClientProvider>
        )
        expect(
            screen.getByText(IMPROVE_RESPONSE).classList.contains('isDisabled')
        ).toBe(true)
    })

    it('shows the thumbs up icon as green when the feedback is positive', () => {
        useGetAiAgentFeedbackMock.mockReturnValue({
            data: {
                data: {
                    messages: [
                        {
                            messageId: mockMessage.id,
                            actions: [{feedback: 1}],
                            guidance: [{feedback: 1}],
                            knowledge: [{feedback: 1}],
                        },
                    ],
                },
            },
            isLoading: false,
            isError: false,
        } as any)
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <AIAgentBanner message={mockMessage} />
                </Provider>
            </QueryClientProvider>
        )
        expect(screen.getByText('thumb_up').parentElement).toHaveClass(
            'positiveFeedback'
        )
    })

    it('shows the thumbs up icon as neutral when not all feedback is positive', () => {
        useGetAiAgentFeedbackMock.mockReturnValue({
            data: {
                data: {
                    messages: [
                        {
                            messageId: mockMessage.id,
                            actions: [{feedback: 1}],
                            guidance: [{feedback: 0}],
                            knowledge: [{feedback: 1}],
                        },
                    ],
                },
            },
            isLoading: false,
            isError: false,
        } as any)
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <AIAgentBanner message={mockMessage} />
                </Provider>
            </QueryClientProvider>
        )
        expect(screen.getByText('thumb_up').parentElement).not.toHaveClass(
            'positiveFeedback'
        )
    })
})
