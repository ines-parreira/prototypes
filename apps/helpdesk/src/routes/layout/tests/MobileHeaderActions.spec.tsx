import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { MobileHeaderActions } from '../MobileHeaderActions'

jest.mock('pages/tickets/detail/MobileTicketHeaderActions', () => ({
    MobileTicketHeaderActions: () => <div>Ticket Header Actions</div>,
}))

describe('MobileHeaderActions', () => {
    it('renders ticket header actions on the ticket detail route', () => {
        render(<MobileHeaderActions />, {
            initialEntries: ['/app/ticket/123'],
        })

        expect(screen.getByText('Ticket Header Actions')).toBeInTheDocument()
    })

    it('renders ticket header actions on the views ticket route', () => {
        render(<MobileHeaderActions />, {
            initialEntries: ['/app/views/456/123'],
        })

        expect(screen.getByText('Ticket Header Actions')).toBeInTheDocument()
    })

    it('renders nothing on non-ticket routes', () => {
        render(<MobileHeaderActions />, {
            initialEntries: ['/app/tickets'],
        })

        expect(
            screen.queryByText('Ticket Header Actions'),
        ).not.toBeInTheDocument()
    })
})
