import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'

import { listSegments } from '@gorgias/customer-segmentation-client'

import { useSegments } from './useSegments'

jest.mock('@gorgias/customer-segmentation-client', () => ({
    listSegments: jest.fn(),
}))

const mockListSegments = listSegments as jest.Mock

describe('useSegments', () => {
    let queryClient: QueryClient

    const createWrapper = () => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
            },
        })

        return ({ children }: { children: React.ReactNode }) => (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        )
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should fetch segments successfully', async () => {
        const mockData = {
            data: [
                {
                    id: '1',
                    name: 'Segment A',
                    conditions: '',
                    created_datetime: '2026-01-01',
                    updated_datetime: '2026-01-01',
                },
            ],
            metadata: { next_cursor: null, prev_cursor: null },
        }
        mockListSegments.mockResolvedValue({ data: mockData })

        const { result } = renderHook(() => useSegments(123), {
            wrapper: createWrapper(),
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(mockListSegments).toHaveBeenCalledTimes(1)
        expect(mockListSegments).toHaveBeenCalledWith({ integration_id: 123 })
        expect(result.current.data).toEqual(mockData)
    })

    it('should pass additional params to listSegments', async () => {
        const mockData = {
            data: [],
            metadata: { next_cursor: 'cursor_abc', prev_cursor: null },
        }
        mockListSegments.mockResolvedValue({ data: mockData })

        const { result } = renderHook(
            () => useSegments(123, { limit: 25, cursor: 'cursor_abc' }),
            { wrapper: createWrapper() },
        )

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(mockListSegments).toHaveBeenCalledWith({
            integration_id: 123,
            limit: 25,
            cursor: 'cursor_abc',
        })
    })

    it('should not fetch when integrationId is undefined', async () => {
        const { result } = renderHook(() => useSegments(undefined), {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(result.current.fetchStatus).toBe('idle')
        })

        expect(mockListSegments).not.toHaveBeenCalled()
        expect(result.current.data).toBeUndefined()
    })

    it('should not fetch when enabled option is false', async () => {
        const { result } = renderHook(
            () => useSegments(123, undefined, { enabled: false }),
            { wrapper: createWrapper() },
        )

        await waitFor(() => {
            expect(result.current.fetchStatus).toBe('idle')
        })

        expect(mockListSegments).not.toHaveBeenCalled()
        expect(result.current.data).toBeUndefined()
    })

    it('should handle errors when fetching segments', async () => {
        const mockError = new Error('Failed to fetch segments')
        mockListSegments.mockRejectedValue(mockError)

        const { result } = renderHook(() => useSegments(123), {
            wrapper: createWrapper(),
        })

        await waitFor(() => expect(result.current.isError).toBe(true))

        expect(result.current.error).toEqual(mockError)
    })

    it('should refetch when integrationId changes', async () => {
        const mockData1 = {
            data: [{ id: '1', name: 'Segment A' }],
            metadata: { next_cursor: null, prev_cursor: null },
        }
        const mockData2 = {
            data: [{ id: '2', name: 'Segment B' }],
            metadata: { next_cursor: null, prev_cursor: null },
        }

        mockListSegments
            .mockResolvedValueOnce({ data: mockData1 })
            .mockResolvedValueOnce({ data: mockData2 })

        const { result, rerender } = renderHook(
            ({ integrationId }: { integrationId: number }) =>
                useSegments(integrationId),
            {
                wrapper: createWrapper(),
                initialProps: { integrationId: 123 },
            },
        )

        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(result.current.data).toEqual(mockData1)

        rerender({ integrationId: 456 })

        await waitFor(() => expect(result.current.data).toEqual(mockData2))

        expect(mockListSegments).toHaveBeenCalledTimes(2)
        expect(mockListSegments).toHaveBeenNthCalledWith(1, {
            integration_id: 123,
        })
        expect(mockListSegments).toHaveBeenNthCalledWith(2, {
            integration_id: 456,
        })
    })
})
