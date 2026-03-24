import { logEvent, SegmentEvent } from '@repo/logging'
import { UserRole } from '@repo/utils'
import { act, screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
    mockGetCurrentUserHandler,
    mockGetViewHandler,
    mockGetViewResponse,
    mockListViewItemsHandler,
    mockListViewItemsUpdatesHandler,
    mockMergeTicketsHandler,
    mockSearchTicketsHandler,
    mockTicket,
    mockUpdateTicketHandler,
    mockUser,
} from '@gorgias/helpdesk-mocks'

import { render, testAppQueryClient } from '../../../tests/render.utils'
import { TicketActions } from '../TicketActions'

vi.mock('@repo/logging', () => ({
    logEvent: vi.fn(),
    SegmentEvent: {
        PrintTicketClicked: 'Print Ticket Clicked',
    },
}))

const agentUser = mockUser({
    id: 1,
    email: 'agent@test.com',
    firstname: 'Test',
    lastname: 'Agent',
    role: { name: UserRole.Agent },
})

const mockGetCurrentUser = mockGetCurrentUserHandler(async () => {
    return HttpResponse.json(agentUser)
})
const mockGetView = mockGetViewHandler(async () =>
    HttpResponse.json(mockGetViewResponse({ id: 1 })),
)
const mockListViewItems = mockListViewItemsHandler(async () =>
    HttpResponse.json({
        data: [
            mockTicket({ id: 122 }),
            mockTicket({ id: 123 }),
            mockTicket({ id: 124 }),
        ],
        meta: {
            current_cursor: null,
            next_items: null,
            prev_items: null,
        },
        object: 'list',
        uri: '/api/views/1/items/',
    } as any),
)
const mockListViewItemsUpdates = mockListViewItemsUpdatesHandler(async () =>
    HttpResponse.json({
        data: [],
        meta: {
            current_cursor: undefined,
            next_items: undefined,
            prev_items: undefined,
        },
    }),
)

const mockSearchTickets = mockSearchTicketsHandler()
const mockMergeTickets = mockMergeTicketsHandler()

