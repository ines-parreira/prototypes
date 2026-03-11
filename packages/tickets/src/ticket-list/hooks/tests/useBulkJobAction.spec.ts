import type { InfiniteData } from '@tanstack/react-query'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockCreateJobHandler, mockTicket } from '@gorgias/helpdesk-mocks'
import { queryKeys } from '@gorgias/helpdesk-queries'
import type { Ticket } from '@gorgias/helpdesk-queries'
import { JobType } from '@gorgias/helpdesk-types'

import { renderHook, testAppQueryClient } from '../../../tests/render.utils'
import { NotificationStatus } from '../../../utils/LegacyBridge/context'
import { useBulkJobAction } from '../useBulkJobAction'

const mockCreateJob = mockCreateJobHandler()

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    testAppQueryClient.clear()
    server.use(mockCreateJob.handler)
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

const VIEW_ID = 10
const TICKET_IDS = [1, 2, 3]

function makeInfiniteData(tickets: Ticket[]): InfiniteData<{ data: Ticket[] }> {
    return {
        pages: [{ data: tickets }],
        pageParams: [undefined],
    }
}

function seedViewCache(tickets: Ticket[]) {
    testAppQueryClient.setQueryData(
        queryKeys.views.listViewItems(VIEW_ID, undefined),
        makeInfiniteData(tickets),
    )
}

function getViewCache() {
    return testAppQueryClient.getQueryData<InfiniteData<{ data: Ticket[] }>>(
        queryKeys.views.listViewItems(VIEW_ID, undefined),
    )
}

function setup(props: { ticketIds?: number[]; hasSelectedAll?: boolean } = {}) {
    const dispatchNotification = vi.fn()
    const { result } = renderHook(
        () =>
            useBulkJobAction({
                viewId: VIEW_ID,
                ticketIds: props.ticketIds ?? TICKET_IDS,
                hasSelectedAll: props.hasSelectedAll ?? false,
            }),
        { dispatchNotification },
    )
    return { result, dispatchNotification }
}

