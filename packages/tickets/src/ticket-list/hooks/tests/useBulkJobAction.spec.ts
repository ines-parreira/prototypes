import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { toast } from '@gorgias/axiom'
import {
    mockCreateJobHandler,
    mockListViewItemsHandler,
    mockTicket,
} from '@gorgias/helpdesk-mocks'
import type { Ticket } from '@gorgias/helpdesk-queries'
import { JobType } from '@gorgias/helpdesk-types'

import { renderHook } from '../../../tests/render.utils'
import { useBulkJobAction } from '../useBulkJobAction'
import { useTicketsList } from '../useTicketsList'

const mockCreateJob = mockCreateJobHandler()

const server = setupServer()

const VIEW_ID = 10
const TICKET_IDS = [1, 2, 3]
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

function useHooks(
    props: { ticketIds?: number[]; hasSelectedAll?: boolean } = {},
) {
    const list = useTicketsList(VIEW_ID, {
        enableStaleUpdates: false,
    })
    const bulkAction = useBulkJobAction({
        viewId: VIEW_ID,
        ticketIds: props.ticketIds ?? TICKET_IDS,
        hasSelectedAll: props.hasSelectedAll ?? false,
    })

    return { bulkAction, list }
}

function setup(props: { ticketIds?: number[]; hasSelectedAll?: boolean } = {}) {
    return renderHook(() => useHooks(props))
}

async function waitForListToLoad(
    hook: ReturnType<typeof setup>,
    expectedTicketIds: number[],
) {
    await waitFor(() => {
        expect(hook.result.current.list.isLoading).toBe(false)
        expect(
            hook.result.current.list.tickets.map((ticket) => ticket.id),
        ).toEqual(expectedTicketIds)
    })
}

