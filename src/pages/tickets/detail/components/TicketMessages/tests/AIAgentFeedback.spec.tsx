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
import {MessageFeedback} from 'models/aiAgentFeedback/types'
import {assumeMock} from 'utils/testing'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import AIAgentFeedback, {
    CORRECT_RESPONSE,
    ACCURATE_RESPONSE,
    IMPROVE_RESPONSE,
} from '../AIAgentFeedback'

jest.mock('state/ui/ticketAIAgentFeedback')

const queryClient = mockQueryClient()

const mockMessage = {
    ticket_id: 1,
    id: '1',
    public: true,
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

describe('AIAgentFeedback', () => {
    it('renders the component with accurate response message', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <AIAgentFeedback
                        message={{...mockMessage, public: false}}
                    />
                </Provider>
            </QueryClientProvider>
        )
        expect(screen.getByText(ACCURATE_RESPONSE)).toBeInTheDocument()
    })

    it('renders the component with correct response message', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <AIAgentFeedback message={mockMessage} />
                </Provider>
            </QueryClientProvider>
        )
        expect(screen.getByText(CORRECT_RESPONSE)).toBeInTheDocument()
    })

    it('dispatches the changeActiveTab action when improve response button is clicked', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <AIAgentFeedback message={mockMessage} />
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
                    <AIAgentFeedback message={mockMessage} />
                </Provider>
            </QueryClientProvider>
        )
        expect(
            screen
                .getByRole('button', {name: IMPROVE_RESPONSE})
                .classList.contains('isDisabled')
        ).toBe(true)
    })

    it('shows the thumbs up icon as green when the feedback is positive', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <AIAgentFeedback
                        message={mockMessage}
                        messageFeedback={
                            {
                                messageId: mockMessage.id,
                                actions: [{feedback: 'thumbs_up'}],
                                guidance: [{feedback: 'thumbs_up'}],
                                knowledge: [{feedback: 'thumbs_up'}],
                                allowsFeedback: true,
                                feedbackOnMessage: [
                                    {
                                        type: 'binary',
                                        feedback: 'thumbs_up',
                                    },
                                ],
                                feedbackOnResource: [],
                            } as unknown as MessageFeedback
                        }
                    />
                </Provider>
            </QueryClientProvider>
        )
        expect(screen.getByText('thumb_up').parentElement).toHaveClass(
            'withFeedback'
        )
    })

    it('shows the thumbs up icon as red when the feedback is negative', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <AIAgentFeedback
                        message={{...mockMessage, public: false}}
                        messageFeedback={
                            {
                                messageId: mockMessage.id,
                                actions: [{feedback: 'thumbs_up'}],
                                guidance: [{feedback: 'thumbs_up'}],
                                knowledge: [{feedback: 'thumbs_down'}],
                                allowsFeedback: true,
                                feedbackOnMessage: [
                                    {
                                        type: 'binary',
                                        feedback: 'thumbs_down',
                                    },
                                ],
                                feedbackOnResource: [],
                            } as unknown as MessageFeedback
                        }
                    />
                </Provider>
            </QueryClientProvider>
        )
        expect(screen.getByText('thumb_down').parentElement).toHaveClass(
            'withFeedback'
        )
    })

    it('shows the thumbs up icon as neutral when not all feedback is positive', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <AIAgentFeedback
                        message={mockMessage}
                        messageFeedback={
                            {
                                messageId: mockMessage.id,
                                actions: [{feedback: 'thumbs_up'}],
                                guidance: [{feedback: null}],
                                knowledge: [{feedback: 'thumbs_up'}],
                                allowsFeedback: true,
                                feedbackOnMessage: [],
                                feedbackOnResource: [],
                            } as unknown as MessageFeedback
                        }
                    />
                </Provider>
            </QueryClientProvider>
        )
        expect(screen.getByText('thumb_up').parentElement).not.toHaveClass(
            'withFeedback'
        )
    })
})
