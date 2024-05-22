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
import {TicketMessage} from 'models/ticket/types'
import AIAgentFeedbackBar, {
    FEEDBACK_MESSAGE_ACTIONS_TEST_ID,
    FEEDBACK_MESSAGE_CONTAINER_TEST_ID,
    FEEDBACK_MESSAGE_GUIDANCE_TEST_ID,
    FEEDBACK_MESSAGE_KNOWLEDGE_TEST_ID,
    FEEDBACK_TICKET_SUMMARY_TEST_ID,
} from '../AIAgentFeedbackBar'
import {messageFeedback} from './fixtures'

jest.mock('models/aiAgentFeedback/queries')
jest.mock('state/ui/ticketAIAgentFeedback')

const getSelectedAIMessageMock = assumeMock(getSelectedAIMessage)
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
                    messages: [messageFeedback],
                    shopName: 'shopName',
                    shopType: 'shopify',
                },
            },
            isLoading: false,
            isError: false,
        } as any)
        getSelectedAIMessageMock.mockReturnValue(mockMessage)
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
        ).toBeInTheDocument()
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
            screen.queryByTestId(FEEDBACK_TICKET_SUMMARY_TEST_ID)
        ).not.toBeInTheDocument()

        expect(
            screen.getByTestId(FEEDBACK_MESSAGE_CONTAINER_TEST_ID)
        ).toBeInTheDocument()

        expect(screen.getByText(messageFeedback.summary)).toBeInTheDocument()

        expect(
            screen.getAllByTestId(FEEDBACK_MESSAGE_ACTIONS_TEST_ID).length
        ).toBe(messageFeedback.actions.length)
    })

    it.each([
        {testId: FEEDBACK_MESSAGE_ACTIONS_TEST_ID, name: 'Actions'},
        {testId: FEEDBACK_MESSAGE_GUIDANCE_TEST_ID, name: 'Guidance'},
        {testId: FEEDBACK_MESSAGE_KNOWLEDGE_TEST_ID, name: 'Knowledge'},
    ])('$name - renders thumbs up icon for positive feedback', ({testId}) => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <AIAgentFeedbackBar />
                </Provider>
            </QueryClientProvider>
        )

        const positiveFeedbackElement = screen
            .getAllByTestId(testId)[0]
            .querySelector('.feedback i.material-icons')?.parentElement
        expect(positiveFeedbackElement).toHaveClass('positiveFeedback')
    })

    it.each([
        {testId: FEEDBACK_MESSAGE_ACTIONS_TEST_ID, name: 'Actions'},
        {testId: FEEDBACK_MESSAGE_GUIDANCE_TEST_ID, name: 'Guidance'},
        {testId: FEEDBACK_MESSAGE_KNOWLEDGE_TEST_ID, name: 'Knowledge'},
    ])('$name - renders thumbs down icon for negative feedback', ({testId}) => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <AIAgentFeedbackBar />
                </Provider>
            </QueryClientProvider>
        )

        const negativeFeedbackElement = screen
            .getAllByTestId(testId)[1]
            .querySelector('.feedback i.material-icons')?.parentElement
        expect(negativeFeedbackElement).toHaveClass('negativeFeedback')
    })

    it.each([
        {testId: FEEDBACK_MESSAGE_ACTIONS_TEST_ID, name: 'Actions'},
        {testId: FEEDBACK_MESSAGE_GUIDANCE_TEST_ID, name: 'Guidance'},
        {testId: FEEDBACK_MESSAGE_KNOWLEDGE_TEST_ID, name: 'Knowledge'},
    ])('$name - renders thumbs up icon for neutral feedback', ({testId}) => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <AIAgentFeedbackBar />
                </Provider>
            </QueryClientProvider>
        )

        const feedbackActionsElement = screen
            .getAllByTestId(testId)[2]
            .querySelector('.feedback i.material-icons-outlined')?.parentElement
        expect(feedbackActionsElement).not.toHaveClass('positiveFeedback')
        expect(feedbackActionsElement).not.toHaveClass('negativeFeedback')
    })
})
