import React from 'react'

import { assumeMock, userEvent } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { SegmentEvent } from 'common/segment'
import { logEventWithSampling } from 'common/segment/segment'
import { MessageFeedback } from 'models/aiAgentFeedback/types'
import { TicketMessage } from 'models/ticket/types'
import { useAIAgentSendFeedback } from 'pages/tickets/detail/hooks/useAIAgentSendFeedback'
import { getCurrentAccountId } from 'state/currentAccount/selectors'
import { RootState, StoreDispatch } from 'state/types'
import {
    changeActiveTab,
    changeTicketMessage,
    getSelectedAIMessage,
} from 'state/ui/ticketAIAgentFeedback'
import { TicketAIAgentFeedbackTab } from 'state/ui/ticketAIAgentFeedback/constants'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { BANNER_TYPE } from '../../AIAgentFeedbackBar/constants'
import AIAgentFeedback, {
    ACCURATE_RESPONSE,
    CORRECT_RESPONSE,
    REVIEW_RESPONSE,
} from '../AIAgentFeedback'

jest.mock('state/ui/ticketAIAgentFeedback')
jest.mock('common/segment/segment')
jest.mock('state/currentAccount/selectors')
jest.mock('pages/tickets/detail/hooks/useAIAgentSendFeedback')
const queryClient = mockQueryClient()

const mockAccountId = 1
const mockMessage = {
    ticket_id: 1,
    id: '1',
    public: true,
} as unknown as TicketMessage
const mockedChangeActiveTab = assumeMock(changeActiveTab)
const mockedChangeTicketMessage = assumeMock(changeTicketMessage)
const mockedGetSelectedAIMessage = assumeMock(getSelectedAIMessage)
const logEventMock = assumeMock(logEventWithSampling)
const useAIAgentSendFeedbackMock = assumeMock(useAIAgentSendFeedback)
assumeMock(getCurrentAccountId).mockReturnValue(mockAccountId)
const aiAgentSendFeedbackMock = jest.fn()

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const store = mockStore({
    ui: {
        ticketAIAgentFeedback: {
            feedback: {
                activeTab: TicketAIAgentFeedbackTab.AIAgent,
            },
        },
    },
} as RootState)
store.dispatch = jest.fn()

