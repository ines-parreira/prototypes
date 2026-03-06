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
    const key = queryKeys.views.listViewItems(VIEW_ID, undefined)
    testAppQueryClient.setQueryData(key, makeInfiniteData(tickets))
}

function getViewCache() {
    const key = queryKeys.views.listViewItems(VIEW_ID, undefined)
    return testAppQueryClient.getQueryData<InfiniteData<{ data: Ticket[] }>>(
        key,
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

        it('dispatches a success notification after the job completes', async () => {
            const { result, dispatchNotification } = setup()

            await result.current.createJob(
                JobType.UpdateTicket,
                undefined,
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

        it('applies optimistic cache patch to selected ticket IDs', async () => {
            const tickets = TICKET_IDS.map((id) =>
                mockTicket({ id, subject: 'Original' }),
            )
            seedViewCache(tickets)

            const { result } = setup({
                ticketIds: [1, 2],
                hasSelectedAll: false,
            })

            await result.current.createJob(JobType.UpdateTicket, undefined, {
                subject: 'Updated',
            })

            const cache = getViewCache()
            expect(cache?.pages[0].data[0].subject).toBe('Updated')
            expect(cache?.pages[0].data[1].subject).toBe('Updated')
            expect(cache?.pages[0].data[2].subject).toBe('Original')
        })

        it('applies optimistic cache patch to all tickets when hasSelectedAll is true', async () => {
            const tickets = TICKET_IDS.map((id) =>
                mockTicket({ id, subject: 'Original' }),
            )
            seedViewCache(tickets)

            const { result } = setup({ hasSelectedAll: true })

            await result.current.createJob(JobType.UpdateTicket, undefined, {
                subject: 'Patched',
            })

            const cache = getViewCache()
            cache?.pages[0].data.forEach((ticket) => {
                expect(ticket.subject).toBe('Patched')
            })
        })

        it('reverts cache and dispatches error notification on failure', async () => {
            server.use(
                mockCreateJobHandler(async () =>
                    HttpResponse.json(null, { status: 500 }),
                ).handler,
            )

            const tickets = TICKET_IDS.map((id) =>
                mockTicket({ id, subject: 'Original' }),
            )
            seedViewCache(tickets)

            const { result, dispatchNotification } = setup({
                ticketIds: [1],
                hasSelectedAll: false,
            })

            await result.current.createJob(JobType.UpdateTicket, undefined, {
                subject: 'Should be reverted',
            })

            const cache = getViewCache()
            expect(cache?.pages[0].data[0].subject).toBe('Original')
            expect(dispatchNotification).toHaveBeenCalledWith({
                status: NotificationStatus.Error,
                message: 'Failed to apply action. Please try again.',
            })
        })
    })

    describe('createJobRemovingTickets', () => {
        it('removes selected tickets from cache optimistically', async () => {
            const tickets = TICKET_IDS.map((id) => mockTicket({ id }))
            seedViewCache(tickets)

            const { result } = setup({
                ticketIds: [1, 2],
                hasSelectedAll: false,
            })

            await result.current.createJobRemovingTickets(JobType.DeleteTicket)

            const cache = getViewCache()
            expect(cache?.pages[0].data).toHaveLength(1)
            expect(cache?.pages[0].data[0].id).toBe(3)
        })

        it('removes all tickets from cache when hasSelectedAll is true', async () => {
            const tickets = TICKET_IDS.map((id) => mockTicket({ id }))
            seedViewCache(tickets)

            const { result } = setup({ hasSelectedAll: true })

            await result.current.createJobRemovingTickets(JobType.DeleteTicket)

            const cache = getViewCache()
            expect(cache?.pages[0].data).toHaveLength(0)
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

        it('reverts cache and dispatches error notification on failure', async () => {
            server.use(
                mockCreateJobHandler(async () =>
                    HttpResponse.json(null, { status: 500 }),
                ).handler,
            )

            const tickets = TICKET_IDS.map((id) => mockTicket({ id }))
            seedViewCache(tickets)

            const { result, dispatchNotification } = setup({
                ticketIds: [1, 2],
                hasSelectedAll: false,
            })

            await result.current.createJobRemovingTickets(JobType.DeleteTicket)

            const cache = getViewCache()
            expect(cache?.pages[0].data).toHaveLength(3)
            expect(dispatchNotification).toHaveBeenCalledWith({
                status: NotificationStatus.Error,
                message: 'Failed to apply action. Please try again.',
            })
        })

        it('posts with view_id when hasSelectedAll is true', async () => {
            const { result } = setup({ hasSelectedAll: true })
            const waitForRequest = mockCreateJob.waitForRequest(server)

            await result.current.createJobRemovingTickets(JobType.DeleteTicket)

            await waitForRequest(async (request) => {
                const body = await request.json()
                expect(body.params).toMatchObject({ view_id: VIEW_ID })
            })
        })
    })

    describe('isLoading', () => {
        it('is false initially', () => {
            const { result } = setup()
            expect(result.current.isLoading).toBe(false)
        })
    })
})
