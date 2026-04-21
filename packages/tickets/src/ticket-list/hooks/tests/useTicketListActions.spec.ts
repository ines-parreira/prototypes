import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { toast } from '@gorgias/axiom'
import {
    mockCreateJobHandler,
    mockListViewItemsHandler,
    mockTag,
    mockTeam,
    mockTicket,
    mockUser,
} from '@gorgias/helpdesk-mocks'
import type { Ticket } from '@gorgias/helpdesk-queries'
import { JobType } from '@gorgias/helpdesk-types'

import { renderHook } from '../../../tests/render.utils'
import { useTicketListActions } from '../useTicketListActions'
import { useTicketsList } from '../useTicketsList'

const mockCreateJob = mockCreateJobHandler()

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    viewTicketsState.current = []
    server.use(mockCreateJob.handler, mockListViewItems.handler)
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

const VIEW_ID = 10
const TICKET_IDS = [1, 2]
const SUPPORT_TEAM = mockTeam({ id: 8, name: 'Support' })
const SUPPORT_USER = mockUser({ id: 7, name: 'Jane Doe' })
const VIP_TAG = mockTag({ id: 55, name: 'VIP', decoration: null })
const viewTicketsState: { current: Ticket[] } = {
    current: [],
}

const mockListViewItems = mockListViewItemsHandler(async () =>
    HttpResponse.json({
        data: viewTicketsState.current,
        meta: {
            current_cursor: null,
            next_items: null,
            prev_items: null,
        },
        object: 'list',
        uri: `/api/views/${VIEW_ID}/items/`,
    } as any),
)

function setup(
    overrides: {
        ticketIds?: number[]
        visibleTicketIds?: number[]
        hasSelectedAll?: boolean
        onActionComplete?: () => void
        onApplyMacro?: (ticketIds: number[]) => void
    } = {},
) {
    const onActionComplete = overrides.onActionComplete ?? vi.fn()
    const hook = renderHook(() => {
        const list = useTicketsList(VIEW_ID, {
            enableStaleUpdates: false,
        })
        const actions = useTicketListActions({
            viewId: VIEW_ID,
            selectedTicketIds: new Set(overrides.ticketIds ?? TICKET_IDS),
            visibleTicketIds: overrides.visibleTicketIds ?? TICKET_IDS,
            hasSelectedAll: overrides.hasSelectedAll ?? false,
            onActionComplete,
            onApplyMacro: overrides.onApplyMacro,
        })

        return {
            ...actions,
            list,
        }
    })

    return { onActionComplete, ...hook }
}

async function waitForListToLoad(
    result: ReturnType<typeof setup>['result'],
    expectedTicketIds: number[],
) {
    await waitFor(() => {
        expect(result.current.list.isLoading).toBe(false)
        expect(result.current.list.tickets.map((ticket) => ticket.id)).toEqual(
            expectedTicketIds,
        )
    })
}

