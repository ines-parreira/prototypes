import { renderHook } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'

import { getConditionsMetadata } from '@gorgias/customer-segmentation-client'

import { aiJourneyKeys } from '../utils'
import { useConditionsMetadata } from './useConditionsMetadata'

jest.mock('@gorgias/customer-segmentation-client', () => ({
    getConditionsMetadata: jest.fn(),
}))

const mockGetConditionsMetadata = getConditionsMetadata as jest.Mock

describe('useConditionsMetadata', () => {
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

    it('should fetch conditions metadata successfully', async () => {
        const mockData = {
            operators: { comparison: ['eq'], set: [], unary: [] },
            objects: {},
        }
        mockGetConditionsMetadata.mockResolvedValue({ data: mockData })

        const { result } = renderHook(() => useConditionsMetadata(), {
            wrapper: createWrapper(),
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(mockGetConditionsMetadata).toHaveBeenCalledTimes(1)
        expect(result.current.data).toEqual(mockData)
    })

    it('should handle errors when fetching conditions metadata', async () => {
        const mockError = new Error('Failed to fetch conditions metadata')
        mockGetConditionsMetadata.mockRejectedValue(mockError)

        const { result } = renderHook(() => useConditionsMetadata(), {
            wrapper: createWrapper(),
        })

        await waitFor(() => expect(result.current.isError).toBe(true))

        expect(result.current.error).toEqual(mockError)
    })

    it('should not fetch when enabled option is false', async () => {
        const { result } = renderHook(
            () => useConditionsMetadata({ enabled: false }),
            { wrapper: createWrapper() },
        )

        await waitFor(() => {
            expect(result.current.fetchStatus).toBe('idle')
        })

        expect(mockGetConditionsMetadata).not.toHaveBeenCalled()
        expect(result.current.data).toBeUndefined()
    })

    it('should use the correct query key', async () => {
        const mockData = {
            operators: { comparison: ['eq'], set: [], unary: [] },
            objects: {},
        }
        mockGetConditionsMetadata.mockResolvedValue({ data: mockData })

        const { result } = renderHook(() => useConditionsMetadata(), {
            wrapper: createWrapper(),
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        const cachedData = queryClient.getQueryData(
            aiJourneyKeys.conditionsMetadata(),
        )
        expect(cachedData).toEqual(mockData)
    })

    it('should have staleTime set to Infinity', async () => {
        mockGetConditionsMetadata.mockResolvedValue({ data: {} })

        renderHook(() => useConditionsMetadata(), {
            wrapper: createWrapper(),
        })

        const query = queryClient
            .getQueryCache()
            .find(aiJourneyKeys.conditionsMetadata() as unknown as string[])

        expect(query).toBeDefined()
        expect((query!.options as Record<string, unknown>).staleTime).toBe(
            Infinity,
        )
    })

    it('should support select option to transform data', async () => {
        const mockData = {
            operators: { comparison: ['eq'], set: [], unary: [] },
            objects: { shopper: { fields: {}, aggregates: {} } },
        }
        mockGetConditionsMetadata.mockResolvedValue({ data: mockData })

        const { result } = renderHook(
            () =>
                useConditionsMetadata({
                    select: (data) => Object.keys(data.objects),
                }),
            { wrapper: createWrapper() },
        )

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.data).toEqual(['shopper'])
    })
})
