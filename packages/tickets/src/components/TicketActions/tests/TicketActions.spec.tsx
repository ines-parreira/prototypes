import { logEvent, SegmentEvent } from '@repo/logging'
import { act, screen, waitFor } from '@testing-library/react'
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
    const dispatchAuditLogEvents = vi.fn()
    const dispatchHideAuditLogEvents = vi.fn()
    const toggleQuickReplies = vi.fn()

    beforeEach(() => {
        vi.spyOn(window, 'open').mockImplementation(() => null)
    })

    afterEach(() => {
        vi.restoreAllMocks()
        vi.clearAllMocks()
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
        expect(screen.getByText('Show all quick replies')).toBeInTheDocument()
        expect(screen.getByText('Print ticket')).toBeInTheDocument()
        expect(screen.getByText('Mark as spam')).toBeInTheDocument()
        expect(screen.getByText('Delete')).toBeInTheDocument()
    })

    it('should open print window and log analytics when print ticket is clicked', async () => {
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
            expect(logEvent).toHaveBeenCalledWith(
                SegmentEvent.PrintTicketClicked,
            )
        })
    })

    describe('Events visibility toggle', () => {
        it('should toggle between show and hide events based on search params and dispatch legacy bridge functions', async () => {
            const { user, unmount } = render(<TicketActions />, {
                initialEntries: ['/app/ticket/123'],
                path: '/app/ticket/:ticketId',
                dispatchAuditLogEvents,
            })

            let button = screen.getByRole('button', {
                name: /dots-kebab-vertical/i,
            })
            await act(() => user.click(button))

            expect(screen.getByText('Show all events')).toBeInTheDocument()
            expect(
                screen.queryByText('Hide all events'),
            ).not.toBeInTheDocument()

            const showEventsMenuItem = screen.getByText('Show all events')
            await act(() => user.click(showEventsMenuItem))

            await waitFor(() => {
                expect(dispatchAuditLogEvents).toHaveBeenCalledTimes(1)
            })

            unmount()

            const { user: user2 } = render(<TicketActions />, {
                initialEntries: ['/app/ticket/123?show_all_events=true'],
                path: '/app/ticket/:ticketId',
                dispatchHideAuditLogEvents,
            })

            button = screen.getByRole('button', {
                name: /dots-kebab-vertical/i,
            })
            await act(() => user2.click(button))

            expect(screen.getByText('Hide all events')).toBeInTheDocument()
            expect(
                screen.queryByText('Show all events'),
            ).not.toBeInTheDocument()

            const hideEventsMenuItem = screen.getByText('Hide all events')
            await act(() => user2.click(hideEventsMenuItem))

            await waitFor(() => {
                expect(dispatchHideAuditLogEvents).toHaveBeenCalledTimes(1)
            })
        })
    })

    describe('Quick replies visibility toggle', () => {
        it('should toggle between show and hide quick replies based on search params and call toggleQuickReplies', async () => {
            const { user, unmount } = render(<TicketActions />, {
                initialEntries: ['/app/ticket/123'],
                path: '/app/ticket/:ticketId',
                toggleQuickReplies,
            })

            let button = screen.getByRole('button', {
                name: /dots-kebab-vertical/i,
            })
            await act(() => user.click(button))

            expect(
                screen.getByText('Show all quick replies'),
            ).toBeInTheDocument()
            expect(
                screen.queryByText('Hide all quick replies'),
            ).not.toBeInTheDocument()

            const showQuickRepliesMenuItem = screen.getByText(
                'Show all quick replies',
            )
            await act(() => user.click(showQuickRepliesMenuItem))

            await waitFor(() => {
                expect(toggleQuickReplies).toHaveBeenCalledWith(true)
            })

            unmount()

            const { user: user2 } = render(<TicketActions />, {
                initialEntries: ['/app/ticket/123?show_all_quick_replies=true'],
                path: '/app/ticket/:ticketId',
                toggleQuickReplies,
            })

            button = screen.getByRole('button', {
                name: /dots-kebab-vertical/i,
            })
            await act(() => user2.click(button))

            expect(
                screen.getByText('Hide all quick replies'),
            ).toBeInTheDocument()
            expect(
                screen.queryByText('Show all quick replies'),
            ).not.toBeInTheDocument()

            const hideQuickRepliesMenuItem = screen.getByText(
                'Hide all quick replies',
            )
            await act(() => user2.click(hideQuickRepliesMenuItem))

            await waitFor(() => {
                expect(toggleQuickReplies).toHaveBeenCalledWith(false)
            })
        })
    })

    it('should handle both events and quick replies being visible simultaneously', async () => {
        const { user } = render(<TicketActions />, {
            initialEntries: [
                '/app/ticket/123?show_all_events=true&show_all_quick_replies=true',
            ],
            path: '/app/ticket/:ticketId',
        })

        const button = screen.getByRole('button', {
            name: /dots-kebab-vertical/i,
        })
        await act(() => user.click(button))

        expect(screen.getByText('Hide all events')).toBeInTheDocument()
        expect(screen.getByText('Hide all quick replies')).toBeInTheDocument()
    })
})
