import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TicketModal } from '../TicketModal'

jest.mock('tickets/ticket-detail', () => ({
    TicketDetail: () => <div>TicketDetail</div>,
}))

describe('TicketModal', () => {
    it('should render the ticket detail in the modal', () => {
        render(<TicketModal ticketId={1} onClose={jest.fn()} />)
        expect(screen.getByText('TicketDetail')).toBeInTheDocument()
    })

    it('should render a link to the full ticket', () => {
        render(<TicketModal ticketId={1} onClose={jest.fn()} />)
        const el = screen.getByText('View Ticket')
        expect(el).toBeInTheDocument()
        expect(el.closest('a')).toHaveAttribute('href', '/app/ticket/1')
    })

    it('should disable the navigation if no onNext / onPrevious handlers are passed', () => {
        render(<TicketModal ticketId={1} onClose={jest.fn()} />)
        const previousEl = screen.getByText('Previous')
        const nextEl = screen.getByText('Next')

        expect(previousEl).toBeInTheDocument()
        expect(previousEl.closest('button')).toBeAriaDisabled()
        expect(nextEl).toBeInTheDocument()
        expect(nextEl.closest('button')).toBeAriaDisabled()
    })

    it('should call onNext when the next link is clicked', () => {
        const onNext = jest.fn()
        render(<TicketModal ticketId={1} onClose={jest.fn()} onNext={onNext} />)

        const el = screen.getByText('Next')
        userEvent.click(el)

        expect(onNext).toHaveBeenCalled()
    })

    it('should call onPrevious when the previous link is clicked', () => {
        const onPrevious = jest.fn()
        render(
            <TicketModal
                ticketId={1}
                onClose={jest.fn()}
                onPrevious={onPrevious}
            />,
        )

        const el = screen.getByText('Previous')
        userEvent.click(el)

        expect(onPrevious).toHaveBeenCalled()
    })
})
