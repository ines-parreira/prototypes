import React from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock } from '@repo/testing'
import { useHelpdeskV2MS1Flag } from '@repo/tickets/feature-flags'
import { fireEvent, render, screen } from '@testing-library/react'

import type { TicketQAScoreDimension } from '@gorgias/helpdesk-queries'

import Dimension from 'auto_qa/components/Dimension'
import type { SupportedTicketQAScoreDimension } from 'auto_qa/config'
import { dimensionConfig } from 'auto_qa/config'

jest.mock('@repo/logging', () => ({
    logEvent: jest.fn(),
    SegmentEvent: { AutoQATicketInteraction: 'auto-qa-ticket-interaction' },
}))

jest.mock('@repo/tickets/feature-flags')
const useHelpdeskV2MS1FlagMock = assumeMock(useHelpdeskV2MS1Flag)

describe('Dimension', () => {
    const defaultDimension = {
        id: 2,
        ticket_id: 1,
        user_id: null,
        created_datetime: '2024-01-20T10:00:00Z',
        updated_datetime: '2024-01-21T10:00:00Z',
        name: 'communication_skills',
        prediction: 5,
        explanation: 'Beepity-boopity',
    } as TicketQAScoreDimension

    beforeEach(() => {
        useHelpdeskV2MS1FlagMock.mockReturnValue(true)
    })

    it('should render the component', () => {
        const onChange = jest.fn()
        const { getByText, queryByText } = render(
            <Dimension
                config={dimensionConfig.communication_skills}
                dimension={defaultDimension}
                onChange={onChange}
                ticketId={1}
            />,
        )
        expect(getByText('Communication')).toBeInTheDocument()
        expect(getByText('5/5')).toBeInTheDocument()
        expect(queryByText('Beepity-boopity')).not.toBeInTheDocument()
    })

    it('should automatically expand if the prediction is below the configured threshold', () => {
        const onChange = jest.fn()
        const { getByText } = render(
            <Dimension
                config={dimensionConfig.communication_skills}
                dimension={{ ...defaultDimension, prediction: 4 }}
                onChange={onChange}
                ticketId={1}
            />,
        )
        expect(getByText('Beepity-boopity')).toBeInTheDocument()
    })

    it('should not show footer message under a manual dimension', () => {
        const onChange = jest.fn()
        const accuracyDimension = {
            id: 2,
            ticket_id: 1,
            user_id: null,
            created_datetime: '2024-01-20T10:00:00Z',
            updated_datetime: '2024-01-21T10:00:00Z',
            name: 'accuracy',
            prediction: 5,
            explanation: 'Beepity-boopity',
        } as SupportedTicketQAScoreDimension
        const { queryByText } = render(
            <Dimension
                config={dimensionConfig.accuracy}
                dimension={accuracyDimension}
                onChange={onChange}
                ticketId={1}
            />,
        )
        expect(
            queryByText('AI generated, edit to improve AI model'),
        ).not.toBeInTheDocument()
    })

    it('should show a tooltip when manual dimension explanation is disabled', () => {
        const onChange = jest.fn()
        const accuracyDimension = {
            name: 'accuracy',
        } as SupportedTicketQAScoreDimension
        const { container, queryByText } = render(
            <Dimension
                config={dimensionConfig.accuracy}
                dimension={accuracyDimension}
                onChange={onChange}
                ticketId={1}
            />,
        )

        const expandButton = screen.getByRole('button', {
            name: /Accuracy/,
        })
        fireEvent.click(expandButton)

        const textArea = container.getElementsByClassName('textarea')[0]
        fireEvent.focus(textArea)
        expect(
            queryByText('Please select a score before adding a comment'),
        ).toBeInTheDocument()
    })

    it('should call onChange when the prediction changes', () => {
        const onChange = jest.fn()
        const { getByRole, getByText } = render(
            <Dimension
                config={dimensionConfig.communication_skills}
                dimension={defaultDimension}
                onChange={onChange}
                ticketId={1}
            />,
        )

        const el = getByRole('combobox')
        fireEvent.focus(el)
        fireEvent.click(getByText('4/5'))
        expect(onChange).toHaveBeenCalledWith(4, 'Beepity-boopity')
    })

    it('should call onChange when the explanation changes', () => {
        const onChange = jest.fn()
        const { getByText } = render(
            <Dimension
                config={dimensionConfig.communication_skills}
                dimension={defaultDimension}
                onChange={onChange}
                ticketId={1}
            />,
        )

        fireEvent.click(getByText('arrow_right'))
        fireEvent.change(getByText('Beepity-boopity'), {
            target: { value: 'Yup' },
        })
        expect(onChange).toHaveBeenCalledWith(5, 'Yup')
    })

    it('should check the segment log event has been called when expandable area is expanded', () => {
        const onChange = jest.fn()
        const dimensionName = 'communication_skills'
        render(
            <Dimension
                config={dimensionConfig[dimensionName]}
                dimension={defaultDimension}
                onChange={onChange}
                ticketId={1}
            />,
        )

        const expandButton = screen.getByRole('button', {
            name: /Communication/,
        })

        expect(expandButton).toBeInTheDocument()
        expect(expandButton).toHaveAttribute('aria-expanded', 'false')

        fireEvent.click(expandButton)

        expect(expandButton).toHaveAttribute('aria-expanded', 'true')
        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.AutoQATicketInteraction,
            {
                ticket_id: 1,
                type: `${dimensionName}_toggle_clicked`,
            },
        )
    })

    it('should check the segment log event has not been called when expandable area is collapsed', () => {
        const onChange = jest.fn()
        const dimensionName = 'communication_skills'
        render(
            <Dimension
                config={dimensionConfig[dimensionName]}
                dimension={{ ...defaultDimension, prediction: 4 }}
                onChange={onChange}
                ticketId={1}
            />,
        )

        const expandButton = screen.getByRole('button', {
            name: /Communication/,
        })

        expect(expandButton).toBeInTheDocument()
        expect(expandButton).toHaveAttribute('aria-expanded', 'true')

        fireEvent.click(expandButton as HTMLButtonElement)

        expect(expandButton).toHaveAttribute('aria-expanded', 'false')
        expect(logEvent).not.toHaveBeenCalled()
    })

    describe('UIVisionMilestone1 feature flag', () => {
        it('should apply hasUIVisionMS1 class to container and explanation when UIVisionMilestone1 is enabled', () => {
            const onChange = jest.fn()

            const { container } = render(
                <Dimension
                    config={dimensionConfig.communication_skills}
                    dimension={defaultDimension}
                    onChange={onChange}
                    ticketId={1}
                />,
            )

            const containerDiv = container.querySelector(
                '[class*="hasUIVisionMS1"]',
            )
            expect(containerDiv).toBeInTheDocument()

            const explanationDiv = container.querySelector(
                '[class*="hasUIVisionMS1"]',
            )
            expect(explanationDiv).toBeInTheDocument()
        })

        it('should not apply hasUIVisionMS1 class to container when UIVisionMilestone1 is disabled', () => {
            useHelpdeskV2MS1FlagMock.mockReturnValue(false)

            const onChange = jest.fn()

            const { container } = render(
                <Dimension
                    config={dimensionConfig.communication_skills}
                    dimension={defaultDimension}
                    onChange={onChange}
                    ticketId={1}
                />,
            )

            const containerDiv = container.querySelector(
                '[class*="hasUIVisionMS1"]',
            )
            expect(containerDiv).not.toBeInTheDocument()

            const explanationDiv = container.querySelector(
                '[class*="hasUIVisionMS1"]',
            )
            expect(explanationDiv).not.toBeInTheDocument()
        })
    })
})
