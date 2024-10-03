import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {render, screen} from '@testing-library/react'
import {QueryClientProvider} from '@tanstack/react-query'

import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {assumeMock} from 'utils/testing'
import {RootState, StoreDispatch} from 'state/types'
import {TicketAIAgentFeedbackTab} from 'state/ui/ticketAIAgentFeedback/constants'
import {useGetAiAgentFeedback} from 'models/aiAgentFeedback/queries'
import {getSelectedAIMessage} from 'state/ui/ticketAIAgentFeedback'
import {useAIAgentSendFeedback} from 'pages/tickets/detail/hooks/useAIAgentSendFeedback'
import {TicketMessage} from 'models/ticket/types'
import AIAgentFeedbackBar, {
    FEEDBACK_TICKET_SUMMARY_TEST_ID,
    ticketFeedbackSummary,
} from '../AIAgentFeedbackBar'
import {messageFeedback} from './fixtures'

jest.mock('../AIAgentMessageFeedback', () => () => (
    <div data-testid="message-feedback"></div>
))
jest.mock('../AIAgentTicketFeedback', () => () => (
    <div data-testid="ticket-feedback"></div>
))
jest.mock('models/aiAgentFeedback/queries')
jest.mock('state/ui/ticketAIAgentFeedback')
jest.mock('pages/tickets/detail/hooks/useAIAgentSendFeedback')

const getSelectedAIMessageMock = assumeMock(getSelectedAIMessage)
const useAIAgentSendFeedbackMock = assumeMock(useAIAgentSendFeedback)
const useGetAiAgentFeedbackMock = assumeMock(useGetAiAgentFeedback)

const mockMessage = {
    ticket_id: 1,
    id: messageFeedback.messageId,
} as unknown as TicketMessage

const queryClient = mockQueryClient()

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const store = mockStore({
    ui: {
        ticketAIAgentFeedback: {
            activeTab: TicketAIAgentFeedbackTab.AIAgent,
            message: mockMessage,
        },
    },
} as RootState)

describe('AIAgentFeedbackBar', () => {
    beforeEach(() => {
        useGetAiAgentFeedbackMock.mockReturnValue({
            data: {
                data: {
                    messages: [messageFeedback, mockMessage],
                    shopName: 'shopName',
                    shopType: 'shopify',
                },
            },
            isLoading: false,
            isError: false,
        } as any)
        getSelectedAIMessageMock.mockReturnValue(mockMessage)
        useAIAgentSendFeedbackMock.mockReturnValue({
            aiAgentSendFeedback: jest.fn(),
            aiAgentDeleteFeedback: jest.fn(),
        })
    })

    it('renders feedback summary per ticket if no message is selected', () => {
        getSelectedAIMessageMock.mockReturnValue(undefined)

        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <AIAgentFeedbackBar />
                </Provider>
            </QueryClientProvider>
        )

        expect(
            screen.getByTestId(FEEDBACK_TICKET_SUMMARY_TEST_ID)
        ).toHaveTextContent(ticketFeedbackSummary)
        expect(screen.getByTestId('ticket-feedback')).toBeInTheDocument()
    })

    it('renders feedback summary per message if message is selected', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <AIAgentFeedbackBar />
                </Provider>
            </QueryClientProvider>
        )

        expect(
            screen.getByTestId(FEEDBACK_TICKET_SUMMARY_TEST_ID)
        ).toHaveTextContent(messageFeedback.summary!)
        expect(screen.getByTestId('message-feedback')).toBeInTheDocument()
    })

    it('should not render AutoQA if the feature flag is disabled', () => {
        const {queryByText} = render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <AIAgentFeedbackBar />
                </Provider>
            </QueryClientProvider>
        )

        expect(queryByText('AutoQA')).not.toBeInTheDocument()
    })

    it('should render ticket summary when ticket message summary is not present', () => {
        useGetAiAgentFeedbackMock.mockReturnValue({
            data: {
                data: {
                    messages: [
                        {...messageFeedback, summary: undefined},
                        mockMessage,
                    ],
                },
            },
            isLoading: false,
        } as any)
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <AIAgentFeedbackBar />
                </Provider>
            </QueryClientProvider>
        )
        expect(
            screen.getByTestId(FEEDBACK_TICKET_SUMMARY_TEST_ID)
        ).toHaveTextContent(ticketFeedbackSummary)
    })
})
