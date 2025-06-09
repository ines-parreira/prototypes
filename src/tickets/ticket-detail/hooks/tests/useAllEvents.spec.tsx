import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { listEvents } from '@gorgias/helpdesk-client'
import type { Event } from '@gorgias/helpdesk-types'

import { useExhaustEndpoint } from 'hooks/useExhaustEndpoint'
import { renderHook } from 'utils/testing/renderHook'

import { useAllEvents } from '../useAllEvents'

jest.mock('@gorgias/helpdesk-client', () => ({
    listEvents: jest.fn(),
}))
const listEventsMock = listEvents as jest.Mock

jest.mock('hooks/useExhaustEndpoint', () => ({
    useExhaustEndpoint: jest.fn(),
}))
const useExhaustEndpointMock = useExhaustEndpoint as jest.Mock

function createWrapper() {
    const queryClient = new QueryClient()
    return ({ children }: { children?: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}

describe('useAllEvents', () => {
    it('calls useExhaustEndpoint with correct params and returns transformed result', async () => {
        const mockData = [{ id: 1 }, { id: 2 }] as Event[]
        useExhaustEndpointMock.mockReturnValue({
            data: mockData,
            isLoading: false,
        })

        const { result } = renderHook(() => useAllEvents(123), {
            wrapper: createWrapper(),
        })

        expect(useExhaustEndpointMock).toHaveBeenCalledWith(
            ['all-events', 123],
            expect.any(Function),
            {
                refetchOnWindowFocus: false,
                staleTime: expect.any(Number),
            },
        )
        expect(result.current).toEqual({ events: mockData, isLoading: false })
    })

    it('calls listEvents with the correct params', () => {
        useExhaustEndpointMock.mockReturnValue({ data: [], isLoading: true })
        renderHook(() => useAllEvents(123), { wrapper: createWrapper() })

        const [[, fetchData]] = useExhaustEndpointMock.mock.calls as [
            [Event[], (cursor?: string) => void],
        ]
        fetchData()

        expect(listEventsMock).toHaveBeenCalledWith({
            cursor: undefined,
            object_id: 123,
            object_type: 'Ticket',
            limit: 100,
        })
    })

    it('returns loading state when endpoint hook is loading', async () => {
        useExhaustEndpointMock.mockReturnValue({ data: [], isLoading: true })
        const { result } = renderHook(() => useAllEvents(123), {
            wrapper: createWrapper(),
        })

        expect(result.current).toEqual({ events: [], isLoading: true })
    })
})