const server = setupServer(
    mockGetCurrentUser.handler,
    mockGetView.handler,
    mockListViewItems.handler,
    mockListViewItemsUpdates.handler,
    mockSearchTickets.handler,
    mockMergeTickets.handler,
)

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    testAppQueryClient.clear()
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
        server.use(mockGetCurrentUser.handler)
        server.use(mockGetView.handler)
        server.use(mockListViewItems.handler)
        server.use(mockListViewItemsUpdates.handler)
    })

    afterEach(() => {
        vi.restoreAllMocks()
        vi.clearAllMocks()
    })

    const defaultProps = mockTicket({
        id: 123,
        spam: false,
        is_unread: false,
        trashed_datetime: null,
        subject: 'Test Ticket Subject',
    })

    async function openMenu(user: ReturnType<typeof render>['user']) {
        const button = screen.getByRole('button', {
            name: /dots-meatballs-horizontal/i,
        })
        await act(() => user.click(button))
        return button
    }

    it('should render menu trigger button', () => {
        render(<TicketActions {...defaultProps} />)

        const button = screen.getByRole('button', {
            name: /dots-meatballs-horizontal/i,
        })
        expect(button).toBeInTheDocument()
    })

    it('should render all menu items when menu is opened', async () => {
        const { user } = render(<TicketActions {...defaultProps} />)

        await openMenu(user)

        expect(screen.getByText('Merge ticket')).toBeInTheDocument()
        expect(screen.getByText('Mark as unread')).toBeInTheDocument()
        expect(screen.getByText('Show all events')).toBeInTheDocument()
        expect(screen.getByText('Show all quick replies')).toBeInTheDocument()
        expect(screen.getByText('Print ticket')).toBeInTheDocument()
        expect(screen.getByText('Mark as spam')).toBeInTheDocument()
        expect(screen.getByText('Move to trash')).toBeInTheDocument()
    })

    it('should open print window and log analytics when print ticket is clicked', async () => {
        const { user } = render(<TicketActions {...defaultProps} />, {
            initialEntries: ['/app/ticket/123'],
            path: '/app/ticket/:ticketId',
        })

        await openMenu(user)

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
        it('should show "Show all events" and dispatch function when clicked', async () => {
            const { user } = render(<TicketActions {...defaultProps} />, {
                initialEntries: ['/app/ticket/123'],
                path: '/app/ticket/:ticketId',
                dispatchAuditLogEvents,
            })

            await openMenu(user)

            expect(screen.getByText('Show all events')).toBeInTheDocument()
            expect(
                screen.queryByText('Hide all events'),
            ).not.toBeInTheDocument()

            const showEventsMenuItem = screen.getByText('Show all events')
            await act(() => user.click(showEventsMenuItem))

            await waitFor(() => {
                expect(dispatchAuditLogEvents).toHaveBeenCalledTimes(1)
            })
        })

        it('should show "Hide all events" and dispatch function when clicked', async () => {
            const { user } = render(<TicketActions {...defaultProps} />, {
                initialEntries: ['/app/ticket/123?show_ticket_events=true'],
                path: '/app/ticket/:ticketId',
                dispatchHideAuditLogEvents,
            })

            await openMenu(user)

            expect(screen.getByText('Hide all events')).toBeInTheDocument()
            expect(
                screen.queryByText('Show all events'),
            ).not.toBeInTheDocument()

            const hideEventsMenuItem = screen.getByText('Hide all events')
            await act(() => user.click(hideEventsMenuItem))

            await waitFor(() => {
                expect(dispatchHideAuditLogEvents).toHaveBeenCalledTimes(1)
            })
        })
    })

    describe('Quick replies visibility toggle', () => {
        it('should show "Show all quick-replies" and call toggle function with true', async () => {
            const { user } = render(<TicketActions {...defaultProps} />, {
                initialEntries: ['/app/ticket/123'],
                path: '/app/ticket/:ticketId',
                toggleQuickReplies,
            })

            await openMenu(user)

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
        })

        it('should show "Hide all quick-replies" and call toggle function with false', async () => {
            const { user } = render(<TicketActions {...defaultProps} />, {
                initialEntries: [
                    '/app/ticket/123?show_ticket_quick_replies=true',
                ],
                path: '/app/ticket/:ticketId',
                toggleQuickReplies,
            })

            await openMenu(user)

            expect(
                screen.getByText('Hide all quick replies'),
            ).toBeInTheDocument()
            expect(
                screen.queryByText('Show all quick replies'),
            ).not.toBeInTheDocument()

            const hideQuickRepliesMenuItem = screen.getByText(
                'Hide all quick replies',
            )
            await act(() => user.click(hideQuickRepliesMenuItem))

            await waitFor(() => {
                expect(toggleQuickReplies).toHaveBeenCalledWith(false)
            })
        })
    })

    it('should handle both events and quick replies being visible simultaneously', async () => {
        const { user } = render(<TicketActions {...defaultProps} />, {
            initialEntries: [
                '/app/ticket/123?show_ticket_events=true&show_ticket_quick_replies=true',
            ],
            path: '/app/ticket/:ticketId',
        })

        await openMenu(user)

        expect(screen.getByText('Hide all events')).toBeInTheDocument()
        expect(screen.getByText('Hide all quick replies')).toBeInTheDocument()
    })

    describe('Mark as spam', () => {
        it('should display "Mark as spam" when ticket is not spam', async () => {
            const { user } = render(<TicketActions {...defaultProps} />)

            await openMenu(user)

            expect(screen.getByText('Mark as spam')).toBeInTheDocument()
            expect(screen.queryByText('Unmark as spam')).not.toBeInTheDocument()
        })

        it('should display "Unmark as spam" when ticket is spam', async () => {
            const { user } = render(
                <TicketActions {...defaultProps} spam={true} />,
            )

            await openMenu(user)

            expect(screen.getByText('Unmark as spam')).toBeInTheDocument()
            expect(screen.queryByText('Mark as spam')).not.toBeInTheDocument()
        })

        it('should mark ticket as spam and show notification with undo button', async () => {
            const mockUpdateTicket = mockUpdateTicketHandler()
            const dispatchNotification = vi.fn()

            server.use(mockUpdateTicket.handler)

            const { user } = render(<TicketActions {...defaultProps} />, {
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

            await openMenu(user)

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

            const { user } = render(
                <TicketActions {...defaultProps} spam={true} />,
                {
                    initialEntries: ['/app/ticket/123'],
                    path: '/app/ticket/:ticketId',
                    dispatchNotification,
                },
            )

            await openMenu(user)

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

            const { user } = render(<TicketActions {...defaultProps} />, {
                initialEntries: ['/app/ticket/123'],
                path: '/app/ticket/:ticketId',
                dispatchNotification,
            })

            await openMenu(user)

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

    describe('Mark as unread', () => {
        it('should display "Mark as unread" when ticket is read', async () => {
            const { user } = render(<TicketActions {...defaultProps} />)

            await openMenu(user)

            expect(screen.getByText('Mark as unread')).toBeInTheDocument()
        })

        it('should not display "Mark as unread" when ticket is already unread', async () => {
            const { user } = render(
                <TicketActions
                    {...mockTicket({ ...defaultProps, is_unread: true })}
                />,
            )

            await openMenu(user)

            expect(screen.queryByText('Mark as unread')).not.toBeInTheDocument()
        })

        it('should mark ticket as unread and show success notification', async () => {
            const mockUpdateTicket = mockUpdateTicketHandler()
            const dispatchNotification = vi.fn()
            const onToggleUnread = vi.fn()

            server.use(mockUpdateTicket.handler)

            const { user } = render(<TicketActions {...defaultProps} />, {
                initialEntries: ['/app/ticket/123'],
                path: '/app/ticket/:ticketId',
                dispatchNotification,
                onToggleUnread,
            })

            await openMenu(user)

            const markAsUnreadItem = screen.getByText('Mark as unread')
            await act(() => user.click(markAsUnreadItem))

            await waitFor(() => {
                expect(dispatchNotification).toHaveBeenCalledWith(
                    expect.objectContaining({
                        status: 'success',
                        message: 'Ticket has been marked as unread',
                    }),
                )
                expect(onToggleUnread).toHaveBeenCalledWith(123, true)
            })
        })

        it('should show error notification when marking as unread fails', async () => {
            const mockUpdateTicket = mockUpdateTicketHandler(async () => {
                return HttpResponse.json(null, { status: 500 })
            })
            const dispatchNotification = vi.fn()

            server.use(mockUpdateTicket.handler)

            const { user } = render(<TicketActions {...defaultProps} />, {
                initialEntries: ['/app/ticket/123'],
                path: '/app/ticket/:ticketId',
                dispatchNotification,
            })

            await openMenu(user)

            const markAsUnreadItem = screen.getByText('Mark as unread')
            await act(() => user.click(markAsUnreadItem))

            await waitFor(() => {
                expect(dispatchNotification).toHaveBeenCalledWith(
                    expect.objectContaining({
                        status: 'error',
                        message: 'Failed to mark as unread',
                    }),
                )
            })
        })
    })

    describe('Trash ticket', () => {
        it('should move ticket to trash and show notification with undo button when confirmed', async () => {
            const mockUpdateTicket = mockUpdateTicketHandler()
            const dispatchNotification = vi.fn()

            server.use(mockUpdateTicket.handler)

            const { user } = render(<TicketActions {...defaultProps} />, {
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

            await openMenu(user)

            const moveToTrashMenuItem = screen.getByText('Move to trash')
            await act(() => user.click(moveToTrashMenuItem))

            const deleteButton = screen.getByRole('button', {
                name: 'Delete ticket',
            })
            await act(() => user.click(deleteButton))

            await waitFor(() => {
                expect(dispatchNotification).toHaveBeenCalledWith(
                    expect.objectContaining({
                        id: 'trash-123',
                        message: 'Ticket has been moved to trash',
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

        it('should close modal when delete is confirmed', async () => {
            const mockUpdateTicket = mockUpdateTicketHandler()

            server.use(mockUpdateTicket.handler)

            const { user } = render(<TicketActions {...defaultProps} />, {
                initialEntries: ['/app/ticket/123'],
                path: '/app/ticket/:ticketId',
            })

            await openMenu(user)

            const moveToTrashMenuItem = screen.getByText('Move to trash')
            await act(() => user.click(moveToTrashMenuItem))

            expect(screen.getByText('Are you sure?')).toBeInTheDocument()

            const deleteButton = screen.getByRole('button', {
                name: 'Delete ticket',
            })
            await act(() => user.click(deleteButton))

            await waitFor(() => {
                expect(
                    screen.queryByText('Are you sure?'),
                ).not.toBeInTheDocument()
            })
        })

        it('should restore ticket without showing notification when restore is clicked', async () => {
            const mockUpdateTicket = mockUpdateTicketHandler()
            const dispatchNotification = vi.fn()

            server.use(mockUpdateTicket.handler)

            const { user } = render(
                <TicketActions
                    {...mockTicket({
                        ...defaultProps,
                        trashed_datetime: '2024-01-01T00:00:00Z',
                    })}
                />,
                {
                    initialEntries: ['/app/ticket/123'],
                    path: '/app/ticket/:ticketId',
                    dispatchNotification,
                },
            )

            await openMenu(user)

            const restoreMenuItem = screen.getByText('Restore ticket')
            await act(() => user.click(restoreMenuItem))

            await waitFor(() => {
                expect(dispatchNotification).not.toHaveBeenCalled()
            })
        })

        it('should show error notification when move to trash fails', async () => {
            const mockUpdateTicket = mockUpdateTicketHandler(async () => {
                return HttpResponse.json(null, { status: 500 })
            })
            const dispatchNotification = vi.fn()

            server.use(mockUpdateTicket.handler)

            const { user } = render(<TicketActions {...defaultProps} />, {
                initialEntries: ['/app/ticket/123'],
                path: '/app/ticket/:ticketId',
                dispatchNotification,
            })

            await openMenu(user)

            const moveToTrashMenuItem = screen.getByText('Move to trash')
            await act(() => user.click(moveToTrashMenuItem))

            const deleteButton = screen.getByRole('button', {
                name: 'Delete ticket',
            })
            await act(() => user.click(deleteButton))

            await waitFor(() => {
                expect(dispatchNotification).toHaveBeenCalledWith(
                    expect.objectContaining({
                        status: 'error',
                        message: 'Failed to move to trash',
                    }),
                )
            })
        })

        it('should not open modal when restore is clicked on trashed ticket', async () => {
            const mockUpdateTicket = mockUpdateTicketHandler()

            server.use(mockUpdateTicket.handler)

            const { user } = render(
                <TicketActions
                    {...mockTicket({
                        ...defaultProps,
                        trashed_datetime: '2024-01-01T00:00:00Z',
                    })}
                />,
                {
                    initialEntries: ['/app/ticket/123'],
                    path: '/app/ticket/:ticketId',
                },
            )

            await openMenu(user)

            const restoreMenuItem = screen.getByText('Restore ticket')
            await act(() => user.click(restoreMenuItem))

            expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument()
        })
    })
})
