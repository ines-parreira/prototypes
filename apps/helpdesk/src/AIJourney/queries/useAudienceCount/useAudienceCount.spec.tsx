import { renderHook } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'

import { getAudienceCount } from '@gorgias/customer-segmentation-client'

import { aiJourneyKeys } from '../utils'
import { useAudienceCount } from './useAudienceCount'

jest.mock('@gorgias/customer-segmentation-client', () => ({
    getAudienceCount: jest.fn(),
}))

const mockGetAudienceCount = getAudienceCount as jest.Mock

describe('useAudienceCount', () => {
    let queryClient: QueryClient

    const createWrapper = () => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
            },
            logger: {
                log: () => {},
                warn: () => {},
                error: () => {},
            },
        })

        return ({ children }: { children?: React.ReactNode }) => (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        )
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should fetch audience count successfully with no params', async () => {
        mockGetAudienceCount.mockResolvedValue({ data: { count: 42 } })

        const { result } = renderHook(() => useAudienceCount(), {
            wrapper: createWrapper(),
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(mockGetAudienceCount).toHaveBeenCalledTimes(1)
        expect(mockGetAudienceCount).toHaveBeenCalledWith({})
        expect(result.current.data).toEqual({ count: 42 })
    })

    it('should fetch audience count with integration_id param', async () => {
        mockGetAudienceCount.mockResolvedValue({ data: { count: 100 } })

        const params = { integration_id: 123 }
        const { result } = renderHook(() => useAudienceCount(params), {
            wrapper: createWrapper(),
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(mockGetAudienceCount).toHaveBeenCalledWith(params)
        expect(result.current.data).toEqual({ count: 100 })
    })

    it('should fetch audience count with include_segments and exclude_segments', async () => {
        mockGetAudienceCount.mockResolvedValue({ data: { count: 55 } })

        const params = {
            integration_id: 123,
            include_segments: ['seg-1', 'seg-2'],
            exclude_segments: ['seg-3'],
        }
        const { result } = renderHook(() => useAudienceCount(params), {
            wrapper: createWrapper(),
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(mockGetAudienceCount).toHaveBeenCalledWith(params)
        expect(result.current.data).toEqual({ count: 55 })
    })

    it('should fetch audience count with conditions param', async () => {
        mockGetAudienceCount.mockResolvedValue({ data: { count: 20 } })

        const params = {
            integration_id: 123,
            conditions: 'gt(shopper.lifetime_value, 1000)',
        }
        const { result } = renderHook(() => useAudienceCount(params), {
            wrapper: createWrapper(),
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(mockGetAudienceCount).toHaveBeenCalledWith(params)
        expect(result.current.data).toEqual({ count: 20 })
    })

    it('should handle errors when fetching audience count', async () => {
        const mockError = new Error('Failed to fetch audience count')
        mockGetAudienceCount.mockRejectedValue(mockError)

        const { result } = renderHook(() => useAudienceCount(), {
            wrapper: createWrapper(),
        })

        await waitFor(() => expect(result.current.isError).toBe(true))

        expect(result.current.error).toEqual(mockError)
    })

    it('should not fetch when enabled option is false', async () => {
        const { result } = renderHook(
            () => useAudienceCount({}, { enabled: false }),
            { wrapper: createWrapper() },
        )

        await waitFor(() => {
            expect(result.current.fetchStatus).toBe('idle')
        })

        expect(mockGetAudienceCount).not.toHaveBeenCalled()
        expect(result.current.data).toBeUndefined()
    })

    it('should use the correct query key', async () => {
        const params = { integration_id: 123 }
        mockGetAudienceCount.mockResolvedValue({ data: { count: 10 } })

        const { result } = renderHook(() => useAudienceCount(params), {
            wrapper: createWrapper(),
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        const cachedData = queryClient.getQueryData(
            aiJourneyKeys.audienceCount(params),
        )
        expect(cachedData).toEqual({ count: 10 })
    })

    it('should support select option to transform data', async () => {
        mockGetAudienceCount.mockResolvedValue({ data: { count: 77 } })

        const { result } = renderHook(
            () => useAudienceCount({}, { select: (data) => data.count }),
            { wrapper: createWrapper() },
        )

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.data).toBe(77)
    })

    it('should refetch when params change', async () => {
        mockGetAudienceCount
            .mockResolvedValueOnce({ data: { count: 10 } })
            .mockResolvedValueOnce({ data: { count: 20 } })

        const { result, rerender } = renderHook(
            ({ params }) => useAudienceCount(params),
            {
                wrapper: createWrapper(),
                initialProps: { params: { integration_id: 1 } },
            },
        )

        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(result.current.data).toEqual({ count: 10 })

        rerender({ params: { integration_id: 2 } })

        await waitFor(() => expect(result.current.data).toEqual({ count: 20 }))
        expect(mockGetAudienceCount).toHaveBeenCalledTimes(2)
    })

    it('should not refetch on window focus', async () => {
        mockGetAudienceCount.mockResolvedValue({ data: { count: 10 } })

        renderHook(() => useAudienceCount(), { wrapper: createWrapper() })

        const query = queryClient
            .getQueryCache()
            .find(aiJourneyKeys.audienceCount({}) as unknown as string[])

        expect(
            (query!.options as Record<string, unknown>).refetchOnWindowFocus,
        ).toBe(false)
    })
})