describe('AIAgentFeedback', () => {
    beforeEach(() => {
        useAIAgentSendFeedbackMock.mockReturnValue({
            aiAgentSendFeedback: aiAgentSendFeedbackMock,
            aiAgentDeleteFeedback: jest.fn(),
        })
    })
    it('renders the component with accurate response message', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <AIAgentFeedback
                        message={{ ...mockMessage, public: false }}
                    />
                </Provider>
            </QueryClientProvider>,
        )
        expect(screen.getByText(ACCURATE_RESPONSE)).toBeInTheDocument()
    })

    it('renders the component with correct response message', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <AIAgentFeedback message={mockMessage} />
                </Provider>
            </QueryClientProvider>,
        )
        expect(screen.getByText(CORRECT_RESPONSE)).toBeInTheDocument()
    })

    it('dispatches the changeActiveTab action when improve response button is clicked', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <AIAgentFeedback message={mockMessage} />
                </Provider>
            </QueryClientProvider>,
        )
        userEvent.click(screen.getByText(REVIEW_RESPONSE))

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
            </QueryClientProvider>,
        )
        expect(
            screen.getByRole('button', { name: REVIEW_RESPONSE }),
        ).toBeAriaDisabled()
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
                                actions: [{ feedback: 'thumbs_up' }],
                                guidance: [{ feedback: 'thumbs_up' }],
                                knowledge: [{ feedback: 'thumbs_up' }],
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
            </QueryClientProvider>,
        )
        expect(
            screen.getByRole('button', { name: 'Thumbs up button' }),
        ).toHaveClass('withFeedback')
    })

    it('shows the thumbs up icon as red when the feedback is negative', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <AIAgentFeedback
                        message={{ ...mockMessage, public: false }}
                        messageFeedback={
                            {
                                messageId: mockMessage.id,
                                actions: [{ feedback: 'thumbs_up' }],
                                guidance: [{ feedback: 'thumbs_up' }],
                                knowledge: [{ feedback: 'thumbs_down' }],
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
            </QueryClientProvider>,
        )
        expect(
            screen.getByRole('button', { name: 'Thumbs down button' }),
        ).toHaveClass('withFeedback')
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
                                actions: [{ feedback: 'thumbs_up' }],
                                guidance: [{ feedback: null }],
                                knowledge: [{ feedback: 'thumbs_up' }],
                                allowsFeedback: true,
                                feedbackOnMessage: [],
                                feedbackOnResource: [],
                            } as unknown as MessageFeedback
                        }
                    />
                </Provider>
            </QueryClientProvider>,
        )
        expect(screen.getByText('thumb_up').parentElement).not.toHaveClass(
            'withFeedback',
        )
    })

    it('logs the correct event when thumbs up icon is clicked', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <AIAgentFeedback
                        message={mockMessage}
                        messageFeedback={
                            {
                                messageId: mockMessage.id,
                                actions: [{ feedback: 'thumbs_up' }],
                                guidance: [{ feedback: 'thumbs_up' }],
                                knowledge: [{ feedback: 'thumbs_up' }],
                                allowsFeedback: true,
                                feedbackOnMessage: [],
                                feedbackOnResource: [],
                            } as unknown as MessageFeedback
                        }
                    />
                </Provider>
            </QueryClientProvider>,
        )

        userEvent.click(screen.getByLabelText('Thumbs up button'))
        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.AiAgentFeedbackBannerClicked, // Replace with the specific event name if necessary
            expect.objectContaining({
                accountId: mockAccountId,
                outcome: 'thumbs_up',
                banner: BANNER_TYPE.THUMBS_UP_IMPROVE_RESPONSE,
            }),
        )
    })

    it('logs the correct event when thumbs down icon is clicked', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <AIAgentFeedback
                        message={{ ...mockMessage, public: false }}
                        messageFeedback={
                            {
                                messageId: mockMessage.id,
                                actions: [{ feedback: 'thumbs_down' }],
                                guidance: [{ feedback: 'thumbs_down' }],
                                knowledge: [{ feedback: 'thumbs_down' }],
                                allowsFeedback: true,
                                feedbackOnMessage: [],
                                feedbackOnResource: [],
                            } as unknown as MessageFeedback
                        }
                    />
                </Provider>
            </QueryClientProvider>,
        )

        userEvent.click(screen.getByLabelText('Thumbs down button'))
        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.AiAgentFeedbackBannerClicked,
            expect.objectContaining({
                accountId: mockAccountId,
                banner: BANNER_TYPE.THUMBS_UP_AND_DOWN,
                outcome: 'thumbs_down',
            }),
        )
    })

    it('call submit with feedbackOnResource payload if action feedback is present', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <AIAgentFeedback
                        message={mockMessage}
                        messageFeedback={
                            {
                                messageId: mockMessage.id,
                                actions: [
                                    {
                                        feedback: 'thumbs_up',
                                        id: '1',
                                        type: 'action',
                                    },
                                ],
                                guidance: [],
                                knowledge: [],
                                allowsFeedback: true,
                                feedbackOnMessage: [],
                                feedbackOnResource: [],
                            } as unknown as MessageFeedback
                        }
                    />
                </Provider>
            </QueryClientProvider>,
        )

        userEvent.click(screen.getByLabelText('Thumbs up button'))
        expect(aiAgentSendFeedbackMock).toHaveBeenCalledWith(mockMessage, {
            feedbackOnResource: [
                {
                    feedback: 'thumbs_up',
                    resourceId: '1',
                    resourceType: 'action',
                    type: 'binary',
                },
            ],
            feedbackOnMessage: [],
        })
    })

    it('call submit with feedbackOnMessage payload if no action, guidance and knowledge feedback is present', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <AIAgentFeedback
                        message={mockMessage}
                        messageFeedback={
                            {
                                messageId: mockMessage.id,
                                actions: [],
                                guidance: [],
                                knowledge: [],
                                allowsFeedback: true,
                                feedbackOnMessage: [],
                                feedbackOnResource: [],
                            } as unknown as MessageFeedback
                        }
                    />
                </Provider>
            </QueryClientProvider>,
        )

        userEvent.click(screen.getByLabelText('Thumbs up button'))
        expect(aiAgentSendFeedbackMock).toHaveBeenCalledWith(mockMessage, {
            feedbackOnResource: [],
            feedbackOnMessage: [
                {
                    feedback: 'thumbs_up',
                    type: 'binary',
                },
            ],
        })
    })

    it('do not call submit on thumbs up if positive feedback is already given on message', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <AIAgentFeedback
                        message={mockMessage}
                        messageFeedback={
                            {
                                messageId: mockMessage.id,
                                actions: [{ feedback: 'thumbs_up' }],
                                guidance: [{ feedback: 'thumbs_up' }],
                                knowledge: [{ feedback: 'thumbs_up' }],
                                allowsFeedback: true,
                                feedbackOnMessage: [
                                    { feedback: 'thumbs_up', type: 'binary' },
                                ],
                                feedbackOnResource: [],
                            } as unknown as MessageFeedback
                        }
                    />
                </Provider>
            </QueryClientProvider>,
        )

        userEvent.click(screen.getByLabelText('Thumbs up button'))
        expect(logEventMock).not.toHaveBeenCalled()
        expect(aiAgentSendFeedbackMock).not.toHaveBeenCalled()
    })

    it('do not call submit on thumbs up if positive feedback is already given on all resources', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <AIAgentFeedback
                        message={mockMessage}
                        messageFeedback={
                            {
                                messageId: mockMessage.id,
                                actions: [{ feedback: 'thumbs_up' }],
                                guidance: [{ feedback: 'thumbs_up' }],
                                knowledge: [{ feedback: 'thumbs_up' }],
                                allowsFeedback: true,
                                feedbackOnMessage: [],
                                feedbackOnResource: [
                                    {
                                        feedback: 'thumbs_up',
                                        type: 'binary',
                                        resourceId: '1',
                                        resourceType: 'action',
                                    },
                                    {
                                        feedback: 'thumbs_up',
                                        type: 'binary',
                                        resourceId: '2',
                                        resourceType: 'guidance',
                                    },
                                    {
                                        feedback: 'thumbs_up',
                                        type: 'binary',
                                        resourceId: '3',
                                        resourceType: 'knowledge',
                                    },
                                ],
                            } as unknown as MessageFeedback
                        }
                    />
                </Provider>
            </QueryClientProvider>,
        )

        userEvent.click(screen.getByLabelText('Thumbs up button'))
        expect(logEventMock).not.toHaveBeenCalled()
        expect(aiAgentSendFeedbackMock).not.toHaveBeenCalled()
    })

    it('do not call submit on thumbs down if negative feedback is already given on message', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <AIAgentFeedback
                        message={mockMessage}
                        messageFeedback={
                            {
                                messageId: mockMessage.id,
                                actions: [{ feedback: 'thumbs_down' }],
                                guidance: [{ feedback: 'thumbs_down' }],
                                knowledge: [{ feedback: 'thumbs_down' }],
                                allowsFeedback: true,
                                feedbackOnMessage: [
                                    { feedback: 'thumbs_down', type: 'binary' },
                                ],
                                feedbackOnResource: [],
                            } as unknown as MessageFeedback
                        }
                    />
                </Provider>
            </QueryClientProvider>,
        )

        userEvent.click(screen.getByLabelText('Thumbs down button'))
        expect(logEventMock).not.toHaveBeenCalled()
        expect(aiAgentSendFeedbackMock).not.toHaveBeenCalled()
    })
})
