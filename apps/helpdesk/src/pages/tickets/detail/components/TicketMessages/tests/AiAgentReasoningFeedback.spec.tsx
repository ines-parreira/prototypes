import { useFeedbackTracking } from '@repo/ai-agent'
import { assumeMock } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { useUpsertFeedback } from 'models/knowledgeService/mutations'
import { useGetFeedback } from 'models/knowledgeService/queries'
import type { RootState, StoreDispatch } from 'state/types'

import { AiAgentBinaryFeedbackEnum } from '../../AIAgentFeedbackBar/types'
import { AiAgentReasoningFeedback } from '../AiAgentReasoningFeedback'

jest.mock('models/knowledgeService/queries', () => ({
    useGetFeedback: jest.fn(),
}))

jest.mock('models/knowledgeService/mutations', () => ({
    useUpsertFeedback: jest.fn(),
}))

jest.mock('@repo/ai-agent', () => ({
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

    describe('useGetFeedback guard', () => {
        it('should not fetch feedback when ticketId is undefined', () => {
            renderComponent({ ticketId: undefined })

            expect(mockUseGetFeedback).toHaveBeenCalledWith(
                expect.objectContaining({ objectId: '' }),
                expect.objectContaining({ enabled: false }),
            )
        })

        it('should not fetch feedback when ticketId is 0', () => {
            renderComponent({ ticketId: 0 })

            expect(mockUseGetFeedback).toHaveBeenCalledWith(
                expect.objectContaining({ objectId: '0' }),
                expect.objectContaining({ enabled: false }),
            )
        })

        it('should fetch feedback when ticketId is valid', () => {
            renderComponent()

            expect(mockUseGetFeedback).toHaveBeenCalledWith(
                expect.objectContaining({ objectId: '123' }),
                expect.objectContaining({ enabled: true }),
            )
        })
    })

    describe('Component rendering', () => {
        it('should render feedback section with text and buttons', () => {
            renderComponent()

            expect(
                screen.getByText(
                    "Rate how well this explains AI Agent's response",
                ),
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
                expect(screen.getByText('Well explained')).toBeInTheDocument()
            })

            fireEvent.mouseOver(thumbDownButton)
            await waitFor(() => {
                expect(
                    screen.getByText('Not well explained'),
                ).toBeInTheDocument()
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
                thumbUpButton.querySelector('.material-icons'),
            ).toBeInTheDocument()
            expect(
                thumbUpButton.querySelector('.material-icons-outlined'),
            ).not.toBeInTheDocument()
            expect(thumbUpButton.closest('button')).toHaveClass(
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

            // Should submit negative feedback immediately
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

        it('should show feedback form when thumbs down is already selected', async () => {
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

            // Feedback form should be visible
            await waitFor(() => {
                expect(
                    screen.getByText("What's wrong with this explanation?"),
                ).toBeInTheDocument()
                expect(screen.getByText('Too long to read')).toBeInTheDocument()
                expect(
                    screen.getByText('Contains repetitive information'),
                ).toBeInTheDocument()
                expect(
                    screen.getByText('Missing knowledge source references'),
                ).toBeInTheDocument()
                expect(
                    screen.getByText('Mentions actions not included in reply'),
                ).toBeInTheDocument()
                expect(
                    screen.getByText('Unclear decision-making explanation'),
                ).toBeInTheDocument()
                expect(screen.getByText('Other')).toBeInTheDocument()
            })
        })

        it('should submit feedback immediately when checkboxes are selected', async () => {
            // Set up initial state with thumbs down already selected
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

            mockMutateAsync.mockResolvedValue({})
            renderComponent()

            // Form should be visible
            await waitFor(() => {
                expect(
                    screen.getByText("What's wrong with this explanation?"),
                ).toBeInTheDocument()
            })

            // Select first checkbox
            const checkboxes = screen.getAllByRole('checkbox')
            act(() => {
                fireEvent.click(checkboxes[0]) // Too long
            })

            await waitFor(
                () => {
                    expect(mockMutateAsync).toHaveBeenCalledWith({
                        data: {
                            feedbackToUpsert: [
                                {
                                    objectId: '123',
                                    objectType: 'TICKET',
                                    executionId: 'exec-123',
                                    targetType: 'REASONING',
                                    targetId: '1001',
                                    feedbackValue: 'TOO_LONG',
                                    feedbackType:
                                        'REASONING_BAD_EXPLANATION_REASON',
                                },
                            ],
                        },
                    })
                },
                { timeout: 2000 },
            )

            // Select second checkbox
            act(() => {
                fireEvent.click(checkboxes[2]) // Missing knowledge source references
            })

            await waitFor(
                () => {
                    expect(mockMutateAsync).toHaveBeenCalledWith({
                        data: {
                            feedbackToUpsert: [
                                {
                                    objectId: '123',
                                    objectType: 'TICKET',
                                    executionId: 'exec-123',
                                    targetType: 'REASONING',
                                    targetId: '1001',
                                    feedbackValue: 'MISSING_REFERENCES',
                                    feedbackType:
                                        'REASONING_BAD_EXPLANATION_REASON',
                                },
                            ],
                        },
                    })
                },
                { timeout: 2000 },
            )
        })

        it('should update existing feedback when changing vote from up to down', async () => {
            mockUseGetFeedback.mockReturnValue({
                data: mockFeedbackData,
                isLoading: false,
            } as any)

            mockMutateAsync.mockResolvedValue({})
            renderComponent()

            // Click thumbs down
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

        it('should remove feedback when checkbox is unchecked', async () => {
            // Set up initial state with thumbs down already selected
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

            mockMutateAsync.mockResolvedValue({})
            renderComponent()

            // Form should be visible
            await waitFor(() => {
                expect(
                    screen.getByText("What's wrong with this explanation?"),
                ).toBeInTheDocument()
            })

            // Select checkbox
            const checkboxes = screen.getAllByRole('checkbox')
            act(() => {
                fireEvent.click(checkboxes[0]) // Too long
            })

            await waitFor(
                () => {
                    expect(mockMutateAsync).toHaveBeenCalledWith({
                        data: {
                            feedbackToUpsert: [
                                {
                                    objectId: '123',
                                    objectType: 'TICKET',
                                    executionId: 'exec-123',
                                    targetType: 'REASONING',
                                    targetId: '1001',
                                    feedbackValue: 'TOO_LONG',
                                    feedbackType:
                                        'REASONING_BAD_EXPLANATION_REASON',
                                },
                            ],
                        },
                    })
                },
                { timeout: 2000 },
            )

            mockMutateAsync.mockClear()

            // Uncheck the same checkbox
            act(() => {
                fireEvent.click(checkboxes[0])
            })

            await waitFor(
                () => {
                    expect(mockMutateAsync).toHaveBeenCalledWith({
                        data: {
                            feedbackToUpsert: [
                                {
                                    objectId: '123',
                                    objectType: 'TICKET',
                                    executionId: 'exec-123',
                                    targetType: 'REASONING',
                                    targetId: '1001',
                                    feedbackValue: null,
                                    feedbackType:
                                        'REASONING_BAD_EXPLANATION_REASON',
                                },
                            ],
                        },
                    })
                },
                { timeout: 2000 },
            )
        })

        it('should show textarea when Other is selected', async () => {
            // Set up initial state with thumbs down already selected
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

            // Form should be visible
            await waitFor(() => {
                expect(
                    screen.getByText("What's wrong with this explanation?"),
                ).toBeInTheDocument()
            })

            // Select 'Other' checkbox
            const checkboxes = screen.getAllByRole('checkbox')
            const otherCheckbox = checkboxes[5] // 'Other' is the last option
            act(() => {
                fireEvent.click(otherCheckbox)
            })

            // Textarea should appear
            await waitFor(() => {
                expect(
                    screen.getByPlaceholderText(
                        'Please provide more details...',
                    ),
                ).toBeInTheDocument()
            })
        })

        it('should auto-save textarea content after typing stops', async () => {
            // Set up initial state with thumbs down already selected
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

            jest.useFakeTimers()
            mockMutateAsync.mockResolvedValue({})
            renderComponent()

            // Form should be visible
            await waitFor(() => {
                expect(
                    screen.getByText("What's wrong with this explanation?"),
                ).toBeInTheDocument()
            })

            // Select 'Other' checkbox
            const checkboxes = screen.getAllByRole('checkbox')
            const otherCheckbox = checkboxes[5] // 'Other' is the last option
            act(() => {
                fireEvent.click(otherCheckbox)
            })

            // Textarea should appear
            await waitFor(() => {
                expect(
                    screen.getByPlaceholderText(
                        'Please provide more details...',
                    ),
                ).toBeInTheDocument()
            })

            // Type in textarea
            const textarea = screen.getByPlaceholderText(
                'Please provide more details...',
            )
            act(() => {
                fireEvent.change(textarea, {
                    target: { value: 'This is my additional feedback' },
                })
            })

            // Fast forward timers to trigger debounced save
            act(() => {
                jest.advanceTimersByTime(1500)
            })

            await waitFor(
                () => {
                    expect(mockMutateAsync).toHaveBeenCalledWith({
                        data: {
                            feedbackToUpsert: [
                                {
                                    objectId: '123',
                                    objectType: 'TICKET',
                                    executionId: 'exec-123',
                                    targetType: 'REASONING',
                                    targetId: '1001',
                                    feedbackValue:
                                        'This is my additional feedback',
                                    feedbackType: 'REASONING_FREEFORM',
                                },
                            ],
                        },
                    })
                },
                { timeout: 3000 },
            )

            jest.useRealTimers()
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

    describe('Existing feedback restoration', () => {
        it('should restore existing reason checkboxes from backend data', async () => {
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
                                {
                                    id: 'feedback-2',
                                    targetType: 'REASONING',
                                    targetId: '1001',
                                    feedbackValue: 'TOO_LONG',
                                    feedbackType:
                                        'REASONING_BAD_EXPLANATION_REASON',
                                },
                                {
                                    id: 'feedback-3',
                                    targetType: 'REASONING',
                                    targetId: '1001',
                                    feedbackValue: 'MISSING_REFERENCES',
                                    feedbackType:
                                        'REASONING_BAD_EXPLANATION_REASON',
                                },
                            ],
                        },
                    ],
                },
                isLoading: false,
            } as any)

            renderComponent()

            // Wait for form to be visible
            await waitFor(() => {
                expect(
                    screen.getByText("What's wrong with this explanation?"),
                ).toBeInTheDocument()
            })

            // Check that the correct checkboxes are selected
            const checkboxes = screen.getAllByRole('checkbox')
            const tooLongCheckbox = checkboxes[0] // First option
            const missingRefCheckbox = checkboxes[2] // Third option

            expect(tooLongCheckbox).toBeChecked()
            expect(missingRefCheckbox).toBeChecked()
            expect(checkboxes[1]).not.toBeChecked() // Second option not selected
        })

        it('should restore existing freeform feedback text from backend data', async () => {
            const existingText = 'This is my existing feedback text'
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
                                {
                                    id: 'feedback-2',
                                    targetType: 'REASONING',
                                    targetId: '1001',
                                    feedbackValue: 'OTHER',
                                    feedbackType:
                                        'REASONING_BAD_EXPLANATION_REASON',
                                },
                                {
                                    id: 'feedback-3',
                                    targetType: 'REASONING',
                                    targetId: '1001',
                                    feedbackValue: existingText,
                                    feedbackType: 'REASONING_FREEFORM',
                                },
                            ],
                        },
                    ],
                },
                isLoading: false,
            } as any)

            renderComponent()

            // Wait for form to be visible
            await waitFor(() => {
                expect(
                    screen.getByText("What's wrong with this explanation?"),
                ).toBeInTheDocument()
            })

            // Check that OTHER checkbox is selected and textarea is visible with text
            const checkboxes = screen.getAllByRole('checkbox')
            const otherCheckbox = checkboxes[5] // OTHER is the last option
            expect(otherCheckbox).toBeChecked()

            const textarea = screen.getByPlaceholderText(
                'Please provide more details...',
            )
            expect(textarea).toBeInTheDocument()
            expect(textarea).toHaveValue(existingText)
        })

        it('should handle mixed existing feedback types correctly', async () => {
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
                                {
                                    id: 'feedback-2',
                                    targetType: 'REASONING',
                                    targetId: '1001',
                                    feedbackValue: 'REPETITIVE',
                                    feedbackType:
                                        'REASONING_BAD_EXPLANATION_REASON',
                                },
                                {
                                    id: 'feedback-3',
                                    targetType: 'REASONING',
                                    targetId: '1001',
                                    feedbackValue: 'OTHER',
                                    feedbackType:
                                        'REASONING_BAD_EXPLANATION_REASON',
                                },
                                {
                                    id: 'feedback-4',
                                    targetType: 'REASONING',
                                    targetId: '1001',
                                    feedbackValue: 'Custom feedback text',
                                    feedbackType: 'REASONING_FREEFORM',
                                },
                            ],
                        },
                    ],
                },
                isLoading: false,
            } as any)

            renderComponent()

            // Wait for form to be visible
            await waitFor(() => {
                expect(
                    screen.getByText("What's wrong with this explanation?"),
                ).toBeInTheDocument()
            })

            const checkboxes = screen.getAllByRole('checkbox')

            // Check that correct reason checkboxes are selected
            expect(checkboxes[1]).toBeChecked() // REPETITIVE
            expect(checkboxes[5]).toBeChecked() // OTHER

            // Check that textarea has the freeform text
            const textarea = screen.getByPlaceholderText(
                'Please provide more details...',
            )
            expect(textarea).toHaveValue('Custom feedback text')
        })
    })

    describe('OTHER checkbox disabled state', () => {
        it('should disable OTHER checkbox when textarea has content', async () => {
            // Set up initial state with thumbs down selected
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
                                {
                                    id: 'feedback-2',
                                    targetType: 'REASONING',
                                    targetId: '1001',
                                    feedbackValue: 'OTHER',
                                    feedbackType:
                                        'REASONING_BAD_EXPLANATION_REASON',
                                },
                            ],
                        },
                    ],
                },
                isLoading: false,
            } as any)

            renderComponent()

            // Wait for form to be visible
            await waitFor(() => {
                expect(
                    screen.getByText("What's wrong with this explanation?"),
                ).toBeInTheDocument()
            })

            // OTHER checkbox should be enabled initially (no text in textarea)
            const checkboxes = screen.getAllByRole('checkbox')
            const otherCheckbox = checkboxes[5] // OTHER is the last option
            expect(otherCheckbox).not.toBeDisabled()

            // Type in textarea
            const textarea = screen.getByPlaceholderText(
                'Please provide more details...',
            )
            act(() => {
                fireEvent.change(textarea, {
                    target: { value: 'Some feedback text' },
                })
            })

            // OTHER checkbox should now be disabled
            await waitFor(() => {
                expect(otherCheckbox).toBeDisabled()
            })
        })

        it('should enable OTHER checkbox when textarea is cleared', async () => {
            // Set up with existing freeform feedback
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
                                {
                                    id: 'feedback-2',
                                    targetType: 'REASONING',
                                    targetId: '1001',
                                    feedbackValue: 'OTHER',
                                    feedbackType:
                                        'REASONING_BAD_EXPLANATION_REASON',
                                },
                                {
                                    id: 'feedback-3',
                                    targetType: 'REASONING',
                                    targetId: '1001',
                                    feedbackValue: 'Existing text',
                                    feedbackType: 'REASONING_FREEFORM',
                                },
                            ],
                        },
                    ],
                },
                isLoading: false,
            } as any)

            renderComponent()

            // Wait for form to be visible
            await waitFor(() => {
                expect(
                    screen.getByText("What's wrong with this explanation?"),
                ).toBeInTheDocument()
            })

            // OTHER checkbox should be disabled initially (textarea has text)
            const checkboxes = screen.getAllByRole('checkbox')
            const otherCheckbox = checkboxes[5] // OTHER is the last option
            expect(otherCheckbox).toBeDisabled()

            // Clear textarea
            const textarea = screen.getByPlaceholderText(
                'Please provide more details...',
            )
            act(() => {
                fireEvent.change(textarea, {
                    target: { value: '' },
                })
            })

            // OTHER checkbox should now be enabled
            await waitFor(() => {
                expect(otherCheckbox).not.toBeDisabled()
            })
        })

        it('should not disable non-OTHER checkboxes when textarea has content', async () => {
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
                                {
                                    id: 'feedback-2',
                                    targetType: 'REASONING',
                                    targetId: '1001',
                                    feedbackValue: 'OTHER',
                                    feedbackType:
                                        'REASONING_BAD_EXPLANATION_REASON',
                                },
                            ],
                        },
                    ],
                },
                isLoading: false,
            } as any)

            renderComponent()

            // Wait for form to be visible
            await waitFor(() => {
                expect(
                    screen.getByText("What's wrong with this explanation?"),
                ).toBeInTheDocument()
            })

            // Type in textarea
            const textarea = screen.getByPlaceholderText(
                'Please provide more details...',
            )
            act(() => {
                fireEvent.change(textarea, {
                    target: { value: 'Some feedback text' },
                })
            })

            // All other checkboxes should remain enabled
            const checkboxes = screen.getAllByRole('checkbox')
            for (let i = 0; i < checkboxes.length - 1; i++) {
                // All except the last one (OTHER)
                expect(checkboxes[i]).not.toBeDisabled()
            }
        })
    })

    describe('Freeform feedback deletion', () => {
        it('should delete freeform feedback when OTHER checkbox is deselected', async () => {
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
                                {
                                    id: 'feedback-2',
                                    targetType: 'REASONING',
                                    targetId: '1001',
                                    feedbackValue: 'OTHER',
                                    feedbackType:
                                        'REASONING_BAD_EXPLANATION_REASON',
                                },
                                {
                                    id: 'feedback-3',
                                    targetType: 'REASONING',
                                    targetId: '1001',
                                    feedbackValue: 'Some freeform text',
                                    feedbackType: 'REASONING_FREEFORM',
                                },
                            ],
                        },
                    ],
                },
                isLoading: false,
            } as any)

            mockMutateAsync.mockResolvedValue({})
            renderComponent()

            // Wait for form to be visible
            await waitFor(() => {
                expect(
                    screen.getByText("What's wrong with this explanation?"),
                ).toBeInTheDocument()
            })

            // Clear textarea first to enable OTHER checkbox
            const textarea = screen.getByPlaceholderText(
                'Please provide more details...',
            )
            act(() => {
                fireEvent.change(textarea, { target: { value: '' } })
            })

            // Wait for checkbox to be enabled
            const checkboxes = screen.getAllByRole('checkbox')
            const otherCheckbox = checkboxes[5]
            await waitFor(() => {
                expect(otherCheckbox).not.toBeDisabled()
            })

            // Deselect OTHER checkbox
            act(() => {
                fireEvent.click(otherCheckbox)
            })

            // Should call mutation to delete freeform feedback
            await waitFor(() => {
                expect(mockMutateAsync).toHaveBeenCalledWith({
                    data: {
                        feedbackToUpsert: [
                            {
                                id: 'feedback-3',
                                objectId: '123',
                                objectType: 'TICKET',
                                executionId: 'exec-123',
                                targetType: 'REASONING',
                                targetId: '1001',
                                feedbackValue: null,
                                feedbackType: 'REASONING_FREEFORM',
                            },
                        ],
                    },
                })
            })

            // Textarea should be cleared
            expect(textarea).toHaveValue('')
        })

        it('should not delete freeform feedback when OTHER is deselected but no existing freeform exists', async () => {
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
                                {
                                    id: 'feedback-2',
                                    targetType: 'REASONING',
                                    targetId: '1001',
                                    feedbackValue: 'OTHER',
                                    feedbackType:
                                        'REASONING_BAD_EXPLANATION_REASON',
                                },
                            ],
                        },
                    ],
                },
                isLoading: false,
            } as any)

            renderComponent()

            // Wait for form to be visible
            await waitFor(() => {
                expect(
                    screen.getByText("What's wrong with this explanation?"),
                ).toBeInTheDocument()
            })

            // Clear existing call count
            mockMutateAsync.mockClear()

            // Deselect OTHER checkbox
            const checkboxes = screen.getAllByRole('checkbox')
            const otherCheckbox = checkboxes[5]
            act(() => {
                fireEvent.click(otherCheckbox)
            })

            // Should not make any mutation calls for freeform deletion
            // (only the regular checkbox mutation should happen after debounce)
            await waitFor(() => {
                const freeformDeletionCalls = mockMutateAsync.mock.calls.filter(
                    (call) =>
                        call[0]?.data?.feedbackToUpsert?.[0]?.feedbackType ===
                        'REASONING_FREEFORM',
                )
                expect(freeformDeletionCalls).toHaveLength(0)
            })
        })
    })

    describe('Auto-save state management', () => {
        it('should show initial auto-save state when component loads', () => {
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

            // AutoSaveBadge should be rendered but not show saving/saved state initially
            expect(screen.queryByText('Saving...')).not.toBeInTheDocument()
            expect(screen.queryByText('Saved')).not.toBeInTheDocument()
        })

        it('should show saving state during mutation and saved state after success', async () => {
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

            let resolveMutation: (value: any) => void
            const mutationPromise = new Promise((resolve) => {
                resolveMutation = resolve
            })
            mockMutateAsync.mockReturnValue(mutationPromise)

            renderComponent()

            // Select a checkbox to trigger mutation
            const checkboxes = screen.getAllByRole('checkbox')
            act(() => {
                fireEvent.click(checkboxes[0])
            })

            // Should show saving state
            await waitFor(() => {
                expect(screen.getByText(/Saving/)).toBeInTheDocument()
            })

            // Resolve the mutation
            act(() => {
                resolveMutation({})
            })

            // Should show saved state
            await waitFor(() => {
                expect(screen.getByText(/Saved/)).toBeInTheDocument()
            })
        })

        it('should revert to initial state on mutation failure', async () => {
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

            let rejectMutation: (error: Error) => void
            const mutationPromise = new Promise((resolve, reject) => {
                rejectMutation = reject
            })
            mockMutateAsync.mockReturnValue(mutationPromise)
            renderComponent()

            // Select a checkbox to trigger mutation
            const checkboxes = screen.getAllByRole('checkbox')
            act(() => {
                fireEvent.click(checkboxes[0])
            })

            // Should show saving state initially
            await waitFor(() => {
                expect(screen.getByText(/Saving/)).toBeInTheDocument()
            })

            // Reject the mutation
            act(() => {
                rejectMutation(new Error('Network error'))
            })

            // After failure, should not show saving or saved state
            await waitFor(() => {
                expect(screen.queryByText(/Saving/)).not.toBeInTheDocument()
                expect(screen.queryByText(/Saved/)).not.toBeInTheDocument()
            })
        })
    })

    describe('Edge cases and race conditions', () => {
        it('should handle rapid checkbox selections without duplicate submissions', async () => {
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

            jest.useFakeTimers()
            mockMutateAsync.mockResolvedValue({})
            renderComponent()

            // Wait for form to be visible
            await waitFor(() => {
                expect(
                    screen.getByText("What's wrong with this explanation?"),
                ).toBeInTheDocument()
            })

            // Rapidly select multiple checkboxes
            const checkboxes = screen.getAllByRole('checkbox')
            act(() => {
                fireEvent.click(checkboxes[0]) // TOO_LONG
                fireEvent.click(checkboxes[1]) // REPETITIVE
                fireEvent.click(checkboxes[2]) // MISSING_REFERENCES
            })

            // Fast forward past debounce time
            act(() => {
                jest.advanceTimersByTime(800)
            })

            // Should have made only one batch call with all changes
            await waitFor(() => {
                expect(mockMutateAsync).toHaveBeenCalledTimes(1)
                expect(mockMutateAsync).toHaveBeenCalledWith({
                    data: {
                        feedbackToUpsert: expect.arrayContaining([
                            expect.objectContaining({
                                feedbackValue: 'MISSING_REFERENCES',
                            }),
                        ]),
                    },
                })
            })

            jest.useRealTimers()
        })

        it('should handle null feedback values in existing data', () => {
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
                                {
                                    id: 'feedback-2',
                                    targetType: 'REASONING',
                                    targetId: '1001',
                                    feedbackValue: null, // null feedback value
                                    feedbackType:
                                        'REASONING_BAD_EXPLANATION_REASON',
                                },
                            ],
                        },
                    ],
                },
                isLoading: false,
            } as any)

            // Should not throw errors and render properly
            expect(() => renderComponent()).not.toThrow()

            // Form should be visible
            expect(
                screen.getByText("What's wrong with this explanation?"),
            ).toBeInTheDocument()

            // All checkboxes should be unchecked (since null values are filtered out)
            const checkboxes = screen.getAllByRole('checkbox')
            checkboxes.forEach((checkbox) => {
                expect(checkbox).not.toBeChecked()
            })
        })

        it('should handle feedback with different target IDs correctly', () => {
            mockUseGetFeedback.mockReturnValue({
                data: {
                    executions: [
                        {
                            executionId: 'exec-123',
                            feedback: [
                                {
                                    id: 'feedback-1',
                                    targetType: 'REASONING',
                                    targetId: '1001', // Current message ID
                                    feedbackValue:
                                        AiAgentBinaryFeedbackEnum.DOWN,
                                    feedbackType: 'REASONING_BINARY',
                                },
                                {
                                    id: 'feedback-2',
                                    targetType: 'REASONING',
                                    targetId: '9999', // Different message ID
                                    feedbackValue: 'TOO_LONG',
                                    feedbackType:
                                        'REASONING_BAD_EXPLANATION_REASON',
                                },
                                {
                                    id: 'feedback-3',
                                    targetType: 'REASONING',
                                    targetId: '1001', // Current message ID
                                    feedbackValue: 'REPETITIVE',
                                    feedbackType:
                                        'REASONING_BAD_EXPLANATION_REASON',
                                },
                            ],
                        },
                    ],
                },
                isLoading: false,
            } as any)

            renderComponent()

            // Form should be visible
            expect(
                screen.getByText("What's wrong with this explanation?"),
            ).toBeInTheDocument()

            const checkboxes = screen.getAllByRole('checkbox')

            // Only feedback with matching targetId should be selected
            expect(checkboxes[0]).not.toBeChecked() // TOO_LONG (wrong targetId)
            expect(checkboxes[1]).toBeChecked() // REPETITIVE (correct targetId)
        })

        it('should use REASONING_BINARY feedback for reasoning thumbs up/down', () => {
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
                                    feedbackValue: 'TOO_LONG',
                                    feedbackType:
                                        'REASONING_BAD_EXPLANATION_REASON',
                                },
                                {
                                    id: 'feedback-2',
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

            // Should show feedback form (since REASONING_BINARY with DOWN value exists)
            expect(
                screen.getByText("What's wrong with this explanation?"),
            ).toBeInTheDocument()

            // Thumbs down button should be filled and have negative feedback class
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

        it('should handle empty executions array', () => {
            mockUseGetFeedback.mockReturnValue({
                data: {
                    executions: [], // Empty executions
                },
                isLoading: false,
            } as any)

            expect(() => renderComponent()).not.toThrow()

            // Should render with default state (no feedback form visible)
            expect(
                screen.queryByText("What's wrong with this explanation?"),
            ).not.toBeInTheDocument()

            // Buttons should be in default state
            const buttons = screen.getAllByRole('button')
            expect(
                buttons[0].querySelector('.material-icons-outlined'),
            ).toBeInTheDocument()
            expect(
                buttons[1].querySelector('.material-icons-outlined'),
            ).toBeInTheDocument()
        })
    })
})