describe('useTicketListActions', () => {
    describe('handleMarkAsUnread', () => {
        it('creates an UpdateTicket job with is_unread: true', async () => {
            const { result } = setup()
            const waitForRequest = mockCreateJob.waitForRequest(server)

            await result.current.handleMarkAsUnread()

            await waitForRequest(async (request) => {
                const body = await request.json()
                expect(body).toMatchObject({
                    type: JobType.UpdateTicket,
                    params: {
                        ticket_ids: TICKET_IDS,
                        updates: { is_unread: true },
                    },
                })
            })
        })

        it('optimistically updates unread state in the ticket list cache', async () => {
            viewTicketsState.current = [
                mockTicket({ id: 1, is_unread: false }),
                mockTicket({ id: 2, is_unread: false }),
                mockTicket({ id: 3, is_unread: false }),
            ]

            const { result } = setup()

            await waitForListToLoad(result, [1, 2, 3])

            await result.current.handleMarkAsUnread()

            await waitFor(() => {
                expect(
                    result.current.list.tickets.map(
                        (ticket) => ticket.is_unread,
                    ),
                ).toEqual([true, true, false])
            })
        })

        it('calls onActionComplete after the job completes', async () => {
            const onActionComplete = vi.fn()
            const { result } = setup({ onActionComplete })

            await result.current.handleMarkAsUnread()

            expect(onActionComplete).toHaveBeenCalledTimes(1)
        })
    })

    describe('handleMarkAsRead', () => {
        it('creates an UpdateTicket job with is_unread: false', async () => {
            const { result } = setup()
            const waitForRequest = mockCreateJob.waitForRequest(server)

            await result.current.handleMarkAsRead()

            await waitForRequest(async (request) => {
                const body = await request.json()
                expect(body).toMatchObject({
                    type: JobType.UpdateTicket,
                    params: {
                        ticket_ids: TICKET_IDS,
                        updates: { is_unread: false },
                    },
                })
            })
        })

        it('optimistically clears unread state in the ticket list cache', async () => {
            viewTicketsState.current = [
                mockTicket({ id: 1, is_unread: true }),
                mockTicket({ id: 2, is_unread: true }),
                mockTicket({ id: 3, is_unread: true }),
            ]

            const { result } = setup()

            await waitForListToLoad(result, [1, 2, 3])

            await result.current.handleMarkAsRead()

            await waitFor(() => {
                expect(
                    result.current.list.tickets.map(
                        (ticket) => ticket.is_unread,
                    ),
                ).toEqual([false, false, true])
            })
        })

        it('calls onActionComplete after the job completes', async () => {
            const onActionComplete = vi.fn()
            const { result } = setup({ onActionComplete })

            await result.current.handleMarkAsRead()

            expect(onActionComplete).toHaveBeenCalledTimes(1)
        })
    })

    describe('handleChangePriority', () => {
        it('creates an UpdateTicket job with the specified priority', async () => {
            const { result } = setup()
            const waitForRequest = mockCreateJob.waitForRequest(server)

            await result.current.handleChangePriority('high')

            await waitForRequest(async (request) => {
                const body = await request.json()
                expect(body).toMatchObject({
                    type: JobType.UpdateTicket,
                    params: {
                        ticket_ids: TICKET_IDS,
                        updates: { priority: 'high' },
                    },
                })
            })
        })

        it('calls onActionComplete after the job completes', async () => {
            const onActionComplete = vi.fn()
            const { result } = setup({ onActionComplete })

            await result.current.handleChangePriority('critical')

            expect(onActionComplete).toHaveBeenCalledTimes(1)
        })
    })

    describe('handleCloseTickets', () => {
        it('creates an UpdateTicket job with status: closed', async () => {
            const { result } = setup()
            const waitForRequest = mockCreateJob.waitForRequest(server)

            await result.current.handleCloseTickets()

            await waitForRequest(async (request) => {
                const body = await request.json()
                expect(body).toMatchObject({
                    type: JobType.UpdateTicket,
                    params: {
                        ticket_ids: TICKET_IDS,
                        updates: { status: 'closed' },
                    },
                })
            })
        })

        it('calls onActionComplete after the job completes', async () => {
            const onActionComplete = vi.fn()
            const { result } = setup({ onActionComplete })

            await result.current.handleCloseTickets()

            expect(onActionComplete).toHaveBeenCalledTimes(1)
        })
    })

    describe('handleAssignTeam', () => {
        it('creates an UpdateTicket job with assignee_team_id', async () => {
            const { result } = setup()
            const waitForRequest = mockCreateJob.waitForRequest(server)

            await result.current.handleAssignTeam(SUPPORT_TEAM)

            await waitForRequest(async (request) => {
                const body = await request.json()
                expect(body).toMatchObject({
                    type: JobType.UpdateTicket,
                    params: {
                        ticket_ids: TICKET_IDS,
                        updates: { assignee_team_id: SUPPORT_TEAM.id },
                    },
                })
            })
        })

        it('creates an UpdateTicket job with assignee_team_id: null when clearing team', async () => {
            const { result } = setup()
            const waitForRequest = mockCreateJob.waitForRequest(server)

            await result.current.handleAssignTeam(null)

            await waitForRequest(async (request) => {
                const body = await request.json()
                expect(body).toMatchObject({
                    type: JobType.UpdateTicket,
                    params: {
                        ticket_ids: TICKET_IDS,
                        updates: { assignee_team_id: null },
                    },
                })
            })
        })

        it('calls onActionComplete after the job completes', async () => {
            const onActionComplete = vi.fn()
            const { result } = setup({ onActionComplete })

            await result.current.handleAssignTeam(SUPPORT_TEAM)

            expect(onActionComplete).toHaveBeenCalledTimes(1)
        })
    })

    describe('handleAssignUser', () => {
        it('creates an UpdateTicket job with assignee_user', async () => {
            const { result } = setup()
            const waitForRequest = mockCreateJob.waitForRequest(server)

            await result.current.handleAssignUser(SUPPORT_USER)

            await waitForRequest(async (request) => {
                const body = await request.json()
                expect(body).toMatchObject({
                    type: JobType.UpdateTicket,
                    params: {
                        ticket_ids: TICKET_IDS,
                        updates: {
                            assignee_user: {
                                id: SUPPORT_USER.id!,
                                name: SUPPORT_USER.name!,
                            },
                        },
                    },
                })
            })
        })

        it('creates an UpdateTicket job with assignee_user: null when clearing assignee', async () => {
            const { result } = setup()
            const waitForRequest = mockCreateJob.waitForRequest(server)

            await result.current.handleAssignUser(null)

            await waitForRequest(async (request) => {
                const body = await request.json()
                expect(body).toMatchObject({
                    type: JobType.UpdateTicket,
                    params: {
                        ticket_ids: TICKET_IDS,
                        updates: { assignee_user: null },
                    },
                })
            })
        })

        it('uses the view-scoped success message when hasSelectedAll is true', async () => {
            const toastSuccessSpy = vi
                .spyOn(toast, 'success')
                .mockImplementation(() => '' as any)
            const { result } = setup({
                hasSelectedAll: true,
                visibleTicketIds: [1, 2, 3, 4],
            })

            await result.current.handleAssignUser(SUPPORT_USER)

            await waitFor(() => {
                expect(toastSuccessSpy).toHaveBeenCalledWith(
                    'All tickets in this view assigned to Jane Doe. Updates may take a few seconds to apply.',
                )
            })
        })

        it('calls onActionComplete after the job completes', async () => {
            const onActionComplete = vi.fn()
            const { result } = setup({ onActionComplete })

            await result.current.handleAssignUser(SUPPORT_USER)

            expect(onActionComplete).toHaveBeenCalledTimes(1)
        })
    })

    describe('handleAddTag', () => {
        it('creates an UpdateTicket job with the selected tag name', async () => {
            const { result } = setup()
            const waitForRequest = mockCreateJob.waitForRequest(server)

            await result.current.handleAddTag(VIP_TAG)

            await waitForRequest(async (request) => {
                const body = await request.json()
                expect(body).toMatchObject({
                    type: JobType.UpdateTicket,
                    params: {
                        ticket_ids: TICKET_IDS,
                        updates: { tags: ['VIP'] },
                    },
                })
            })
        })

        it('uses the eventual-consistency success message', async () => {
            const toastSuccessSpy = vi
                .spyOn(toast, 'success')
                .mockImplementation(() => '' as any)
            const { result } = setup()

            await result.current.handleAddTag(VIP_TAG)

            await waitFor(() => {
                expect(toastSuccessSpy).toHaveBeenCalledWith(
                    '2 tickets tagged with VIP. Updates may take a few seconds to apply.',
                )
            })
        })
    })

    describe('handleMoveToTrash', () => {
        it('creates an UpdateTicket job with trashed_datetime', async () => {
            const { result } = setup()
            const waitForRequest = mockCreateJob.waitForRequest(server)

            await result.current.handleMoveToTrash()

            await waitForRequest(async (request) => {
                const body = await request.json()
                expect(body).toMatchObject({
                    type: JobType.UpdateTicket,
                    params: {
                        ticket_ids: TICKET_IDS,
                        updates: { trashed_datetime: expect.any(String) },
                    },
                })
            })
        })

        it('calls onActionComplete after the job completes', async () => {
            const onActionComplete = vi.fn()
            const { result } = setup({ onActionComplete })

            await result.current.handleMoveToTrash()

            expect(onActionComplete).toHaveBeenCalledTimes(1)
        })
    })

    describe('handleUndelete', () => {
        it('creates an UpdateTicket job with trashed_datetime: null', async () => {
            const { result } = setup()
            const waitForRequest = mockCreateJob.waitForRequest(server)

            await result.current.handleUndelete()

            await waitForRequest(async (request) => {
                const body = await request.json()
                expect(body).toMatchObject({
                    type: JobType.UpdateTicket,
                    params: {
                        ticket_ids: TICKET_IDS,
                        updates: { trashed_datetime: null },
                    },
                })
            })
        })

        it('does not remove tickets from the ticket list cache by default', async () => {
            viewTicketsState.current = [
                mockTicket({ id: 1 }),
                mockTicket({ id: 2 }),
                mockTicket({ id: 3 }),
            ]

            const { result } = setup()

            await waitForListToLoad(result, [1, 2, 3])

            await result.current.handleUndelete()

            await waitFor(() => {
                expect(
                    result.current.list.tickets.map((ticket) => ticket.id),
                ).toEqual([1, 2, 3])
            })
        })

        it('optimistically removes selected tickets from the ticket list cache when requested', async () => {
            viewTicketsState.current = [
                mockTicket({ id: 1 }),
                mockTicket({ id: 2 }),
                mockTicket({ id: 3 }),
            ]

            const { result } = setup()
            const waitForRequest = mockCreateJob.waitForRequest(server)

            await waitForListToLoad(result, [1, 2, 3])

            await result.current.handleUndelete({
                removeFromCurrentViewCache: true,
            })

            await waitFor(() => {
                expect(
                    result.current.list.tickets.map((ticket) => ticket.id),
                ).toEqual([3])
            })

            await waitForRequest(async (request) => {
                const body = await request.json()
                expect(body).toMatchObject({
                    type: JobType.UpdateTicket,
                    params: {
                        ticket_ids: TICKET_IDS,
                        updates: { trashed_datetime: null },
                    },
                })
            })
        })

        it('calls onActionComplete after the job completes', async () => {
            const onActionComplete = vi.fn()
            const { result } = setup({ onActionComplete })

            await result.current.handleUndelete()

            expect(onActionComplete).toHaveBeenCalledTimes(1)
        })
    })

    describe('handleDeleteForever', () => {
        it('creates a DeleteTicket job', async () => {
            const { result } = setup()
            const waitForRequest = mockCreateJob.waitForRequest(server)

            await result.current.handleDeleteForever()

            await waitForRequest(async (request) => {
                const body = await request.json()
                expect(body).toMatchObject({
                    type: JobType.DeleteTicket,
                    params: { ticket_ids: TICKET_IDS },
                })
            })
        })

        it('optimistically removes selected tickets from the ticket list cache', async () => {
            viewTicketsState.current = [
                mockTicket({ id: 1 }),
                mockTicket({ id: 2 }),
                mockTicket({ id: 3 }),
            ]

            const { result } = setup()

            await waitForListToLoad(result, [1, 2, 3])

            await result.current.handleDeleteForever()

            await waitFor(() => {
                expect(
                    result.current.list.tickets.map((ticket) => ticket.id),
                ).toEqual([3])
            })
        })

        it('calls onActionComplete after the job completes', async () => {
            const onActionComplete = vi.fn()
            const { result } = setup({ onActionComplete })

            await result.current.handleDeleteForever()

            expect(onActionComplete).toHaveBeenCalledTimes(1)
        })
    })

    describe('handleExportTickets', () => {
        it('creates an ExportTicket job', async () => {
            const { result } = setup()
            const waitForRequest = mockCreateJob.waitForRequest(server)

            await result.current.handleExportTickets()

            await waitForRequest(async (request) => {
                const body = await request.json()
                expect(body).toMatchObject({
                    type: JobType.ExportTicket,
                    params: { ticket_ids: TICKET_IDS },
                })
                expect(body.params).not.toHaveProperty('updates')
            })
        })

        it('calls onActionComplete after the job completes', async () => {
            const onActionComplete = vi.fn()
            const { result } = setup({ onActionComplete })

            await result.current.handleExportTickets()

            expect(onActionComplete).toHaveBeenCalledTimes(1)
        })
    })

    describe('handleApplyMacro', () => {
        it('calls onApplyMacro with the selected ticket IDs', () => {
            const onApplyMacro = vi.fn()
            const { result } = setup({ onApplyMacro })

            result.current.handleApplyMacro()

            expect(onApplyMacro).toHaveBeenCalledWith(TICKET_IDS)
        })

        it('calls onApplyMacro with an empty array when hasSelectedAll is true', () => {
            const onApplyMacro = vi.fn()
            const { result } = setup({ onApplyMacro, hasSelectedAll: true })

            result.current.handleApplyMacro()

            expect(onApplyMacro).toHaveBeenCalledWith([])
        })

        it('calls onActionComplete', () => {
            const onActionComplete = vi.fn()
            const { result } = setup({
                onActionComplete,
                onApplyMacro: vi.fn(),
            })

            result.current.handleApplyMacro()

            expect(onActionComplete).toHaveBeenCalledTimes(1)
        })
    })

    describe('with hasSelectedAll', () => {
        it('sends view_id instead of ticket_ids when hasSelectedAll is true', async () => {
            const { result } = setup({ hasSelectedAll: true })
            const waitForRequest = mockCreateJob.waitForRequest(server)

            await result.current.handleMarkAsRead()

            await waitForRequest(async (request) => {
                const body = await request.json()
                expect(body.params).toMatchObject({ view_id: VIEW_ID })
                expect(body.params).not.toHaveProperty('ticket_ids')
            })
        })
    })
})
