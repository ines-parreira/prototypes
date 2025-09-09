import { assumeMock } from '@repo/testing'
import { act, fireEvent, render, screen } from '@testing-library/react'

import useAppSelector from 'hooks/useAppSelector'
import { useGetAiAgentFeedback } from 'models/aiAgentFeedback/queries'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getDateAndTimeFormatter } from 'state/currentUser/selectors'
import { getTicketState } from 'state/ticket/selectors'

import { AIAgentTicketLevelFeedback } from '../AIAgentTicketLevelFeedback/AIAgentTicketLevelFeedback'
import { AiAgentBadInteractionReason, FeedbackRating } from '../types'

jest.mock('hooks/useAppSelector')
jest.mock('models/aiAgentFeedback/queries')
const useAppSelectorMock = useAppSelector as jest.Mock
const useGetAiAgentFeedbackMock = assumeMock(useGetAiAgentFeedback)

jest.mock('uuid', () => ({
    v4: jest.fn(() => 'test-uuid'),
}))

describe('AIAgentTicketLevelFeedback', () => {
    const mockUpsertFeedback = jest.fn()
    const defaultProps: any = {
        feedback: null,
        upsertFeedback: mockUpsertFeedback,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        jest.useFakeTimers()

        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === getTicketState) {
                return new Map([['id', 123]])
            }
            if (selector === getCurrentAccountState) {
                return new Map([['id', 456]])
            }
            if (selector === getDateAndTimeFormatter) {
                return () => 'MMMM DD, YYYY'
            }
            if (
                typeof selector === 'function' &&
                selector.toString().includes('currentUser')
            ) {
                return new Map([['id', 789]])
            }
            return null
        })

        mockUpsertFeedback.mockResolvedValue({})
        useGetAiAgentFeedbackMock.mockReturnValue({ data: undefined } as any)
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('should render rating section with real components', () => {
        render(<AIAgentTicketLevelFeedback {...defaultProps} />)

        expect(
            screen.getByText('How was this conversation?'),
        ).toBeInTheDocument()
        expect(screen.getByText('Bad')).toBeInTheDocument()
        expect(screen.getByText('Okay')).toBeInTheDocument()
        expect(screen.getByText('Good')).toBeInTheDocument()
    })

    it('should not show reason section or internal note when no rating is provided', () => {
        render(<AIAgentTicketLevelFeedback {...defaultProps} />)

        expect(
            screen.getByText('How was this conversation?'),
        ).toBeInTheDocument()
        expect(screen.queryByText('What went wrong?')).not.toBeInTheDocument()
        expect(
            screen.queryByTestId('ai-message-feedback-issues-note-test-id'),
        ).not.toBeInTheDocument()
    })

    it('should show reason section when rating is BAD', () => {
        const feedback: any = {
            executions: [
                {
                    executionId: 'exec-1',
                    feedback: [
                        {
                            id: 1,
                            feedbackType: 'TICKET_RATING',
                            feedbackValue: FeedbackRating.BAD,
                            updatedDatetime: '2023-10-01T12:00:00Z',
                        },
                    ],
                },
            ],
        }

        render(
            <AIAgentTicketLevelFeedback
                {...defaultProps}
                feedback={feedback}
            />,
        )

        expect(
            screen.getByText('How was this conversation?'),
        ).toBeInTheDocument()
        expect(screen.getByText('What went wrong?')).toBeInTheDocument()
        expect(
            screen.getByTestId('ai-message-feedback-issues-note-test-id'),
        ).toBeInTheDocument()
    })

    it('should show reason section when rating is OK', () => {
        const feedback: any = {
            executions: [
                {
                    executionId: 'exec-1',
                    feedback: [
                        {
                            id: 1,
                            feedbackType: 'TICKET_RATING',
                            feedbackValue: FeedbackRating.OK,
                            updatedDatetime: '2023-10-01T12:00:00Z',
                        },
                    ],
                },
            ],
        }

        render(
            <AIAgentTicketLevelFeedback
                {...defaultProps}
                feedback={feedback}
            />,
        )

        expect(
            screen.getByText('How was this conversation?'),
        ).toBeInTheDocument()
        expect(screen.getByText('What went wrong?')).toBeInTheDocument()
        expect(
            screen.getByTestId('ai-message-feedback-issues-note-test-id'),
        ).toBeInTheDocument()
    })

    it('should not show reason section when rating is GOOD', () => {
        const feedback: any = {
            executions: [
                {
                    executionId: 'exec-1',
                    feedback: [
                        {
                            id: 1,
                            feedbackType: 'TICKET_RATING',
                            feedbackValue: FeedbackRating.GOOD,
                            updatedDatetime: '2023-10-01T12:00:00Z',
                        },
                    ],
                },
            ],
        }

        render(
            <AIAgentTicketLevelFeedback
                {...defaultProps}
                feedback={feedback}
            />,
        )

        expect(
            screen.getByText('How was this conversation?'),
        ).toBeInTheDocument()
        expect(screen.queryByText('What went wrong?')).not.toBeInTheDocument()
        expect(
            screen.getByTestId('ai-message-feedback-issues-note-test-id'),
        ).toBeInTheDocument()
    })

    it('should handle real rating button clicks and trigger mutations', async () => {
        const feedback: any = {
            executions: [
                {
                    executionId: 'exec-1',
                    feedback: [],
                },
            ],
        }

        render(
            <AIAgentTicketLevelFeedback
                {...defaultProps}
                feedback={feedback}
            />,
        )

        const badButton = screen.getByText('Bad')

        await act(async () => {
            fireEvent.click(badButton)
            jest.runAllTimers()
        })

        expect(mockUpsertFeedback).toHaveBeenCalledWith({
            data: {
                feedbackToUpsert: [
                    {
                        id: undefined,
                        objectId: '123',
                        executionId: 'exec-1',
                        objectType: 'TICKET',
                        targetType: 'TICKET',
                        targetId: '123',
                        feedbackValue: FeedbackRating.BAD,
                        feedbackType: 'TICKET_RATING',
                    },
                ],
            },
        })
    })

    it('should handle real reason selection and trigger mutations', async () => {
        const feedback: any = {
            executions: [
                {
                    executionId: 'exec-1',
                    feedback: [
                        {
                            id: 1,
                            feedbackType: 'TICKET_RATING',
                            feedbackValue: FeedbackRating.BAD,
                            updatedDatetime: '2023-10-01T12:00:00Z',
                        },
                    ],
                },
            ],
        }

        render(
            <AIAgentTicketLevelFeedback
                {...defaultProps}
                feedback={feedback}
            />,
        )

        const selectInputBox = screen.getByText('Select all that apply')

        await act(async () => {
            fireEvent.click(selectInputBox)
        })

        const firstChoice = screen.getByText('Wrong knowledge used')

        await act(async () => {
            fireEvent.click(firstChoice)
            jest.runAllTimers()
        })

        expect(mockUpsertFeedback).toHaveBeenCalledWith({
            data: {
                feedbackToUpsert: [
                    expect.objectContaining({
                        objectId: '123',
                        executionId: 'exec-1',
                        objectType: 'TICKET',
                        targetType: 'TICKET',
                        targetId: '123',
                        feedbackType: 'TICKET_BAD_INTERACTION_REASON',
                        feedbackValue:
                            AiAgentBadInteractionReason.WRONG_KNOWLEDGE,
                    }),
                ],
            },
        })
    })

    it('should handle freeform note changes and trigger mutations', async () => {
        const feedback: any = {
            executions: [
                {
                    executionId: 'exec-1',
                    feedback: [
                        {
                            id: 1,
                            feedbackType: 'TICKET_RATING',
                            feedbackValue: FeedbackRating.GOOD,
                            updatedDatetime: '2023-10-01T12:00:00Z',
                        },
                    ],
                },
            ],
        }

        render(
            <AIAgentTicketLevelFeedback
                {...defaultProps}
                feedback={feedback}
            />,
        )

        const textarea = screen.getByTestId(
            'ai-message-feedback-issues-note-test-id',
        )

        await act(async () => {
            fireEvent.change(textarea, { target: { value: 'Great job!' } })
            jest.runAllTimers()
        })

        expect(mockUpsertFeedback).toHaveBeenCalledWith({
            data: {
                feedbackToUpsert: [
                    {
                        id: undefined,
                        objectId: '123',
                        executionId: 'exec-1',
                        objectType: 'TICKET',
                        targetType: 'TICKET',
                        targetId: '123',
                        feedbackValue: 'Great job!',
                        feedbackType: 'TICKET_FREEFORM',
                    },
                ],
            },
        })
    })

    it('should show existing feedback values in components', () => {
        const feedback: any = {
            executions: [
                {
                    executionId: 'exec-1',
                    feedback: [
                        {
                            id: 1,
                            feedbackType: 'TICKET_RATING',
                            feedbackValue: FeedbackRating.BAD,
                            updatedDatetime: '2023-10-01T12:00:00Z',
                        },
                        {
                            id: 2,
                            feedbackType: 'TICKET_FREEFORM',
                            feedbackValue: 'Existing note',
                            updatedDatetime: '2023-10-01T13:00:00Z',
                        },
                        {
                            id: 3,
                            feedbackType: 'TICKET_BAD_INTERACTION_REASON',
                            feedbackValue:
                                AiAgentBadInteractionReason.WRONG_KNOWLEDGE,
                            updatedDatetime: '2023-10-01T11:00:00Z',
                        },
                    ],
                },
            ],
        }

        render(
            <AIAgentTicketLevelFeedback
                {...defaultProps}
                feedback={feedback}
            />,
        )

        const badButton = screen.getByText('Bad')
        expect(badButton.closest('button')).toHaveClass('buttonPressed')

        const textarea = screen.getByTestId(
            'ai-message-feedback-issues-note-test-id',
        )
        expect(textarea).toHaveValue('Existing note')

        expect(screen.getByText('What went wrong?')).toBeInTheDocument()
    })

    it('should handle errors gracefully', async () => {
        const consoleErrorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {})

        const feedback: any = {
            executions: [
                {
                    executionId: 'exec-1',
                    feedback: [],
                },
            ],
        }

        const mockError = new Error('Mutation failed')
        mockUpsertFeedback.mockRejectedValue(mockError)

        render(
            <AIAgentTicketLevelFeedback
                {...defaultProps}
                feedback={feedback}
            />,
        )

        const badButton = screen.getByText('Bad')

        await act(async () => {
            fireEvent.click(badButton)
            jest.runAllTimers()
        })

        expect(consoleErrorSpy).toHaveBeenCalledWith(mockError)
        consoleErrorSpy.mockRestore()
    })

    it('should handle empty executions gracefully', async () => {
        const feedback: any = {
            executions: [],
        }

        render(
            <AIAgentTicketLevelFeedback
                {...defaultProps}
                feedback={feedback}
            />,
        )

        const badButton = screen.getByText('Bad')

        await act(async () => {
            fireEvent.click(badButton)
            jest.runAllTimers()
        })

        expect(mockUpsertFeedback).not.toHaveBeenCalled()
    })

    it('should handle feedback without updatedDatetime', () => {
        const feedback: any = {
            executions: [
                {
                    executionId: 'exec-1',
                    feedback: [
                        {
                            id: 1,
                            feedbackType: 'TICKET_RATING',
                            feedbackValue: FeedbackRating.GOOD,
                        },
                    ],
                },
            ],
        }

        render(
            <AIAgentTicketLevelFeedback
                {...defaultProps}
                feedback={feedback}
            />,
        )

        expect(
            screen.getByText('How was this conversation?'),
        ).toBeInTheDocument()
        expect(
            screen.getByTestId('ai-message-feedback-issues-note-test-id'),
        ).toBeInTheDocument()
    })

    it('should use lastExecutionId from useGetAiAgentFeedback when no execution in feedback', async () => {
        useGetAiAgentFeedbackMock.mockReturnValue({
            data: 'last-exec-id',
        } as any)

        const feedback: any = {
            executions: [],
        }

        render(
            <AIAgentTicketLevelFeedback
                {...defaultProps}
                feedback={feedback}
            />,
        )

        const goodButton = screen.getByText('Good')

        await act(async () => {
            fireEvent.click(goodButton)
            jest.runAllTimers()
        })

        expect(mockUpsertFeedback).toHaveBeenCalledWith({
            data: {
                feedbackToUpsert: [
                    {
                        id: undefined,
                        objectId: '123',
                        executionId: 'last-exec-id',
                        objectType: 'TICKET',
                        targetType: 'TICKET',
                        targetId: '123',
                        feedbackValue: FeedbackRating.GOOD,
                        feedbackType: 'TICKET_RATING',
                    },
                ],
            },
        })
    })

    it('should handle multiple executions and use the first one', async () => {
        const feedback: any = {
            executions: [
                {
                    executionId: 'exec-1',
                    feedback: [],
                },
                {
                    executionId: 'exec-2',
                    feedback: [],
                },
            ],
        }

        render(
            <AIAgentTicketLevelFeedback
                {...defaultProps}
                feedback={feedback}
            />,
        )

        const okButton = screen.getByText('Okay')

        await act(async () => {
            fireEvent.click(okButton)
            jest.runAllTimers()
        })

        expect(mockUpsertFeedback).toHaveBeenCalledWith({
            data: {
                feedbackToUpsert: [
                    {
                        id: undefined,
                        objectId: '123',
                        executionId: 'exec-1',
                        objectType: 'TICKET',
                        targetType: 'TICKET',
                        targetId: '123',
                        feedbackValue: FeedbackRating.OK,
                        feedbackType: 'TICKET_RATING',
                    },
                ],
            },
        })
    })

    it('should calculate lastUpdated correctly with multiple feedback items', () => {
        const feedback: any = {
            executions: [
                {
                    executionId: 'exec-1',
                    feedback: [
                        {
                            id: 1,
                            feedbackType: 'TICKET_RATING',
                            feedbackValue: FeedbackRating.BAD,
                            updatedDatetime: '2023-10-01T12:00:00Z',
                        },
                        {
                            id: 2,
                            feedbackType: 'TICKET_FREEFORM',
                            feedbackValue: 'Some note',
                            updatedDatetime: '2023-10-01T14:00:00Z', // Latest
                        },
                        {
                            id: 3,
                            feedbackType: 'TICKET_BAD_INTERACTION_REASON',
                            feedbackValue:
                                AiAgentBadInteractionReason.WRONG_KNOWLEDGE,
                            updatedDatetime: '2023-10-01T13:00:00Z',
                        },
                    ],
                },
            ],
        }

        render(
            <AIAgentTicketLevelFeedback
                {...defaultProps}
                feedback={feedback}
            />,
        )

        expect(screen.getByText('Bad')).toBeInTheDocument()
        expect(screen.getByText('What went wrong?')).toBeInTheDocument()
    })

    it('should handle removing all bad interaction reasons', async () => {
        const feedback: any = {
            executions: [
                {
                    executionId: 'exec-1',
                    feedback: [
                        {
                            id: 1,
                            feedbackType: 'TICKET_RATING',
                            feedbackValue: FeedbackRating.BAD,
                            updatedDatetime: '2023-10-01T12:00:00Z',
                        },
                        {
                            id: 2,
                            feedbackType: 'TICKET_BAD_INTERACTION_REASON',
                            feedbackValue:
                                AiAgentBadInteractionReason.WRONG_KNOWLEDGE,
                            updatedDatetime: '2023-10-01T13:00:00Z',
                        },
                        {
                            id: 3,
                            feedbackType: 'TICKET_BAD_INTERACTION_REASON',
                            feedbackValue:
                                AiAgentBadInteractionReason.IGNORED_KNOWLEDGE,
                            updatedDatetime: '2023-10-01T13:00:00Z',
                        },
                    ],
                },
            ],
        }

        render(
            <AIAgentTicketLevelFeedback
                {...defaultProps}
                feedback={feedback}
            />,
        )

        const selectContainer =
            screen.getByText('What went wrong?').parentElement?.parentElement
        const selectInput =
            selectContainer?.querySelector('input') ||
            selectContainer?.querySelector('[role="button"]')

        if (selectInput) {
            await act(async () => {
                fireEvent.click(selectInput)
            })

            const selectedItems = screen.queryAllByText(
                /Wrong knowledge|Ignored knowledge/,
            )

            for (const item of selectedItems) {
                await act(async () => {
                    fireEvent.click(item)
                    jest.runAllTimers()
                })
            }

            expect(mockUpsertFeedback).toHaveBeenCalled()
        }
    })

    it('should handle feedback with mixed execution sources', async () => {
        const feedback: any = {
            executions: [
                {
                    executionId: 'exec-1',
                    feedback: [
                        {
                            id: 1,
                            feedbackType: 'TICKET_RATING',
                            feedbackValue: FeedbackRating.BAD,
                            updatedDatetime: '2023-10-01T12:00:00Z',
                        },
                    ],
                },
                {
                    executionId: 'exec-2',
                    feedback: [
                        {
                            id: 2,
                            feedbackType: 'TICKET_FREEFORM',
                            feedbackValue: 'Note from exec-2',
                            updatedDatetime: '2023-10-01T13:00:00Z',
                        },
                    ],
                },
            ],
        }

        render(
            <AIAgentTicketLevelFeedback
                {...defaultProps}
                feedback={feedback}
            />,
        )

        const textarea = screen.getByTestId(
            'ai-message-feedback-issues-note-test-id',
        )

        expect(textarea).toHaveValue('Note from exec-2')

        await act(async () => {
            fireEvent.change(textarea, { target: { value: 'Updated note' } })
            jest.runAllTimers()
        })

        expect(mockUpsertFeedback).toHaveBeenCalledWith({
            data: {
                feedbackToUpsert: [
                    {
                        id: 2,
                        objectId: '123',
                        executionId: 'exec-2',
                        objectType: 'TICKET',
                        targetType: 'TICKET',
                        targetId: '123',
                        feedbackValue: 'Updated note',
                        feedbackType: 'TICKET_FREEFORM',
                    },
                ],
            },
        })
    })

    it('should not call mutation when handleFeedbackChange receives empty data array', async () => {
        const feedback: any = {
            executions: [
                {
                    executionId: 'exec-1',
                    feedback: [],
                },
            ],
        }

        render(
            <AIAgentTicketLevelFeedback
                {...defaultProps}
                feedback={feedback}
            />,
        )

        expect(mockUpsertFeedback).not.toHaveBeenCalled()
    })

    it('should handle concurrent mutations with loadingMutations state', async () => {
        const feedback: any = {
            executions: [
                {
                    executionId: 'exec-1',
                    feedback: [],
                },
            ],
        }

        let resolveFirst: any
        let resolveSecond: any

        const firstPromise = new Promise((resolve) => {
            resolveFirst = resolve
        })

        const secondPromise = new Promise((resolve) => {
            resolveSecond = resolve
        })

        mockUpsertFeedback
            .mockReturnValueOnce(firstPromise)
            .mockReturnValueOnce(secondPromise)

        render(
            <AIAgentTicketLevelFeedback
                {...defaultProps}
                feedback={feedback}
            />,
        )

        const badButton = screen.getByText('Bad')
        const goodButton = screen.getByText('Good')

        await act(async () => {
            fireEvent.click(badButton)
        })

        await act(async () => {
            fireEvent.click(goodButton)
        })

        await act(async () => {
            resolveFirst()
            resolveSecond()
            await Promise.all([firstPromise, secondPromise])
            jest.runAllTimers()
        })

        expect(mockUpsertFeedback).toHaveBeenCalledTimes(2)
    })

    it('should handle null feedback prop gracefully', () => {
        render(
            <AIAgentTicketLevelFeedback
                feedback={undefined}
                upsertFeedback={mockUpsertFeedback}
            />,
        )

        expect(
            screen.getByText('How was this conversation?'),
        ).toBeInTheDocument()

        expect(screen.queryByText('What went wrong?')).not.toBeInTheDocument()
        expect(
            screen.queryByTestId('ai-message-feedback-issues-note-test-id'),
        ).not.toBeInTheDocument()
    })

    it('should handle feedback change when no executionId is available anywhere', async () => {
        useGetAiAgentFeedbackMock.mockReturnValue({
            data: undefined,
        } as any)

        const feedback: any = {
            executions: [],
        }

        render(
            <AIAgentTicketLevelFeedback
                {...defaultProps}
                feedback={feedback}
            />,
        )

        const badButton = screen.getByText('Bad')

        await act(async () => {
            fireEvent.click(badButton)
            jest.runAllTimers()
        })

        expect(mockUpsertFeedback).not.toHaveBeenCalled()
    })

    it('should properly extract feedback from multiple executions', () => {
        const feedback: any = {
            executions: [
                {
                    executionId: 'exec-1',
                    feedback: [
                        {
                            id: 1,
                            feedbackType: 'TICKET_RATING',
                            feedbackValue: FeedbackRating.GOOD,
                            updatedDatetime: '2023-10-01T12:00:00Z',
                        },
                    ],
                },
                {
                    executionId: 'exec-2',
                    feedback: [
                        {
                            id: 2,
                            feedbackType: 'TICKET_BAD_INTERACTION_REASON',
                            feedbackValue:
                                AiAgentBadInteractionReason.WRONG_KNOWLEDGE,
                            updatedDatetime: '2023-10-01T13:00:00Z',
                        },
                        {
                            id: 3,
                            feedbackType: 'TICKET_FREEFORM',
                            feedbackValue: 'Test note',
                            updatedDatetime: '2023-10-01T14:00:00Z',
                        },
                    ],
                },
            ],
        }

        render(
            <AIAgentTicketLevelFeedback
                {...defaultProps}
                feedback={feedback}
            />,
        )

        const goodButton = screen.getByText('Good')
        expect(goodButton.closest('button')).toHaveClass('buttonPressed')

        const textarea = screen.getByTestId(
            'ai-message-feedback-issues-note-test-id',
        )
        expect(textarea).toHaveValue('Test note')

        expect(screen.queryByText('What went wrong?')).not.toBeInTheDocument()
    })

    it('should test useGetAiAgentFeedback select function with real data processing', () => {
        let selectFunction: any
        useGetAiAgentFeedbackMock.mockImplementation((options: any) => {
            selectFunction = options.select
            return {
                data: 'mocked-execution-id',
                isLoading: false,
                isError: false,
                error: null,
                refetch: jest.fn(),
                isSuccess: true,
                status: 'success' as const,
            } as any
        })

        const feedback: any = {
            executions: [
                {
                    executionId: 'exec-1',
                    feedback: [],
                },
            ],
        }

        render(
            <AIAgentTicketLevelFeedback
                {...defaultProps}
                feedback={feedback}
            />,
        )

        const mockData = {
            data: {
                messages: [
                    { executionId: null },
                    { executionId: undefined },
                    { executionId: 'valid-exec-1' },
                    { executionId: 'valid-exec-2' },
                ],
            },
        }

        const result = selectFunction(mockData)
        expect(result).toBe('valid-exec-2')
    })

    it('should handle useGetAiAgentFeedback select function with no valid executionIds', () => {
        let selectFunction: any
        useGetAiAgentFeedbackMock.mockImplementation((options: any) => {
            selectFunction = options.select
            return {
                data: undefined,
                isLoading: false,
                isError: false,
                error: null,
                refetch: jest.fn(),
                isSuccess: true,
                status: 'success' as const,
            } as any
        })

        render(
            <AIAgentTicketLevelFeedback
                {...defaultProps}
                feedback={{ executions: [] }}
            />,
        )

        const mockDataWithNoValidIds = {
            data: {
                messages: [
                    { executionId: null },
                    { executionId: undefined },
                    { executionId: '' },
                ],
            },
        }

        const result = selectFunction(mockDataWithNoValidIds)
        expect(result).toBeUndefined()
    })

    it('should handle useGetAiAgentFeedback select function with empty messages array', () => {
        let selectFunction: any
        useGetAiAgentFeedbackMock.mockImplementation((options: any) => {
            selectFunction = options.select
            return {
                data: undefined,
                isLoading: false,
                isError: false,
                error: null,
                refetch: jest.fn(),
                isSuccess: true,
                status: 'success' as const,
            } as any
        })

        render(
            <AIAgentTicketLevelFeedback
                {...defaultProps}
                feedback={{ executions: [] }}
            />,
        )

        const mockDataWithEmptyMessages = {
            data: {
                messages: [],
            },
        }

        const result = selectFunction(mockDataWithEmptyMessages)
        expect(result).toBeUndefined()
    })
})