describe('useBulkJobAction', () => {
    describe('createJob', () => {
        it('posts with ticket_ids when hasSelectedAll is false', async () => {
            const { result } = setup({
                ticketIds: [1, 2],
                hasSelectedAll: false,
            })
            const waitForRequest = mockCreateJob.waitForRequest(server)

            await result.current.createJob(JobType.UpdateTicket)

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
            const { result } = setup({ hasSelectedAll: true })
            const waitForRequest = mockCreateJob.waitForRequest(server)

            await result.current.createJob(JobType.UpdateTicket)

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
            const { result } = setup({ ticketIds: [1] })
            const waitForRequest = mockCreateJob.waitForRequest(server)
            const updates = { status: 'closed' as const }

            await result.current.createJob(JobType.UpdateTicket, updates)

            await waitForRequest(async (request) => {
                const body = await request.json()
                expect(body.params).toMatchObject({ updates })
            })
        })

        it('optimistically patches list cache when a list patch is provided', async () => {
            seedViewCache([
                mockTicket({ id: 1, is_unread: false }),
                mockTicket({ id: 2, is_unread: false }),
                mockTicket({ id: 3, is_unread: false }),
            ])
            const { result } = setup({ ticketIds: [1, 2] })

            await result.current.createJob(
                JobType.UpdateTicket,
                { is_unread: true },
                undefined,
                { is_unread: true },
            )

            expect(getViewCache()?.pages[0].data[0]?.is_unread).toBe(true)
            expect(getViewCache()?.pages[0].data[1]?.is_unread).toBe(true)
            expect(getViewCache()?.pages[0].data[2]?.is_unread).toBe(false)
        })

        it('dispatches a success notification after the job completes', async () => {
            const { result, dispatchNotification } = setup()

            await result.current.createJob(
                JobType.UpdateTicket,
                undefined,
                'Done!',
            )

            expect(dispatchNotification).toHaveBeenCalledWith({
                status: NotificationStatus.Success,
                message: 'Done!',
            })
        })

        it('uses default success message when none is provided', async () => {
            const { result, dispatchNotification } = setup()

            await result.current.createJob(JobType.UpdateTicket)

            expect(dispatchNotification).toHaveBeenCalledWith({
                status: NotificationStatus.Success,
                message: 'Action applied successfully',
            })
        })

        it('dispatches error notification on failure', async () => {
            server.use(
                mockCreateJobHandler(async () =>
                    HttpResponse.json(null, { status: 500 }),
                ).handler,
            )

            const { result, dispatchNotification } = setup({
                ticketIds: [1],
                hasSelectedAll: false,
            })

            await result.current.createJob(JobType.UpdateTicket)

            expect(dispatchNotification).toHaveBeenCalledWith({
                status: NotificationStatus.Error,
                message: 'Failed to apply action. Please try again.',
            })
        })

        it('rolls back the list cache when an optimistic list patch fails', async () => {
            seedViewCache([
                mockTicket({ id: 1, is_unread: false }),
                mockTicket({ id: 2, is_unread: false }),
            ])
            server.use(
                mockCreateJobHandler(async () =>
                    HttpResponse.json(null, { status: 500 }),
                ).handler,
            )
            const { result } = setup({ ticketIds: [1, 2] })

            await result.current.createJob(
                JobType.UpdateTicket,
                { is_unread: true },
                undefined,
                { is_unread: true },
            )

            expect(getViewCache()?.pages[0].data[0]?.is_unread).toBe(false)
            expect(getViewCache()?.pages[0].data[1]?.is_unread).toBe(false)
        })
    })

    describe('createJobRemovingTickets', () => {
        it('optimistically removes selected tickets from list cache', async () => {
            seedViewCache([
                mockTicket({ id: 1 }),
                mockTicket({ id: 2 }),
                mockTicket({ id: 3 }),
            ])
            const { result } = setup({ ticketIds: [1, 2] })

            await result.current.createJobRemovingTickets(JobType.DeleteTicket)

            expect(
                getViewCache()?.pages[0].data.map((ticket) => ticket.id),
            ).toEqual([3])
        })

        it('dispatches success notification', async () => {
            const { result, dispatchNotification } = setup()

            await result.current.createJobRemovingTickets(
                JobType.DeleteTicket,
                undefined,
                'Tickets deleted',
            )

            expect(dispatchNotification).toHaveBeenCalledWith({
                status: NotificationStatus.Success,
                message: 'Tickets deleted',
            })
        })

        it('dispatches error notification on failure', async () => {
            seedViewCache([mockTicket({ id: 1 }), mockTicket({ id: 2 })])
            server.use(
                mockCreateJobHandler(async () =>
                    HttpResponse.json(null, { status: 500 }),
                ).handler,
            )

            const { result, dispatchNotification } = setup({
                ticketIds: [1, 2],
                hasSelectedAll: false,
            })

            await result.current.createJobRemovingTickets(JobType.DeleteTicket)

            expect(dispatchNotification).toHaveBeenCalledWith({
                status: NotificationStatus.Error,
                message: 'Failed to apply action. Please try again.',
            })
            expect(
                getViewCache()?.pages[0].data.map((ticket) => ticket.id),
            ).toEqual([1, 2])
        })

        it('posts with view_id when hasSelectedAll is true', async () => {
            const { result } = setup({ hasSelectedAll: true })
            const waitForRequest = mockCreateJob.waitForRequest(server)

            await result.current.createJobRemovingTickets(JobType.DeleteTicket)

            await waitForRequest(async (request) => {
                const body = await request.json()
                expect(body).toMatchObject({
                    type: JobType.DeleteTicket,
                    params: { view_id: VIEW_ID },
                })
            })
        })

        it('optimistically clears the whole visible list when hasSelectedAll is true', async () => {
            seedViewCache([
                mockTicket({ id: 1 }),
                mockTicket({ id: 2 }),
                mockTicket({ id: 3 }),
            ])
            const { result } = setup({ hasSelectedAll: true })

            await result.current.createJobRemovingTickets(JobType.DeleteTicket)

            expect(getViewCache()?.pages[0].data).toEqual([])
        })
    })
})