describe('useBulkJobAction', () => {
    describe('createJob', () => {
        it('posts with ticket_ids when hasSelectedAll is false', async () => {
            const hook = setup({
                ticketIds: [1, 2],
                hasSelectedAll: false,
            })
            const waitForRequest = mockCreateJob.waitForRequest(server)

            await hook.result.current.bulkAction.createJob(JobType.UpdateTicket)

            await waitForRequest(async (request) => {
                const body = await request.json()
                expect(body).toMatchObject({
                    type: JobType.UpdateTicket,
                    params: { ticket_ids: [1, 2] },
                })
                expect(body.params).not.toHaveProperty('view_id')
            })
        })

        it('posts with view_id when hasSelectedAll is true', async () => {
            const hook = setup({ hasSelectedAll: true })
            const waitForRequest = mockCreateJob.waitForRequest(server)

            await hook.result.current.bulkAction.createJob(JobType.UpdateTicket)

            await waitForRequest(async (request) => {
                const body = await request.json()
                expect(body).toMatchObject({
                    type: JobType.UpdateTicket,
                    params: { view_id: VIEW_ID },
                })
                expect(body.params).not.toHaveProperty('ticket_ids')
            })
        })

        it('includes updates in the request body when provided', async () => {
            const hook = setup({ ticketIds: [1] })
            const waitForRequest = mockCreateJob.waitForRequest(server)
            const updates = { status: 'closed' as const }

            await hook.result.current.bulkAction.createJob(
                JobType.UpdateTicket,
                updates,
            )

            await waitForRequest(async (request) => {
                const body = await request.json()
                expect(body.params).toMatchObject({ updates })
            })
        })

        it('optimistically patches the loaded tickets list when a list patch is provided', async () => {
            viewTicketsState.current = [
                mockTicket({ id: 1, is_unread: false }),
                mockTicket({ id: 2, is_unread: false }),
                mockTicket({ id: 3, is_unread: false }),
            ]

            const hook = setup({ ticketIds: [1, 2] })

            await waitForListToLoad(hook, [1, 2, 3])

            await hook.result.current.bulkAction.createJob(
                JobType.UpdateTicket,
                { is_unread: true },
                undefined,
                { is_unread: true },
            )

            await waitFor(() => {
                expect(
                    hook.result.current.list.tickets.map(
                        (ticket) => ticket.is_unread,
                    ),
                ).toEqual([true, true, false])
            })
        })

        it('dispatches a success notification after the job completes', async () => {
            const toastSuccessSpy = vi
                .spyOn(toast, 'success')
                .mockImplementation(() => '' as any)
            const hook = setup()

            await hook.result.current.bulkAction.createJob(
                JobType.UpdateTicket,
                undefined,
                'Done!',
            )

            await waitFor(() => {
                expect(toastSuccessSpy).toHaveBeenCalledWith('Done!')
            })
        })

        it('uses the default success message when none is provided', async () => {
            const toastSuccessSpy = vi
                .spyOn(toast, 'success')
                .mockImplementation(() => '' as any)
            const hook = setup()

            await hook.result.current.bulkAction.createJob(JobType.UpdateTicket)

            await waitFor(() => {
                expect(toastSuccessSpy).toHaveBeenCalledWith(
                    'Action applied successfully',
                )
            })
        })

        it('dispatches an error notification on failure', async () => {
            const toastErrorSpy = vi
                .spyOn(toast, 'error')
                .mockImplementation(() => '' as any)
            server.use(
                mockCreateJobHandler(async () =>
                    HttpResponse.json(null, { status: 500 }),
                ).handler,
            )

            const hook = setup({
                ticketIds: [1],
                hasSelectedAll: false,
            })

            await hook.result.current.bulkAction.createJob(JobType.UpdateTicket)

            await waitFor(() => {
                expect(toastErrorSpy).toHaveBeenCalledWith(
                    'Failed to apply action. Please try again.',
                )
            })
        })

        it('rolls back the loaded tickets list when an optimistic patch fails', async () => {
            server.use(
                mockCreateJobHandler(async () =>
                    HttpResponse.json(null, { status: 500 }),
                ).handler,
            )
            viewTicketsState.current = [
                mockTicket({ id: 1, is_unread: false }),
                mockTicket({ id: 2, is_unread: false }),
            ]

            const hook = setup({ ticketIds: [1, 2] })

            await waitForListToLoad(hook, [1, 2])

            await hook.result.current.bulkAction.createJob(
                JobType.UpdateTicket,
                { is_unread: true },
                undefined,
                { is_unread: true },
            )

            await waitFor(() => {
                expect(
                    hook.result.current.list.tickets.map(
                        (ticket) => ticket.is_unread,
                    ),
                ).toEqual([false, false])
            })
        })
    })

    describe('createJobRemovingTickets', () => {
        it('optimistically removes selected tickets from the loaded tickets list', async () => {
            viewTicketsState.current = [
                mockTicket({ id: 1 }),
                mockTicket({ id: 2 }),
                mockTicket({ id: 3 }),
            ]

            const hook = setup({ ticketIds: [1, 2] })

            await waitForListToLoad(hook, [1, 2, 3])

            await hook.result.current.bulkAction.createJobRemovingTickets(
                JobType.DeleteTicket,
            )

            await waitFor(() => {
                expect(
                    hook.result.current.list.tickets.map((ticket) => ticket.id),
                ).toEqual([3])
            })
        })

        it('dispatches a success notification', async () => {
            const toastSuccessSpy = vi
                .spyOn(toast, 'success')
                .mockImplementation(() => '' as any)
            const hook = setup()

            await hook.result.current.bulkAction.createJobRemovingTickets(
                JobType.DeleteTicket,
                undefined,
                'Tickets deleted',
            )

            await waitFor(() => {
                expect(toastSuccessSpy).toHaveBeenCalledWith('Tickets deleted')
            })
        })

        it('dispatches an error notification on failure', async () => {
            const toastErrorSpy = vi
                .spyOn(toast, 'error')
                .mockImplementation(() => '' as any)
            server.use(
                mockCreateJobHandler(async () =>
                    HttpResponse.json(null, { status: 500 }),
                ).handler,
            )
            viewTicketsState.current = [
                mockTicket({ id: 1 }),
                mockTicket({ id: 2 }),
            ]

            const hook = setup({ ticketIds: [1, 2] })

            await waitForListToLoad(hook, [1, 2])

            await hook.result.current.bulkAction.createJobRemovingTickets(
                JobType.DeleteTicket,
            )

            await waitFor(() => {
                expect(
                    hook.result.current.list.tickets.map((ticket) => ticket.id),
                ).toEqual([1, 2])
            })

            await waitFor(() => {
                expect(toastErrorSpy).toHaveBeenCalledWith(
                    'Failed to apply action. Please try again.',
                )
            })
        })

        it('posts with view_id when hasSelectedAll is true', async () => {
            const hook = setup({ hasSelectedAll: true })
            const waitForRequest = mockCreateJob.waitForRequest(server)

            await hook.result.current.bulkAction.createJobRemovingTickets(
                JobType.DeleteTicket,
            )

            await waitForRequest(async (request) => {
                const body = await request.json()
                expect(body).toMatchObject({
                    type: JobType.DeleteTicket,
                    params: { view_id: VIEW_ID },
                })
            })
        })

        it('optimistically clears the whole visible list when hasSelectedAll is true', async () => {
            viewTicketsState.current = [
                mockTicket({ id: 1 }),
                mockTicket({ id: 2 }),
                mockTicket({ id: 3 }),
            ]

            const hook = setup({ hasSelectedAll: true })

            await waitForListToLoad(hook, [1, 2, 3])

            await hook.result.current.bulkAction.createJobRemovingTickets(
                JobType.DeleteTicket,
            )

            await waitFor(() => {
                expect(hook.result.current.list.tickets).toEqual([])
            })
        })
    })
})
