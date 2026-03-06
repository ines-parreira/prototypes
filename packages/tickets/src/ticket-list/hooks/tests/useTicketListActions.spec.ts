import { setupServer } from 'msw/node'

import { mockCreateJobHandler } from '@gorgias/helpdesk-mocks'
import { JobType } from '@gorgias/helpdesk-types'

import { renderHook, testAppQueryClient } from '../../../tests/render.utils'
import { useTicketListActions } from '../useTicketListActions'

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
const TICKET_IDS = [1, 2]

function setup(
    overrides: {
        ticketIds?: number[]
        hasSelectedAll?: boolean
        onActionComplete?: () => void
    } = {},
) {
    const onActionComplete = overrides.onActionComplete ?? vi.fn()
    const { result } = renderHook(() =>
        useTicketListActions({
            viewId: VIEW_ID,
            selectedTicketIds: new Set(overrides.ticketIds ?? TICKET_IDS),
            hasSelectedAll: overrides.hasSelectedAll ?? false,
            onActionComplete,
        }),
    )
    return { result, onActionComplete }
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

    describe('handleMoveToTrash', () => {
        it('creates a DeleteTicket job', async () => {
            const { result } = setup()
            const waitForRequest = mockCreateJob.waitForRequest(server)

            await result.current.handleMoveToTrash()

            await waitForRequest(async (request) => {
                const body = await request.json()
                expect(body).toMatchObject({
                    type: JobType.DeleteTicket,
                    params: { ticket_ids: TICKET_IDS },
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
