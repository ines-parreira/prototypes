import { logEvent, SegmentEvent } from '@repo/logging'
import { act, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { render } from '../../../tests/render.utils'
import { TicketActions } from '../TicketActions'

vi.mock('@repo/logging', () => ({
    logEvent: vi.fn(),
    SegmentEvent: {
        PrintTicketClicked: 'Print Ticket Clicked',
    },
}))

describe('TicketActions', () => {
    beforeEach(() => {
        vi.spyOn(window, 'open').mockImplementation(() => null)
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

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

    it('should open print window when print ticket is clicked', async () => {
        const { user } = render(<TicketActions />, {
            initialEntries: ['/app/ticket/123'],
            path: '/app/ticket/:ticketId',
        })

        const button = screen.getByRole('button', {
            name: /dots-kebab-vertical/i,
        })
        await act(() => user.click(button))

        const printMenuItem = screen.getByText('Print ticket')
        await act(() => user.click(printMenuItem))

        await vi.waitFor(() => {
            expect(window.open).toHaveBeenCalledWith('/app/ticket/123/print')
        })
    })

    it('should log analytics event when print ticket is clicked', async () => {
        const { user } = render(<TicketActions />, {
            initialEntries: ['/app/ticket/123'],
            path: '/app/ticket/:ticketId',
        })

        const button = screen.getByRole('button', {
            name: /dots-kebab-vertical/i,
        })
        await act(() => user.click(button))

        const printMenuItem = screen.getByText('Print ticket')
        await act(() => user.click(printMenuItem))

        expect(logEvent).toHaveBeenCalledWith(SegmentEvent.PrintTicketClicked)
    })
})
