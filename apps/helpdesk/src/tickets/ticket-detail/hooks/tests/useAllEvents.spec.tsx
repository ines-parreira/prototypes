import { renderHook } from '@repo/testing'

import { setupServer } from 'msw/node'
import { mockListEventsHandler } from '@gorgias/helpdesk-mocks'
import { queryKeys } from '@gorgias/helpdesk-queries'
import type { Event } from '@gorgias/helpdesk-types'

import { useExhaustEndpoint } from 'hooks/useExhaustEndpoint'
import { TICKET_QUERIES_DEFAULT_CONFIG } from 'tickets/ticket-detail/constants'

import { useAllEvents } from '../useAllEvents'

jest.mock('hooks/useExhaustEndpoint', () => ({
    useExhaustEndpoint: jest.fn(),
}))
const useExhaustEndpointMock = useExhaustEndpoint as jest.Mock

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

describe('useAllEvents', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('calls useExhaustEndpoint with correct params and returns transformed result', async () => {
        const mockData = [{ id: 1 }, { id: 2 }] as Event[]
        useExhaustEndpointMock.mockReturnValue({
            data: mockData,
            isLoading: false,
        })

        const { result } = renderHook(() => useAllEvents(123))

        expect(useExhaustEndpointMock).toHaveBeenCalledWith(
            queryKeys.events.listEvents({
                object_id: 123,
                object_type: 'Ticket',
                limit: 100,
            }),
            expect.any(Function),
            TICKET_QUERIES_DEFAULT_CONFIG,
        )
        expect(result.current).toEqual({ events: mockData, isLoading: false })
    })

    it('calls listEvents with the correct params', async () => {
        const listEventsMock = mockListEventsHandler()
        server.use(listEventsMock.handler)
        const waitForListEventsRequest = listEventsMock.waitForRequest(server)
        useExhaustEndpointMock.mockReturnValue({ data: [], isLoading: true })
        renderHook(() => useAllEvents(123))

        const [[, fetchData]] = useExhaustEndpointMock.mock.calls as [
            [Event[], (cursor?: string) => Promise<unknown>],
        ]
        void fetchData()

        await waitForListEventsRequest((request) => {
            const url = new URL(request.url)
            expect(url.searchParams.get('object_id')).toBe('123')
            expect(url.searchParams.get('object_type')).toBe('Ticket')
            expect(url.searchParams.get('limit')).toBe('100')
            expect(url.searchParams.get('cursor')).toBeNull()
        })
    })

    it('returns loading state when endpoint hook is loading', async () => {
        useExhaustEndpointMock.mockReturnValue({ data: [], isLoading: true })
        const { result } = renderHook(() => useAllEvents(123))

        expect(result.current).toEqual({ events: [], isLoading: true })
    })
})
