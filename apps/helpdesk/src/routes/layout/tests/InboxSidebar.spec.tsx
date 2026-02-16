import { render, screen } from '@testing-library/react'

import { InboxSidebar } from '../sidebars/InboxSidebar'

jest.mock('pages/tickets/navbar/TicketNavbar', () => ({
    __esModule: true,
    default: () => <div>TicketNavbar</div>,
}))

describe('InboxSidebar', () => {
    it('should render TicketNavbar component', () => {
        render(<InboxSidebar />)
        const navbar = screen.getByText('TicketNavbar')
        expect(navbar).toBeInTheDocument()
    })
})
