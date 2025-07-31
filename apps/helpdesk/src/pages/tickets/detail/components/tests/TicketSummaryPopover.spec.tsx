import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

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

    const Button = React.forwardRef(
        ({ onClick, displayLabel, leadingIcon, ...props }: any, ref: any) => (
            <button onClick={onClick} ref={ref} {...props}>
                {displayLabel ? 'Summarize' : ''}
                {leadingIcon && (
                    <span data-testid="leading-icon">{leadingIcon}</span>
                )}
            </button>
        ),
    )

    const Section = ({ ticketId, __summary, isPopup }: any) => (
        <div data-testid="ticket-summary-section">
            Summary Section - Ticket: {ticketId} - Popup:{' '}
            {isPopup ? 'yes' : 'no'}
        </div>
    )

    return {
        __esModule: true,
        default: Section,
        TicketSummaryButton: Button,
    }
})

jest.mock('components/Popover', () => {
    const Popover = ({ children, isOpen }: any) => {
        if (!isOpen) return null
        return <div data-testid="popover">{children}</div>
    }

    return { Popover }
})

jest.mock('@gorgias/merchant-ui-kit', () => ({
    Tooltip: ({ children }: any) => <div data-testid="tooltip">{children}</div>,
}))

describe('TicketSummaryPopover', () => {
    const user = userEvent.setup()

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

    it('renders the summarize button with label by default', () => {
        render(<TicketSummaryPopover />)
        expect(
            screen.getByRole('button', { name: /summarize/i }),
        ).toBeInTheDocument()
    })

    it('renders the summarize button without label when displayLabel is false', () => {
        render(<TicketSummaryPopover displayLabel={false} />)
        const button = screen.getByRole('button')
        expect(button).toBeInTheDocument()
        expect(button).toHaveTextContent('')
    })

    it('toggles popover visibility on button click', async () => {
        render(<TicketSummaryPopover />)

        const button = screen.getByRole('button', { name: /summarize/i })
        await user.click(button)

        expect(screen.getByTestId('ticket-summary-section')).toBeInTheDocument()

        await user.click(button)

        expect(
            screen.queryByTestId('ticket-summary-section'),
        ).not.toBeInTheDocument()
    })

    it('should log event when opens', async () => {
        render(<TicketSummaryPopover />)

        const button = screen.getByRole('button', { name: /summarize/i })
        await user.click(button)

        expect(screen.getByTestId('ticket-summary-section')).toBeInTheDocument()

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.AiTicketSummaryPopoverOpened,
            {
                ticketId: 'TICKET-123',
                page: 'ticket',
            },
        )
    })

    it('should render tooltip when hasTooltip is true', () => {
        render(<TicketSummaryPopover hasTooltip={true} />)
        expect(screen.getByTestId('tooltip')).toBeInTheDocument()
    })

    it('should not render tooltip when hasTooltip is false', () => {
        render(<TicketSummaryPopover hasTooltip={false} />)
        expect(screen.queryByTestId('tooltip')).not.toBeInTheDocument()
    })

    it('should not render tooltip by default', () => {
        render(<TicketSummaryPopover />)
        expect(screen.queryByTestId('tooltip')).not.toBeInTheDocument()
    })

    it('should show close icon when popover is open', async () => {
        render(<TicketSummaryPopover />)

        const button = screen.getByRole('button', { name: /summarize/i })
        await user.click(button)

        expect(screen.getByTestId('leading-icon')).toBeInTheDocument()
    })

    it('should pass correct props to TicketSummarySection', async () => {
        render(<TicketSummaryPopover />)

        const button = screen.getByRole('button', { name: /summarize/i })
        await user.click(button)

        const summarySection = screen.getByTestId('ticket-summary-section')
        expect(summarySection).toHaveTextContent('Ticket: TICKET-123')
        expect(summarySection).toHaveTextContent('Popup: yes')
    })
})
