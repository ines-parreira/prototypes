import React from 'react'

import { render, screen } from '@testing-library/react'

import { FeedbackExecutionsItemFeedbackItem } from '@gorgias/knowledge-service-types'

import { AIAgentFeedbackReasonSection } from '../AIAgentTicketLevelFeedback/AIAgentFeedbackReasonSection'
import { AiAgentBadInteractionReason } from '../types'

describe('AIAgentFeedbackReasonSection', () => {
    const defaultProps = {
        handleFeedbackChange: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the reason section with header and select input', () => {
        render(<AIAgentFeedbackReasonSection {...defaultProps} />)

        expect(screen.getByText('What went wrong?')).toBeInTheDocument()
        expect(screen.getByRole('combobox')).toBeInTheDocument()
        expect(screen.getByText('Select all that apply')).toBeInTheDocument()
    })

    it('should initialize with empty values when no badInteractionReasons provided', () => {
        render(<AIAgentFeedbackReasonSection {...defaultProps} />)

        expect(screen.getByText('Select all that apply')).toBeInTheDocument()
    })

    it('should initialize with values from badInteractionReasons prop', () => {
        const badInteractionReasons: FeedbackExecutionsItemFeedbackItem[] = [
            {
                id: 1,
                feedbackValue: AiAgentBadInteractionReason.WRONG_KNOWLEDGE,
                objectType: 'TICKET',
                objectId: '123',
                targetType: 'TICKET',
                targetId: '123',
                feedbackType: 'TICKET_FREEFORM',
                submittedBy: 1,
                createdDatetime: '2023-10-01T00:00:00Z',
                updatedDatetime: '2023-10-01T00:00:00Z',
                executionId: 'test-execution',
            },
            {
                id: 2,
                feedbackValue: AiAgentBadInteractionReason.HALLUCINATION,
                objectType: 'TICKET',
                objectId: '123',
                targetType: 'TICKET',
                targetId: '123',
                feedbackType: 'TICKET_FREEFORM',
                submittedBy: 1,
                createdDatetime: '2023-10-01T00:00:00Z',
                updatedDatetime: '2023-10-01T00:00:00Z',
                executionId: 'test-execution',
            },
        ]

        render(
            <AIAgentFeedbackReasonSection
                {...defaultProps}
                badInteractionReasons={badInteractionReasons}
            />,
        )

        const expectedText = 'Wrong knowledge used, Hallucination'
        expect(screen.getByText(expectedText)).toBeInTheDocument()
    })

    it('should show selected values in placeholder when values are selected', () => {
        const badInteractionReasons: FeedbackExecutionsItemFeedbackItem[] = [
            {
                id: 1,
                feedbackValue: AiAgentBadInteractionReason.WRONG_KNOWLEDGE,
                objectType: 'TICKET',
                objectId: '123',
                targetType: 'TICKET',
                targetId: '123',
                feedbackType: 'TICKET_FREEFORM',
                submittedBy: 1,
                createdDatetime: '2023-10-01T00:00:00Z',
                updatedDatetime: '2023-10-01T00:00:00Z',
                executionId: 'test-execution',
            },
        ]

        render(
            <AIAgentFeedbackReasonSection
                {...defaultProps}
                badInteractionReasons={badInteractionReasons}
            />,
        )

        expect(screen.getByText('Wrong knowledge used')).toBeInTheDocument()
    })

    it('should render the dropdown component correctly', () => {
        const handleFeedbackChange = jest.fn()

        render(
            <AIAgentFeedbackReasonSection
                {...defaultProps}
                handleFeedbackChange={handleFeedbackChange}
            />,
        )

        const combobox = screen.getByRole('combobox')
        expect(combobox).toBeInTheDocument()
        expect(combobox).toHaveAttribute('tabindex', '0')
    })

    it('should handle undefined badInteractionReasons', () => {
        render(
            <AIAgentFeedbackReasonSection
                {...defaultProps}
                badInteractionReasons={undefined}
            />,
        )

        expect(screen.getByText('Select all that apply')).toBeInTheDocument()
    })

    it('should handle empty badInteractionReasons array', () => {
        render(
            <AIAgentFeedbackReasonSection
                {...defaultProps}
                badInteractionReasons={[]}
            />,
        )

        expect(screen.getByText('Select all that apply')).toBeInTheDocument()
    })

    it('should handle badInteractionReasons with null feedbackValue', () => {
        const badInteractionReasons: any[] = [
            {
                id: 1,
                feedbackValue: null,
                objectType: 'TICKET',
                objectId: '123',
                targetType: 'TICKET',
                targetId: '123',
                feedbackType: 'TICKET_FREEFORM',
                submittedBy: 1,
                createdDatetime: '2023-10-01T00:00:00Z',
                updatedDatetime: '2023-10-01T00:00:00Z',
                executionId: 'test-execution',
            },
        ]

        render(
            <AIAgentFeedbackReasonSection
                {...defaultProps}
                badInteractionReasons={badInteractionReasons}
            />,
        )

        expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('should update values when badInteractionReasons prop changes', () => {
        const initialReasons: FeedbackExecutionsItemFeedbackItem[] = [
            {
                id: 1,
                feedbackValue: AiAgentBadInteractionReason.WRONG_KNOWLEDGE,
                objectType: 'TICKET',
                objectId: '123',
                targetType: 'TICKET',
                targetId: '123',
                feedbackType: 'TICKET_FREEFORM',
                submittedBy: 1,
                createdDatetime: '2023-10-01T00:00:00Z',
                updatedDatetime: '2023-10-01T00:00:00Z',
                executionId: 'test-execution',
            },
        ]

        const { rerender } = render(
            <AIAgentFeedbackReasonSection
                {...defaultProps}
                badInteractionReasons={initialReasons}
            />,
        )

        expect(screen.getByText('Wrong knowledge used')).toBeInTheDocument()

        const updatedReasons: FeedbackExecutionsItemFeedbackItem[] = [
            {
                id: 2,
                feedbackValue: AiAgentBadInteractionReason.HALLUCINATION,
                objectType: 'TICKET',
                objectId: '123',
                targetType: 'TICKET',
                targetId: '123',
                feedbackType: 'TICKET_FREEFORM',
                submittedBy: 1,
                createdDatetime: '2023-10-01T00:00:00Z',
                updatedDatetime: '2023-10-01T00:00:00Z',
                executionId: 'test-execution',
            },
        ]

        rerender(
            <AIAgentFeedbackReasonSection
                {...defaultProps}
                badInteractionReasons={updatedReasons}
            />,
        )

        expect(screen.getByText('Hallucination')).toBeInTheDocument()
    })
})
