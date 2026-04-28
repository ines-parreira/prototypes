import { renderHook } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'

import { AudienceListSource, getAudiencesUsage } from '@gorgias/convert-client'
import type { AudienceUsageResponse } from '@gorgias/convert-client'

import { useAudiencesUsage } from './useAudiencesUsage'

jest.mock('@gorgias/convert-client', () => ({
    ...jest.requireActual('@gorgias/convert-client'),
    getAudiencesUsage: jest.fn(),
}))

const mockGetAudiencesUsage = getAudiencesUsage as jest.Mock

const mockAudienceUsageResponse: AudienceUsageResponse = {
    data: [
        {
            id: 'audience-1',
            identifier: 'segment-abc',
            source: AudienceListSource.Gorgias,
            count_campaigns: 1,
            count_journeys: 2,
            usage: [
                { id: 'journey-1', name: 'Cart Flow', type: 'cart_abandoned' },
            ],
        },
    ],
}

describe('useAudiencesUsage', () => {
    let queryClient: QueryClient

    const createWrapper = () => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
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

    it('should fetch audience usage successfully', async () => {
        mockGetAudiencesUsage.mockResolvedValue({
            data: mockAudienceUsageResponse,
        })

        const { result } = renderHook(() => useAudiencesUsage(123), {
            wrapper: createWrapper(),
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(mockGetAudiencesUsage).toHaveBeenCalledTimes(1)
        expect(mockGetAudiencesUsage).toHaveBeenCalledWith({
            store_integration_id: 123,
        })
        expect(result.current.data).toEqual(mockAudienceUsageResponse)
    })

    it('should include extra params in the request', async () => {
        mockGetAudiencesUsage.mockResolvedValue({
            data: mockAudienceUsageResponse,
        })

        const { result } = renderHook(
            () =>
                useAudiencesUsage(123, { source: AudienceListSource.Gorgias }),
            { wrapper: createWrapper() },
        )

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(mockGetAudiencesUsage).toHaveBeenCalledWith({
            store_integration_id: 123,
            source: AudienceListSource.Gorgias,
        })
    })

    it('should handle errors when fetching audience usage', async () => {
        const mockError = new Error('Failed to fetch audience usage')
        mockGetAudiencesUsage.mockRejectedValue(mockError)

        const { result } = renderHook(() => useAudiencesUsage(123), {
            wrapper: createWrapper(),
        })

        await waitFor(() => expect(result.current.isError).toBe(true))

        expect(result.current.error).toEqual(mockError)
    })

    it('should not fetch when integrationId is undefined', async () => {
        const { result } = renderHook(() => useAudiencesUsage(undefined), {
            wrapper: createWrapper(),
        })

        await waitFor(() => expect(result.current.fetchStatus).toBe('idle'))

        expect(mockGetAudiencesUsage).not.toHaveBeenCalled()
        expect(result.current.data).toBeUndefined()
    })

    it('should not fetch when options.enabled is false', async () => {
        const { result } = renderHook(
            () => useAudiencesUsage(123, undefined, { enabled: false }),
            { wrapper: createWrapper() },
        )

        await waitFor(() => expect(result.current.fetchStatus).toBe('idle'))

        expect(mockGetAudiencesUsage).not.toHaveBeenCalled()
        expect(result.current.data).toBeUndefined()
    })

    it('should refetch when integrationId changes', async () => {
        const response1 = {
            data: [{ ...mockAudienceUsageResponse.data[0], id: 'a1' }],
        }
        const response2 = {
            data: [{ ...mockAudienceUsageResponse.data[0], id: 'a2' }],
        }

        mockGetAudiencesUsage
            .mockResolvedValueOnce({ data: response1 })
            .mockResolvedValueOnce({ data: response2 })

        const { result, rerender } = renderHook(
            ({ integrationId }: { integrationId: number }) =>
                useAudiencesUsage(integrationId),
            {
                wrapper: createWrapper(),
                initialProps: { integrationId: 123 },
            },
        )

        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(result.current.data).toEqual(response1)

        rerender({ integrationId: 456 })

        await waitFor(() => expect(result.current.data).toEqual(response2))

        expect(mockGetAudiencesUsage).toHaveBeenCalledTimes(2)
        expect(mockGetAudiencesUsage).toHaveBeenNthCalledWith(1, {
            store_integration_id: 123,
        })
        expect(mockGetAudiencesUsage).toHaveBeenNthCalledWith(2, {
            store_integration_id: 456,
        })
    })

    it('should apply a custom select option', async () => {
        mockGetAudiencesUsage.mockResolvedValue({
            data: mockAudienceUsageResponse,
        })

        const selectIds = jest.fn((data: typeof mockAudienceUsageResponse) =>
            data.data.map((entry) => entry.id),
        )

        const { result } = renderHook(
            () => useAudiencesUsage(123, undefined, { select: selectIds }),
            { wrapper: createWrapper() },
        )

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(selectIds).toHaveBeenCalledWith(mockAudienceUsageResponse)
        expect(result.current.data).toEqual(['audience-1'])
    })
})
