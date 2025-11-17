import { act, screen } from '@testing-library/react'

import { render } from '../../../tests/render.utils'
import { TicketActions } from '../TicketActions'

describe('TicketActions', () => {
    it('should render menu trigger button', () => {
        render(<TicketActions />)

        const button = screen.getByRole('button', {
            name: /dots-kebab-vertical/i,
        })
        expect(button).toBeInTheDocument()
    })

    it('should render all menu items when menu is opened', async () => {
        const { user } = render(<TicketActions />)

        const button = screen.getByRole('button', {
            name: /dots-kebab-vertical/i,
        })
        await act(() => user.click(button))

        expect(screen.getByText('Merge ticket')).toBeInTheDocument()
        expect(screen.getByText('Mark as unread')).toBeInTheDocument()
        expect(screen.getByText('Show all events')).toBeInTheDocument()
        expect(screen.getByText('Hide all events')).toBeInTheDocument()
        expect(screen.getByText('Show all quick-replies')).toBeInTheDocument()
        expect(screen.getByText('Hide all quick-replies')).toBeInTheDocument()
        expect(screen.getByText('Print ticket')).toBeInTheDocument()
        expect(screen.getByText('Mark as spam')).toBeInTheDocument()
        expect(screen.getByText('Delete')).toBeInTheDocument()
    })
})
