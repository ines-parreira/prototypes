import { act } from '@testing-library/react'
import { HttpResponse } from 'msw'

import {
    mockSearchTicketsHandler,
    mockSearchTicketsResponse,
    mockTicket,
} from '@gorgias/helpdesk-mocks'

import { renderHook } from '../../../../../tests/render.utils'
import { server } from '../../../../../tests/server'

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

import { useMergeTicketSearch } from '../useMergeTicketSearch'

describe('useMergeTicketSearch', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        server.use(
            mockSearchTicketsHandler(async () =>
                HttpResponse.json(mockSearchTicketsResponse({ data: [] })),
            ).handler,
        )
    })

    afterEach(() => {
        if (vi.isFakeTimers()) {
            vi.runOnlyPendingTimers()
            vi.useRealTimers()
        }
    })

    it('should debounce search before querying tickets', async () => {
        vi.useFakeTimers()
        const searches: string[] = []
        server.use(
            mockSearchTicketsHandler(async ({ request }) => {
                const body = (await request.json()) as { search?: string }
                searches.push(body.search ?? '')

                return HttpResponse.json(
                    mockSearchTicketsResponse({ data: [] }),
                )
            }).handler,
        )

        const ticket = mockTicket({
            id: 123,
        })

        const { result } = renderHook(() => useMergeTicketSearch(ticket))

        act(() => {
            result.current.setSearchQuery('target')
        })

        act(() => {
            vi.advanceTimersByTime(299)
        })

        expect(searches).not.toContain('target')

        await act(async () => {
            vi.advanceTimersByTime(1)
        })

        await vi.waitFor(() => {
            expect(searches).toContain('target')
        })
    })

    it('should call search query with expected options', async () => {
        const searchTicketsMock = mockSearchTicketsHandler(async () =>
            HttpResponse.json(mockSearchTicketsResponse({ data: [] })),
        )
        const waitForSearchTicketsRequest =
            searchTicketsMock.waitForRequest(server)
        server.use(searchTicketsMock.handler)
        const ticket = mockTicket({
            id: 123,
        })

        renderHook(() => useMergeTicketSearch(ticket))

        await waitForSearchTicketsRequest(async (request) => {
            const body = (await request.json()) as {
                search?: string
                filters?: string
            }
            const searchParams = new URL(request.url).searchParams

            expect(body.filters).toEqual(expect.any(String))
            expect(body.search).toBe('')
            expect(searchParams.get('limit')).toBe('8')
            expect(searchParams.get('order_by')).toContain(':')
        })
    })
})
