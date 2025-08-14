import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import { FeedbackExecutionsItem } from '@gorgias/knowledge-service-types'

import useAppSelector from 'hooks/useAppSelector'
import { getDateAndTimeFormatter } from 'state/currentUser/selectors'

import { AIAgentFeedbackRatingSection } from '../AIAgentTicketLevelFeedback/AIAgentFeedbackRatingSection'
import { AiAgentBadInteractionReason, FeedbackRating } from '../types'

jest.mock('hooks/useAppSelector')
const useAppSelectorMock = useAppSelector as jest.Mock

describe('AIAgentFeedbackRatingSection', () => {
    const defaultProps = {
        handleFeedbackChange: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
        jest.useFakeTimers()

        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === getDateAndTimeFormatter) {
                return () => 'MMMM DD, YYYY'
            }
            return null
        })
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('should render the rating section with header and buttons', () => {
        render(<AIAgentFeedbackRatingSection {...defaultProps} />)

        expect(
            screen.getByText('How was this conversation?'),
        ).toBeInTheDocument()
        expect(screen.getByText('Bad')).toBeInTheDocument()
        expect(screen.getByText('Okay')).toBeInTheDocument()
        expect(screen.getByText('Good')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /bad/i })).toBeInTheDocument()
    })

    it('should render AutoSaveBadge with INITIAL state when no loadingMutations', () => {
        render(<AIAgentFeedbackRatingSection {...defaultProps} />)

        expect(document.querySelector('.autoSaveBadge')).not.toBeInTheDocument()
    })

    it('should render AutoSaveBadge with SAVING state when loadingMutations has items', () => {
        render(
            <AIAgentFeedbackRatingSection
                {...defaultProps}
                loadingMutations={['mutation1', 'mutation2']}
            />,
        )

        expect(screen.getByText('Saving')).toBeInTheDocument()
    })

    it('should render AutoSaveBadge with SAVED state when loadingMutations is empty array', () => {
        render(
            <AIAgentFeedbackRatingSection
                {...defaultProps}
                loadingMutations={[]}
            />,
        )

        expect(screen.getByText('Saved')).toBeInTheDocument()
    })

    it('should render AutoSaveBadge with lastUpdated date', () => {
        const lastUpdated = new Date('2023-10-01T12:00:00Z')
        render(
            <AIAgentFeedbackRatingSection
                {...defaultProps}
                lastUpdated={lastUpdated}
            />,
        )

        expect(document.querySelector('.autoSaveBadge')).toBeInTheDocument()
        expect(screen.getByText('check')).toBeInTheDocument()
    })

    it('should set selectedRating from ticketRating prop', () => {
        const ticketRating: ArrayItem<FeedbackExecutionsItem['feedback']> = {
            id: 1,
            feedbackValue: FeedbackRating.GOOD,
            objectType: 'TICKET',
            objectId: '123',
            targetType: 'TICKET',
            targetId: '123',
            feedbackType: 'TICKET_RATING',
            submittedBy: 1,
            createdDatetime: '2023-10-01T00:00:00Z',
            updatedDatetime: '2023-10-01T00:00:00Z',
            executionId: 'test-execution',
        }

        render(
            <AIAgentFeedbackRatingSection
                {...defaultProps}
                ticketRating={ticketRating}
            />,
        )

        const goodButton = screen.getByText('Good').closest('button')
        expect(goodButton).toHaveClass('buttonPressed')
    })

    it('should call handleFeedbackChange when clicking Bad rating', () => {
        const handleFeedbackChange = jest.fn()

        render(
            <AIAgentFeedbackRatingSection
                {...defaultProps}
                handleFeedbackChange={handleFeedbackChange}
            />,
        )

        const badButton = screen.getByText('Bad')
        fireEvent.click(badButton)

        expect(handleFeedbackChange).toHaveBeenCalledWith([
            {
                resourceType: 'TICKET_RATING',
                feedbackValue: FeedbackRating.BAD,
                id: undefined,
            },
        ])
    })

    it('should call handleFeedbackChange when clicking Okay rating', () => {
        const handleFeedbackChange = jest.fn()

        render(
            <AIAgentFeedbackRatingSection
                {...defaultProps}
                handleFeedbackChange={handleFeedbackChange}
            />,
        )

        const okayButton = screen.getByText('Okay')
        fireEvent.click(okayButton)

        expect(handleFeedbackChange).toHaveBeenCalledWith([
            {
                resourceType: 'TICKET_RATING',
                feedbackValue: FeedbackRating.OK,
                id: undefined,
            },
        ])
    })

    it('should call handleFeedbackChange when clicking Good rating', () => {
        const handleFeedbackChange = jest.fn()

        render(
            <AIAgentFeedbackRatingSection
                {...defaultProps}
                handleFeedbackChange={handleFeedbackChange}
            />,
        )

        const goodButton = screen.getByText('Good')
        fireEvent.click(goodButton)

        expect(handleFeedbackChange).toHaveBeenCalledWith([
            {
                resourceType: 'TICKET_RATING',
                feedbackValue: FeedbackRating.GOOD,
                id: undefined,
            },
        ])
    })

    it('should not call handleFeedbackChange when clicking the same rating again', () => {
        const handleFeedbackChange = jest.fn()
        const ticketRating: ArrayItem<FeedbackExecutionsItem['feedback']> = {
            id: 1,
            feedbackValue: FeedbackRating.GOOD,
            objectType: 'TICKET',
            objectId: '123',
            targetType: 'TICKET',
            targetId: '123',
            feedbackType: 'TICKET_RATING',
            submittedBy: 1,
            createdDatetime: '2023-10-01T00:00:00Z',
            updatedDatetime: '2023-10-01T00:00:00Z',
            executionId: 'test-execution',
        }

        render(
            <AIAgentFeedbackRatingSection
                {...defaultProps}
                handleFeedbackChange={handleFeedbackChange}
                ticketRating={ticketRating}
            />,
        )

        const goodButton = screen.getByText('Good')
        fireEvent.click(goodButton)

        expect(handleFeedbackChange).not.toHaveBeenCalled()
    })

    it('should clear badInteractionReasons when clicking Good rating with existing bad reasons', () => {
        const handleFeedbackChange = jest.fn()
        const badInteractionReasons: FeedbackExecutionsItem['feedback'] = [
            {
                id: 2,
                feedbackValue:
                    AiAgentBadInteractionReason.DIDNT_PROCESS_ATTACHMENT_CORRECTLY,
                objectType: 'TICKET',
                objectId: '123',
                targetType: 'TICKET',
                targetId: '123',
                feedbackType: 'TICKET_BAD_INTERACTION_REASON',
                submittedBy: 1,
                createdDatetime: '2023-10-01T00:00:00Z',
                updatedDatetime: '2023-10-01T00:00:00Z',
                executionId: 'test-execution',
            },
            {
                id: 3,
                feedbackValue: AiAgentBadInteractionReason.HALLUCINATION,
                objectType: 'TICKET',
                objectId: '123',
                targetType: 'TICKET',
                targetId: '123',
                feedbackType: 'TICKET_BAD_INTERACTION_REASON',
                submittedBy: 1,
                createdDatetime: '2023-10-01T00:00:00Z',
                updatedDatetime: '2023-10-01T00:00:00Z',
                executionId: 'test-execution',
            },
        ]

        render(
            <AIAgentFeedbackRatingSection
                {...defaultProps}
                handleFeedbackChange={handleFeedbackChange}
                badInteractionReasons={badInteractionReasons}
            />,
        )

        const goodButton = screen.getByText('Good')
        fireEvent.click(goodButton)

        expect(handleFeedbackChange).toHaveBeenCalledWith([
            {
                resourceType: 'TICKET_RATING',
                feedbackValue: FeedbackRating.GOOD,
                id: undefined,
            },
            {
                resourceType: 'TICKET_BAD_INTERACTION_REASON',
                feedbackValue: null,
                id: 2,
            },
            {
                resourceType: 'TICKET_BAD_INTERACTION_REASON',
                feedbackValue: null,
                id: 3,
            },
        ])
    })

    it('should not clear badInteractionReasons when clicking non-Good rating', () => {
        const handleFeedbackChange = jest.fn()
        const badInteractionReasons: FeedbackExecutionsItem['feedback'] = [
            {
                id: 2,
                feedbackValue: AiAgentBadInteractionReason.OTHER,
                objectType: 'TICKET',
                objectId: '123',
                targetType: 'TICKET',
                targetId: '123',
                feedbackType: 'TICKET_BAD_INTERACTION_REASON',
                submittedBy: 1,
                createdDatetime: '2023-10-01T00:00:00Z',
                updatedDatetime: '2023-10-01T00:00:00Z',
                executionId: 'test-execution',
            },
        ]

        render(
            <AIAgentFeedbackRatingSection
                {...defaultProps}
                handleFeedbackChange={handleFeedbackChange}
                badInteractionReasons={badInteractionReasons}
            />,
        )

        const badButton = screen.getByText('Bad')
        fireEvent.click(badButton)

        expect(handleFeedbackChange).toHaveBeenCalledWith([
            {
                resourceType: 'TICKET_RATING',
                feedbackValue: FeedbackRating.BAD,
                id: undefined,
            },
        ])
    })

    it('should include ticketRating id when provided', () => {
        const handleFeedbackChange = jest.fn()
        const ticketRating: ArrayItem<FeedbackExecutionsItem['feedback']> = {
            id: 123,
            feedbackValue: FeedbackRating.BAD,
            objectType: 'TICKET',
            objectId: '123',
            targetType: 'TICKET',
            targetId: '123',
            feedbackType: 'TICKET_RATING',
            submittedBy: 1,
            createdDatetime: '2023-10-01T00:00:00Z',
            updatedDatetime: '2023-10-01T00:00:00Z',
            executionId: 'test-execution',
        }

        render(
            <AIAgentFeedbackRatingSection
                {...defaultProps}
                handleFeedbackChange={handleFeedbackChange}
                ticketRating={ticketRating}
            />,
        )

        const goodButton = screen.getByText('Good')
        fireEvent.click(goodButton)

        expect(handleFeedbackChange).toHaveBeenCalledWith([
            {
                resourceType: 'TICKET_RATING',
                feedbackValue: FeedbackRating.GOOD,
                id: 123,
            },
        ])
    })

    it('should update selectedRating when ticketRating prop changes', () => {
        const initialTicketRating: ArrayItem<
            FeedbackExecutionsItem['feedback']
        > = {
            id: 1,
            feedbackValue: FeedbackRating.BAD,
            objectType: 'TICKET',
            objectId: '123',
            targetType: 'TICKET',
            targetId: '123',
            feedbackType: 'TICKET_RATING',
            submittedBy: 1,
            createdDatetime: '2023-10-01T00:00:00Z',
            updatedDatetime: '2023-10-01T00:00:00Z',
            executionId: 'test-execution',
        }

        const { rerender } = render(
            <AIAgentFeedbackRatingSection
                {...defaultProps}
                ticketRating={initialTicketRating}
            />,
        )

        expect(screen.getByText('Bad').closest('button')).toHaveClass(
            'buttonPressed',
        )
        expect(screen.getByText('Good').closest('button')).not.toHaveClass(
            'buttonPressed',
        )

        const updatedTicketRating: ArrayItem<
            FeedbackExecutionsItem['feedback']
        > = {
            ...initialTicketRating,
            feedbackValue: FeedbackRating.GOOD,
        }

        rerender(
            <AIAgentFeedbackRatingSection
                {...defaultProps}
                ticketRating={updatedTicketRating}
            />,
        )

        expect(screen.getByText('Bad').closest('button')).not.toHaveClass(
            'buttonPressed',
        )
        expect(screen.getByText('Good').closest('button')).toHaveClass(
            'buttonPressed',
        )
    })

    it('should handle undefined ticketRating', () => {
        render(<AIAgentFeedbackRatingSection {...defaultProps} />)

        expect(screen.getByText('Bad').closest('button')).not.toHaveClass(
            'buttonPressed',
        )
        expect(screen.getByText('Okay').closest('button')).not.toHaveClass(
            'buttonPressed',
        )
        expect(screen.getByText('Good').closest('button')).not.toHaveClass(
            'buttonPressed',
        )
    })

    it('should handle empty badInteractionReasons array', () => {
        const handleFeedbackChange = jest.fn()

        render(
            <AIAgentFeedbackRatingSection
                {...defaultProps}
                handleFeedbackChange={handleFeedbackChange}
                badInteractionReasons={[]}
            />,
        )

        const goodButton = screen.getByText('Good')
        fireEvent.click(goodButton)

        expect(handleFeedbackChange).toHaveBeenCalledWith([
            {
                resourceType: 'TICKET_RATING',
                feedbackValue: FeedbackRating.GOOD,
                id: undefined,
            },
        ])
    })

    it('should handle undefined badInteractionReasons', () => {
        const handleFeedbackChange = jest.fn()

        render(
            <AIAgentFeedbackRatingSection
                {...defaultProps}
                handleFeedbackChange={handleFeedbackChange}
                badInteractionReasons={undefined}
            />,
        )

        const goodButton = screen.getByText('Good')
        fireEvent.click(goodButton)

        expect(handleFeedbackChange).toHaveBeenCalledWith([
            {
                resourceType: 'TICKET_RATING',
                feedbackValue: FeedbackRating.GOOD,
                id: undefined,
            },
        ])
    })

    it('should render material icons correctly', () => {
        render(<AIAgentFeedbackRatingSection {...defaultProps} />)

        expect(
            screen.getByText('sentiment_very_dissatisfied'),
        ).toBeInTheDocument()
        expect(screen.getByText('sentiment_neutral')).toBeInTheDocument()
        expect(screen.getByText('sentiment_very_satisfied')).toBeInTheDocument()
    })

    it('should apply correct CSS classes when rating is selected', () => {
        const ticketRating: ArrayItem<FeedbackExecutionsItem['feedback']> = {
            id: 1,
            feedbackValue: FeedbackRating.OK,
            objectType: 'TICKET',
            objectId: '123',
            targetType: 'TICKET',
            targetId: '123',
            feedbackType: 'TICKET_RATING',
            submittedBy: 1,
            createdDatetime: '2023-10-01T00:00:00Z',
            updatedDatetime: '2023-10-01T00:00:00Z',
            executionId: 'test-execution',
        }

        render(
            <AIAgentFeedbackRatingSection
                {...defaultProps}
                ticketRating={ticketRating}
            />,
        )

        expect(screen.getByText('Bad').closest('button')).not.toHaveClass(
            'buttonPressed',
        )
        expect(screen.getByText('Okay').closest('button')).toHaveClass(
            'buttonPressed',
        )
        expect(screen.getByText('Good').closest('button')).not.toHaveClass(
            'buttonPressed',
        )
    })

    it('should handle ticketRating with null feedbackValue', () => {
        const ticketRating: ArrayItem<FeedbackExecutionsItem['feedback']> = {
            id: 1,
            feedbackValue: null,
            objectType: 'TICKET',
            objectId: '123',
            targetType: 'TICKET',
            targetId: '123',
            feedbackType: 'TICKET_RATING',
            submittedBy: 1,
            createdDatetime: '2023-10-01T00:00:00Z',
            updatedDatetime: '2023-10-01T00:00:00Z',
            executionId: 'test-execution',
        }

        render(
            <AIAgentFeedbackRatingSection
                {...defaultProps}
                ticketRating={ticketRating}
            />,
        )

        expect(screen.getByText('Bad').closest('button')).not.toHaveClass(
            'buttonPressed',
        )
        expect(screen.getByText('Okay').closest('button')).not.toHaveClass(
            'buttonPressed',
        )
        expect(screen.getByText('Good').closest('button')).not.toHaveClass(
            'buttonPressed',
        )
    })

    it('should handle rapid successive clicks correctly', () => {
        const handleFeedbackChange = jest.fn()

        render(
            <AIAgentFeedbackRatingSection
                {...defaultProps}
                handleFeedbackChange={handleFeedbackChange}
            />,
        )

        const badButton = screen.getByText('Bad')
        const goodButton = screen.getByText('Good')

        fireEvent.click(badButton)
        expect(handleFeedbackChange).toHaveBeenNthCalledWith(1, [
            {
                resourceType: 'TICKET_RATING',
                feedbackValue: FeedbackRating.BAD,
                id: undefined,
            },
        ])

        fireEvent.click(goodButton)
        expect(handleFeedbackChange).toHaveBeenNthCalledWith(2, [
            {
                resourceType: 'TICKET_RATING',
                feedbackValue: FeedbackRating.GOOD,
                id: undefined,
            },
        ])

        expect(handleFeedbackChange).toHaveBeenCalledTimes(2)
    })
})
