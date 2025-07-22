import React from 'react'

import { act, fireEvent, render, screen } from '@testing-library/react'

import useAppSelector from 'hooks/useAppSelector'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getDateAndTimeFormatter } from 'state/currentUser/selectors'
import { getTicketState } from 'state/ticket/selectors'

import { AIAgentTicketLevelFeedback } from '../AIAgentTicketLevelFeedback/AIAgentTicketLevelFeedback'
import { AiAgentBadInteractionReason, FeedbackRating } from '../types'

jest.mock('hooks/useAppSelector')
const useAppSelectorMock = useAppSelector as jest.Mock

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

        expect(mockUpsertFeedback).toHaveBeenCalledWith({
            data: {
                feedbackToUpsert: [],
            },
        })
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
})
