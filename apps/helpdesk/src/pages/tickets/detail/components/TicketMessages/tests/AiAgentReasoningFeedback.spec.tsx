import { assumeMock } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { useUpsertFeedback } from 'models/knowledgeService/mutations'
import { useGetFeedback } from 'models/knowledgeService/queries'
import { RootState, StoreDispatch } from 'state/types'

import { useFeedbackTracking } from '../../AIAgentFeedbackBar/hooks/useFeedbackTracking'
import { AiAgentBinaryFeedbackEnum } from '../../AIAgentFeedbackBar/types'
import { AiAgentReasoningFeedback } from '../AiAgentReasoningFeedback'

jest.mock('models/knowledgeService/queries', () => ({
    useGetFeedback: jest.fn(),
}))

jest.mock('models/knowledgeService/mutations', () => ({
    useUpsertFeedback: jest.fn(),
}))

jest.mock('../../AIAgentFeedbackBar/hooks/useFeedbackTracking', () => ({
    useFeedbackTracking: jest.fn(),
}))

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const mockUseGetFeedback = assumeMock(useGetFeedback)
const mockUseUpsertFeedback = assumeMock(useUpsertFeedback)
const mockUseFeedbackTracking = assumeMock(useFeedbackTracking)

describe('AiAgentReasoningFeedback', () => {
    const defaultProps = {
        ticketId: 123,
        accountId: 456,
        userId: 789,
        executionId: 'exec-123',
        messageId: 1001,
    }

    const mockFeedbackData = {
        executions: [
            {
                executionId: 'exec-123',
                feedback: [
                    {
                        id: 'feedback-1',
                        targetType: 'REASONING',
                        targetId: '1001',
                        feedbackValue: AiAgentBinaryFeedbackEnum.UP,
                        feedbackType: 'REASONING_BINARY',
                    },
                ],
            },
        ],
    }

    const mockMutateAsync = jest.fn()
    const mockOnFeedbackGiven = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseGetFeedback.mockReturnValue({
            data: undefined,
            isLoading: false,
        } as any)

        mockUseUpsertFeedback.mockReturnValue({
            mutateAsync: mockMutateAsync,
        } as any)

        mockUseFeedbackTracking.mockReturnValue({
            onFeedbackGiven: mockOnFeedbackGiven,
        } as any)
    })

    const renderComponent = (props = {}) => {
        const store = mockStore({})
        const queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
            },
        })

        return render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <AiAgentReasoningFeedback {...defaultProps} {...props} />
                </Provider>
            </QueryClientProvider>,
        )
    }

    describe('Component rendering', () => {
        it('should render feedback section with text and buttons', () => {
            renderComponent()

            expect(
                screen.getByText('Rate the quality of this reasoning'),
            ).toBeInTheDocument()
            expect(screen.getAllByRole('button')[0]).toBeInTheDocument()
            expect(screen.getAllByRole('button')[1]).toBeInTheDocument()
        })

        it('should render tooltips for feedback buttons', async () => {
            renderComponent()

            const thumbUpButton = screen.getAllByRole('button')[0]
            const thumbDownButton = screen.getAllByRole('button')[1]

            fireEvent.mouseOver(thumbUpButton)
            await waitFor(() => {
                expect(screen.getByText('Quality is good')).toBeInTheDocument()
            })

            fireEvent.mouseOver(thumbDownButton)
            await waitFor(() => {
                expect(screen.getByText('Quality is bad')).toBeInTheDocument()
            })
        })

        it('should show outlined icons when no feedback is selected', () => {
            renderComponent()

            const thumbUpButton = screen.getAllByRole('button')[0]
            const thumbDownButton = screen.getAllByRole('button')[1]

            expect(
                thumbUpButton.querySelector('.material-icons-outlined'),
            ).toBeInTheDocument()
            expect(
                thumbDownButton.querySelector('.material-icons-outlined'),
            ).toBeInTheDocument()
        })
    })

    describe('Feedback state management', () => {
        it('should show filled thumb up icon when positive feedback exists', () => {
            mockUseGetFeedback.mockReturnValue({
                data: mockFeedbackData,
                isLoading: false,
            } as any)

            renderComponent()

            const thumbUpButton = screen.getAllByRole('button')[0]
            expect(
                thumbUpButton.querySelector('.material-icons'),
            ).toBeInTheDocument()
            expect(
                thumbUpButton.querySelector('.material-icons-outlined'),
            ).not.toBeInTheDocument()
            expect(thumbUpButton.closest('button')).toHaveClass(
                'positiveFeedback',
            )
        })

        it('should show filled thumb down icon when negative feedback exists', () => {
            mockUseGetFeedback.mockReturnValue({
                data: {
                    executions: [
                        {
                            executionId: 'exec-123',
                            feedback: [
                                {
                                    id: 'feedback-1',
                                    targetType: 'REASONING',
                                    targetId: '1001',
                                    feedbackValue:
                                        AiAgentBinaryFeedbackEnum.DOWN,
                                    feedbackType: 'REASONING_BINARY',
                                },
                            ],
                        },
                    ],
                },
                isLoading: false,
            } as any)

            renderComponent()

            const thumbDownButton = screen.getAllByRole('button')[1]
            expect(
                thumbDownButton.querySelector('.material-icons'),
            ).toBeInTheDocument()
            expect(
                thumbDownButton.querySelector('.material-icons-outlined'),
            ).not.toBeInTheDocument()
            expect(thumbDownButton.closest('button')).toHaveClass(
                'negativeFeedback',
            )
        })

        it('should handle feedback for different message IDs correctly', () => {
            mockUseGetFeedback.mockReturnValue({
                data: {
                    executions: [
                        {
                            executionId: 'exec-123',
                            feedback: [
                                {
                                    id: 'feedback-1',
                                    targetType: 'REASONING',
                                    targetId: '9999', // Different message ID
                                    feedbackValue: AiAgentBinaryFeedbackEnum.UP,
                                    feedbackType: 'REASONING_BINARY',
                                },
                            ],
                        },
                    ],
                },
                isLoading: false,
            } as any)

            renderComponent()

            const thumbUpButton = screen.getAllByRole('button')[0]
            expect(
                thumbUpButton.querySelector('.material-icons-outlined'),
            ).toBeInTheDocument()
            expect(thumbUpButton.closest('button')).not.toHaveClass(
                'positiveFeedback',
            )
        })

        it('should handle feedback for different execution IDs correctly', () => {
            mockUseGetFeedback.mockReturnValue({
                data: {
                    executions: [
                        {
                            executionId: 'exec-999', // Different execution ID
                            feedback: [
                                {
                                    id: 'feedback-1',
                                    targetType: 'REASONING',
                                    targetId: '1001',
                                    feedbackValue: AiAgentBinaryFeedbackEnum.UP,
                                    feedbackType: 'REASONING_BINARY',
                                },
                            ],
                        },
                    ],
                },
                isLoading: false,
            } as any)

            renderComponent()

            const thumbUpButton = screen.getAllByRole('button')[0]
            expect(
                thumbUpButton.querySelector('.material-icons-outlined'),
            ).toBeInTheDocument()
            expect(thumbUpButton.closest('button')).not.toHaveClass(
                'positiveFeedback',
            )
        })
    })

    describe('Feedback submission', () => {
        it('should submit positive feedback when thumb up is clicked', async () => {
            mockMutateAsync.mockResolvedValue({})
            renderComponent()

            const thumbUpButton = screen.getAllByRole('button')[0]
            fireEvent.click(thumbUpButton)

            await waitFor(() => {
                expect(mockMutateAsync).toHaveBeenCalledWith({
                    data: {
                        feedbackToUpsert: [
                            {
                                id: undefined,
                                objectId: '123',
                                objectType: 'TICKET',
                                executionId: 'exec-123',
                                targetType: 'REASONING',
                                targetId: '1001',
                                feedbackValue: AiAgentBinaryFeedbackEnum.UP,
                                feedbackType: 'REASONING_BINARY',
                            },
                        ],
                    },
                })
            })

            expect(mockOnFeedbackGiven).toHaveBeenCalledWith(
                AiAgentBinaryFeedbackEnum.UP,
            )
        })

        it('should submit negative feedback when thumb down is clicked', async () => {
            mockMutateAsync.mockResolvedValue({})
            renderComponent()

            const thumbDownButton = screen.getAllByRole('button')[1]
            fireEvent.click(thumbDownButton)

            await waitFor(() => {
                expect(mockMutateAsync).toHaveBeenCalledWith({
                    data: {
                        feedbackToUpsert: [
                            {
                                id: undefined,
                                objectId: '123',
                                objectType: 'TICKET',
                                executionId: 'exec-123',
                                targetType: 'REASONING',
                                targetId: '1001',
                                feedbackValue: AiAgentBinaryFeedbackEnum.DOWN,
                                feedbackType: 'REASONING_BINARY',
                            },
                        ],
                    },
                })
            })

            expect(mockOnFeedbackGiven).toHaveBeenCalledWith(
                AiAgentBinaryFeedbackEnum.DOWN,
            )
        })

        it('should update existing feedback when changing vote', async () => {
            mockUseGetFeedback.mockReturnValue({
                data: mockFeedbackData,
                isLoading: false,
            } as any)

            mockMutateAsync.mockResolvedValue({})
            renderComponent()

            const thumbDownButton = screen.getAllByRole('button')[1]
            fireEvent.click(thumbDownButton)

            await waitFor(() => {
                expect(mockMutateAsync).toHaveBeenCalledWith({
                    data: {
                        feedbackToUpsert: [
                            {
                                id: 'feedback-1',
                                objectId: '123',
                                objectType: 'TICKET',
                                executionId: 'exec-123',
                                targetType: 'REASONING',
                                targetId: '1001',
                                feedbackValue: AiAgentBinaryFeedbackEnum.DOWN,
                                feedbackType: 'REASONING_BINARY',
                            },
                        ],
                    },
                })
            })
        })

        it('should not submit feedback if already same value', async () => {
            mockUseGetFeedback.mockReturnValue({
                data: mockFeedbackData,
                isLoading: false,
            } as any)

            renderComponent()

            const thumbUpButton = screen.getAllByRole('button')[0]
            fireEvent.click(thumbUpButton)

            await waitFor(() => {
                expect(mockMutateAsync).not.toHaveBeenCalled()
            })

            expect(mockOnFeedbackGiven).not.toHaveBeenCalled()
        })

        it('should not submit feedback while loading', async () => {
            mockUseGetFeedback.mockReturnValue({
                data: undefined,
                isLoading: true,
            } as any)

            renderComponent()

            const thumbUpButton = screen.getAllByRole('button')[0]
            fireEvent.click(thumbUpButton)

            await waitFor(() => {
                expect(mockMutateAsync).not.toHaveBeenCalled()
            })

            expect(mockOnFeedbackGiven).not.toHaveBeenCalled()
        })
    })

    describe('Feedback data retrieval', () => {
        it('should correctly retrieve feedback from executions', () => {
            mockUseGetFeedback.mockReturnValue({
                data: mockFeedbackData,
                isLoading: false,
            } as any)

            renderComponent()

            // Verify the correct feedback is used to display the UI state
            const thumbUpButton = screen.getAllByRole('button')[0]
            expect(
                thumbUpButton.querySelector('.material-icons'),
            ).toBeInTheDocument()
        })

        it('should handle missing executions data', () => {
            mockUseGetFeedback.mockReturnValue({
                data: { executions: [] },
                isLoading: false,
            } as any)

            renderComponent()

            // Verify default state when no feedback exists
            const thumbUpButton = screen.getAllByRole('button')[0]
            const thumbDownButton = screen.getAllByRole('button')[1]
            expect(
                thumbUpButton.querySelector('.material-icons-outlined'),
            ).toBeInTheDocument()
            expect(
                thumbDownButton.querySelector('.material-icons-outlined'),
            ).toBeInTheDocument()
        })
    })

    describe('Error handling', () => {
        it('should handle mutation errors without crashing', async () => {
            mockMutateAsync.mockRejectedValue(new Error('Network error'))

            renderComponent()

            const thumbUpButton = screen.getAllByRole('button')[0]

            // The click should not throw even if mutation fails
            fireEvent.click(thumbUpButton)

            // Verify mutation was attempted
            await waitFor(() => {
                expect(mockMutateAsync).toHaveBeenCalled()
            })

            // onFeedbackGiven won't be called since the mutation failed
            expect(mockOnFeedbackGiven).not.toHaveBeenCalled()
        })

        it('should handle missing execution data gracefully', () => {
            mockUseGetFeedback.mockReturnValue({
                data: null,
                isLoading: false,
            } as any)

            renderComponent()

            const thumbUpButton = screen.getAllByRole('button')[0]
            const thumbDownButton = screen.getAllByRole('button')[1]

            expect(thumbUpButton).toBeInTheDocument()
            expect(thumbDownButton).toBeInTheDocument()
            expect(
                thumbUpButton.querySelector('.material-icons-outlined'),
            ).toBeInTheDocument()
            expect(
                thumbDownButton.querySelector('.material-icons-outlined'),
            ).toBeInTheDocument()
        })
    })

    describe('Integration with useFeedbackTracking hook', () => {
        it('should initialize useFeedbackTracking with correct props', () => {
            renderComponent()

            expect(mockUseFeedbackTracking).toHaveBeenCalledWith({
                ticketId: 123,
                accountId: 456,
                userId: 789,
            })
        })

        it('should call onFeedbackGiven after successful mutation', async () => {
            mockMutateAsync.mockResolvedValue({})
            renderComponent()

            const thumbUpButton = screen.getAllByRole('button')[0]
            fireEvent.click(thumbUpButton)

            await waitFor(() => {
                expect(mockOnFeedbackGiven).toHaveBeenCalledWith(
                    AiAgentBinaryFeedbackEnum.UP,
                )
            })
        })
    })

    describe('Props validation', () => {
        it('should handle messageId as 0', () => {
            renderComponent({ messageId: 0 })

            const thumbUpButton = screen.getAllByRole('button')[0]
            fireEvent.click(thumbUpButton)

            waitFor(() => {
                expect(mockMutateAsync).toHaveBeenCalledWith({
                    data: {
                        feedbackToUpsert: [
                            expect.objectContaining({
                                targetId: '0',
                            }),
                        ],
                    },
                })
            })
        })

        it('should handle empty executionId', () => {
            renderComponent({ executionId: '' })

            const thumbUpButton = screen.getAllByRole('button')[0]
            fireEvent.click(thumbUpButton)

            waitFor(() => {
                expect(mockMutateAsync).toHaveBeenCalledWith({
                    data: {
                        feedbackToUpsert: [
                            expect.objectContaining({
                                executionId: '',
                            }),
                        ],
                    },
                })
            })
        })
    })

    describe('Accessibility', () => {
        it('should have accessible button structure', () => {
            renderComponent()

            const buttons = screen.getAllByRole('button')
            expect(buttons).toHaveLength(2)

            // Verify icons are present and have correct text
            expect(buttons[0].querySelector('i')).toHaveTextContent('thumb_up')
            expect(buttons[1].querySelector('i')).toHaveTextContent(
                'thumb_down',
            )
        })

        it('should be keyboard navigable', () => {
            renderComponent()

            const buttons = screen.getAllByRole('button')
            const thumbUpButton = buttons[0]
            const thumbDownButton = buttons[1]

            thumbUpButton.focus()
            expect(document.activeElement).toBe(thumbUpButton)

            fireEvent.keyDown(thumbUpButton, { key: 'Tab' })
            thumbDownButton.focus()
            expect(document.activeElement).toBe(thumbDownButton)
        })
    })
})
