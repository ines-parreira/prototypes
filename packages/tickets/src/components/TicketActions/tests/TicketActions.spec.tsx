import { logEvent, SegmentEvent } from '@repo/logging'
import { act, screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { mockUpdateTicketHandler } from '@gorgias/helpdesk-mocks'

import { render } from '../../../tests/render.utils'
import { TicketActions } from '../TicketActions'

vi.mock('@repo/logging', () => ({
    logEvent: vi.fn(),
    SegmentEvent: {
        PrintTicketClicked: 'Print Ticket Clicked',
    },
}))

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

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
        render(<TicketActions id={123} spam={false} />)

        const button = screen.getByRole('button', {
            name: /dots-kebab-vertical/i,
        })
        expect(button).toBeInTheDocument()
    })

    it('should render all menu items when menu is opened', async () => {
        const { user } = render(<TicketActions id={123} spam={false} />)

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
        const { user } = render(<TicketActions id={123} spam={false} />, {
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
            const { user, unmount } = render(
                <TicketActions id={123} spam={false} />,
                {
                    initialEntries: ['/app/ticket/123'],
                    path: '/app/ticket/:ticketId',
                    dispatchAuditLogEvents,
                },
            )

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

            const { user: user2 } = render(
                <TicketActions id={123} spam={false} />,
                {
                    initialEntries: ['/app/ticket/123?show_all_events=true'],
                    path: '/app/ticket/:ticketId',
                    dispatchHideAuditLogEvents,
                },
            )

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
        it('should toggle between show and hide quick-replies based on search params and call toggleQuickReplies', async () => {
            const { user, unmount } = render(
                <TicketActions id={123} spam={false} />,
                {
                    initialEntries: ['/app/ticket/123'],
                    path: '/app/ticket/:ticketId',
                    toggleQuickReplies,
                },
            )

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

            const { user: user2 } = render(
                <TicketActions id={123} spam={false} />,
                {
                    initialEntries: [
                        '/app/ticket/123?show_all_quick_replies=true',
                    ],
                    path: '/app/ticket/:ticketId',
                    toggleQuickReplies,
                },
            )

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
        const { user } = render(<TicketActions id={123} spam={false} />, {
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

    describe('Mark as spam', () => {
        it('should display "Mark as spam" when ticket is not spam', async () => {
            const { user } = render(<TicketActions id={123} spam={false} />)

            const button = screen.getByRole('button', {
                name: /dots-kebab-vertical/i,
            })
            await act(() => user.click(button))

            expect(screen.getByText('Mark as spam')).toBeInTheDocument()
            expect(screen.queryByText('Unmark as spam')).not.toBeInTheDocument()
        })

        it('should display "Unmark as spam" when ticket is spam', async () => {
            const { user } = render(<TicketActions id={123} spam={true} />)

            const button = screen.getByRole('button', {
                name: /dots-kebab-vertical/i,
            })
            await act(() => user.click(button))

            expect(screen.getByText('Unmark as spam')).toBeInTheDocument()
            expect(screen.queryByText('Mark as spam')).not.toBeInTheDocument()
        })

        it('should mark ticket as spam and show notification with undo button', async () => {
            const mockUpdateTicket = mockUpdateTicketHandler()
            const dispatchNotification = vi.fn()

            server.use(mockUpdateTicket.handler)

            const { user } = render(<TicketActions id={123} spam={false} />, {
                initialEntries: ['/app/views/1/123'],
                path: '/app/views/:viewId/:ticketId',
                dispatchNotification,
                ticketViewNavigation: {
                    shouldDisplay: true,
                    shouldUseLegacyFunctions: false,
                    previousTicketId: 122,
                    nextTicketId: 124,
                    legacyGoToPrevTicket: vi.fn(),
                    isPreviousEnabled: true,
                    legacyGoToNextTicket: vi.fn(),
                    isNextEnabled: true,
                },
            })

            const button = screen.getByRole('button', {
                name: /dots-kebab-vertical/i,
            })
            await act(() => user.click(button))

            const markAsSpamItem = screen.getByText('Mark as spam')
            await act(() => user.click(markAsSpamItem))

            await waitFor(() => {
                expect(dispatchNotification).toHaveBeenCalledWith(
                    expect.objectContaining({
                        id: 'spam-123',
                        message: 'Ticket has been marked as spam',
                        buttons: expect.arrayContaining([
                            expect.objectContaining({
                                name: 'Undo',
                                primary: true,
                            }),
                        ]),
                    }),
                )
            })
        })

        it('should unmark ticket as spam without showing notification', async () => {
            const mockUpdateTicket = mockUpdateTicketHandler()
            const dispatchNotification = vi.fn()

            server.use(mockUpdateTicket.handler)

            const { user } = render(<TicketActions id={123} spam={true} />, {
                initialEntries: ['/app/ticket/123'],
                path: '/app/ticket/:ticketId',
                dispatchNotification,
            })

            const button = screen.getByRole('button', {
                name: /dots-kebab-vertical/i,
            })
            await act(() => user.click(button))

            const unmarkAsSpamItem = screen.getByText('Unmark as spam')
            await act(() => user.click(unmarkAsSpamItem))

            await waitFor(() => {
                expect(dispatchNotification).not.toHaveBeenCalled()
            })
        })

        it('should show error notification when marking as spam fails', async () => {
            const mockUpdateTicket = mockUpdateTicketHandler(async () => {
                return HttpResponse.json(null, { status: 500 })
            })
            const dispatchNotification = vi.fn()

            server.use(mockUpdateTicket.handler)

            const { user } = render(<TicketActions id={123} spam={false} />, {
                initialEntries: ['/app/ticket/123'],
                path: '/app/ticket/:ticketId',
                dispatchNotification,
            })

            const button = screen.getByRole('button', {
                name: /dots-kebab-vertical/i,
            })
            await act(() => user.click(button))

            const markAsSpamItem = screen.getByText('Mark as spam')
            await act(() => user.click(markAsSpamItem))

            await waitFor(() => {
                expect(dispatchNotification).toHaveBeenCalledWith(
                    expect.objectContaining({
                        message: 'Failed to mark as spam',
                    }),
                )
            })
        })
    })
})
