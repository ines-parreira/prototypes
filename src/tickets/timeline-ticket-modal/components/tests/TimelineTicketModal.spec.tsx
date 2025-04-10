import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TimelineTicketModal } from '../TimelineTicketModal'

describe('TimelineTicketModal', () => {
    it('should render the modal', () => {
        render(<TimelineTicketModal ticketId={1} onClose={jest.fn()} />)
        expect(screen.getByText('render ticket 1')).toBeInTheDocument()
    })

    it('should render a link to the full ticket', () => {
        render(<TimelineTicketModal ticketId={1} onClose={jest.fn()} />)
        const el = screen.getByText('View Ticket')
        expect(el).toBeInTheDocument()
        expect(el.closest('a')).toHaveAttribute('href', '/app/ticket/1')
    })

    it('should disable the navigation if no onNext / onPrevious handlers are passed', () => {
        render(<TimelineTicketModal ticketId={1} onClose={jest.fn()} />)
        const previousEl = screen.getByText('Previous')
        const nextEl = screen.getByText('Next')

        expect(previousEl).toBeInTheDocument()
        expect(previousEl.closest('button')).toBeAriaDisabled()
        expect(nextEl).toBeInTheDocument()
        expect(nextEl.closest('button')).toBeAriaDisabled()
    })

    it('should call onNext when the next link is clicked', () => {
        const onNext = jest.fn()
        render(
            <TimelineTicketModal
                ticketId={1}
                onClose={jest.fn()}
                onNext={onNext}
            />,
        )

        const el = screen.getByText('Next')
        userEvent.click(el)

        expect(onNext).toHaveBeenCalled()
    })

    it('should call onPrevious when the previous link is clicked', () => {
        const onPrevious = jest.fn()
        render(
            <TimelineTicketModal
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
