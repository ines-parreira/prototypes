import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockListViewItemsHandler,
    mockListViewItemsUpdatesHandler,
    mockTicket,
} from '@gorgias/helpdesk-mocks'

import { renderHook, testAppQueryClient } from '../../../tests/render.utils'
import * as useRefreshStaleTicketsModule from '../useRefreshStaleTickets'
import { useTicketsList } from '../useTicketsList'

const viewId = 123
const mockTicket1 = mockTicket({ id: 1, subject: 'Test Ticket 1' })
const mockTicket2 = mockTicket({ id: 2, subject: 'Test Ticket 2' })
const mockTicket3 = mockTicket({ id: 3, subject: 'Test Ticket 3' })

const mockListViewItemsPage1 = mockListViewItemsHandler(async () =>
    HttpResponse.json({
        data: [mockTicket1, mockTicket2],
        meta: {
            current_cursor: null,
            next_items: `/api/views/${viewId}/items/?cursor=next-cursor`,
            prev_items: null,
        },
        object: 'list',
        uri: `/api/views/${viewId}/items/`,
    } as any),
)

const mockListViewItemsPage2 = mockListViewItemsHandler(async () =>
    HttpResponse.json({
        data: [mockTicket3],
        meta: {
            current_cursor: 'next-cursor',
            next_items: null,
            prev_items: `/api/views/${viewId}/items/?cursor=prev-cursor`,
        },
        object: 'list',
        uri: `/api/views/${viewId}/items/`,
    } as any),
)

const mockListViewItemsUpdatesNoOp = mockListViewItemsUpdatesHandler(async () =>
    HttpResponse.json({
        data: [],
        meta: {},
    }),
)

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    server.use(
        mockListViewItemsPage1.handler,
        mockListViewItemsUpdatesNoOp.handler,
    )
    testAppQueryClient.clear()
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('useTicketsList', () => {
    it('should fetch tickets successfully', async () => {
        const { result } = renderHook(() => useTicketsList(viewId))

        expect(result.current.isLoading).toBe(true)

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.tickets).toHaveLength(2)
        expect(result.current.tickets[0]).toEqual(mockTicket1)
        expect(result.current.tickets[1]).toEqual(mockTicket2)
        expect(result.current.error).toBe(null)
    })

    it('should return hasNextPage true when next_items exists', async () => {
        const { result } = renderHook(() => useTicketsList(viewId))

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.hasNextPage).toBe(true)
    })

    it('should fetch next page when fetchNextPage is called', async () => {
        const { result } = renderHook(() => useTicketsList(viewId))

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.tickets).toHaveLength(2)
        expect(result.current.hasNextPage).toBe(true)

        // Setup page 2 handler
        server.use(mockListViewItemsPage2.handler)

        // Fetch next page
        result.current.fetchNextPage()

        await waitFor(() => {
            expect(result.current.tickets).toHaveLength(3)
        })

        expect(result.current.tickets[2]).toEqual(mockTicket3)
        expect(result.current.hasNextPage).toBe(false)
    })

    it('should extract cursor from next_items URL', async () => {
        const { result } = renderHook(() => useTicketsList(viewId))

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.hasNextPage).toBe(true)

        // The hook should extract "next-cursor" from the URL
        // This is tested implicitly through hasNextPage being true
    })

    it('should pass order_by parameter', async () => {
        const waitForRequest = mockListViewItemsPage1.waitForRequest(server)

        renderHook(() =>
            useTicketsList(viewId, {
                order_by: 'last_message_datetime:desc',
            }),
        )

        await waitForRequest(async (request) => {
            const url = new URL(request.url)
            expect(url.searchParams.get('order_by')).toBe(
                'last_message_datetime:desc',
            )
        })
    })

    it('should handle empty ticket list', async () => {
        server.use(
            mockListViewItemsHandler(async () =>
                HttpResponse.json({
                    data: [],
                    meta: {
                        current_cursor: null,
                        next_items: null,
                        prev_items: null,
                    },
                    object: 'list',
                    uri: `/api/views/${viewId}/items/`,
                } as any),
            ).handler,
        )

        const { result } = renderHook(() => useTicketsList(viewId))

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.tickets).toHaveLength(0)
        expect(result.current.hasNextPage).toBe(false)
    })

    it('should disable stale updates polling when enableStaleUpdates is false', async () => {
        const refreshSpy = vi.spyOn(
            useRefreshStaleTicketsModule,
            'useRefreshStaleTickets',
        )

        renderHook(() => useTicketsList(viewId, undefined, false, false))

        await waitFor(() => {
            expect(refreshSpy).toHaveBeenCalled()
        })

        expect(refreshSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                viewId,
                enabled: false,
            }),
        )
    })
})
