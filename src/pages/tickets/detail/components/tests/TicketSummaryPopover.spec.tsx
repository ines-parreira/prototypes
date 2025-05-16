import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import { logEvent, SegmentEvent } from 'common/segment'

import '@testing-library/jest-dom'

import useAppSelector from 'hooks/useAppSelector'

import TicketSummaryPopover from '../TicketSummaryPopover'

jest.mock('hooks/useAppSelector')
const useAppSelectorMock = useAppSelector as jest.Mock

jest.mock('common/segment')
const logEventMock = logEvent as jest.Mock

jest.mock('pages/tickets/detail/components/TicketSummary', () => {
    const React = require('react')

    const Button = React.forwardRef(({ onClick, children }: any, ref: any) => (
        <button onClick={onClick} ref={ref}>
            {children}
        </button>
    ))

    const Section = () => (
        <div data-testid="ticket-summary-section">Summary Section</div>
    )

    return {
        __esModule: true,
        default: Section,
        TicketSummaryButton: Button,
    }
})

describe('TicketSummaryPopover', () => {
    beforeEach(() => {
        useAppSelectorMock.mockReturnValue({
            get: (key: string) => {
                const data: any = {
                    id: 'TICKET-123',
                    summary: {
                        toJS: () => ({
                            title: 'Test Summary',
                            content: 'Summary content',
                        }),
                    },
                }
                return data[key]
            },
        })
    })

    it('renders the summarize button', () => {
        render(<TicketSummaryPopover />)
        expect(
            screen.getByRole('button', { name: /summarize/i }),
        ).toBeInTheDocument()
    })

    it('toggles popover visibility on button click', () => {
        render(<TicketSummaryPopover />)

        const button = screen.getByRole('button', { name: /summarize/i })
        fireEvent.click(button)

        expect(screen.getByTestId('ticket-summary-section')).toBeInTheDocument()

        fireEvent.click(button)

        expect(
            screen.queryByTestId('ticket-summary-section'),
        ).not.toBeInTheDocument()
    })

    it('should log event when opens', () => {
        render(<TicketSummaryPopover />)

        const button = screen.getByRole('button', { name: /summarize/i })
        fireEvent.click(button)

        expect(screen.getByTestId('ticket-summary-section')).toBeInTheDocument()

        fireEvent.click(button)
        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.AiTicketSummaryPopoverOpened,
            {
                ticketId: 'TICKET-123',
                page: 'ticket',
            },
        )
    })
})
