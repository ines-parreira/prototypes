import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'

import { getAudiencesSegments } from '@gorgias/convert-client'

import { getGorgiasRevenueAddonApiBaseUrl } from 'rest_api/revenue_addon_api/client'

import { useAudienceSegments } from './useAudienceSegments'

jest.mock('@gorgias/convert-client', () => ({
    ...jest.requireActual('@gorgias/convert-client'),
    getAudiencesSegments: jest.fn(),
}))

jest.mock('rest_api/revenue_addon_api/client', () => ({
    getGorgiasRevenueAddonApiBaseUrl: jest.fn(),
}))

const mockGetAudiencesSegments = getAudiencesSegments as jest.Mock
const mockGetGorgiasRevenueAddonApiBaseUrl =
    getGorgiasRevenueAddonApiBaseUrl as jest.Mock

describe('useAudienceSegments', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockGetGorgiasRevenueAddonApiBaseUrl.mockReturnValue(
            'http://mocked-base-url',
        )
    })

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

    it('should fetch audience segments successfully', async () => {
        const mockAudienceSegments = [
            { id: '1', name: 'High Value Customers' },
            { id: '2', name: 'Frequent Buyers' },
        ]

        mockGetAudiencesSegments.mockResolvedValue({
            data: mockAudienceSegments,
        })

        const { result } = renderHook(() => useAudienceSegments(123), {
            wrapper: createWrapper(),
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(mockGetAudiencesSegments).toHaveBeenCalledTimes(1)
        expect(mockGetAudiencesSegments).toHaveBeenCalledWith(
            {
                store_integration_id: 123,
                search: undefined,
            },
            {
                baseURL: 'http://mocked-base-url',
            },
        )
        expect(result.current.data).toEqual(mockAudienceSegments)
    })

    it('should fetch audience segments with search parameter', async () => {
        const mockAudienceSegments = [{ id: '1', name: 'High Value Customers' }]

        mockGetAudiencesSegments.mockResolvedValue({
            data: mockAudienceSegments,
        })

        const { result } = renderHook(() => useAudienceSegments(123, 'High'), {
            wrapper: createWrapper(),
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(mockGetAudiencesSegments).toHaveBeenCalledTimes(1)
        expect(mockGetAudiencesSegments).toHaveBeenCalledWith(
            {
                store_integration_id: 123,
                search: 'High',
            },
            {
                baseURL: 'http://mocked-base-url',
            },
        )
        expect(result.current.data).toEqual(mockAudienceSegments)
    })

    it('should handle errors when fetching audience segments', async () => {
        const mockError = new Error('Failed to fetch audience segments')

        mockGetAudiencesSegments.mockRejectedValue(mockError)

        const { result } = renderHook(() => useAudienceSegments(123), {
            wrapper: createWrapper(),
        })

        await waitFor(() => expect(result.current.isError).toBe(true))

        expect(mockGetAudiencesSegments).toHaveBeenCalledTimes(1)
        expect(result.current.error).toEqual(mockError)
    })

    it('should not fetch audience segments if integrationId is undefined', async () => {
        const { result } = renderHook(() => useAudienceSegments(undefined), {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(result.current.fetchStatus).toBe('idle')
        })

        expect(mockGetAudiencesSegments).not.toHaveBeenCalled()
        expect(result.current.data).toBeUndefined()
    })

    it('should respect the enabled option when set to false', async () => {
        const { result } = renderHook(
            () => useAudienceSegments(123, undefined, { enabled: false }),
            { wrapper: createWrapper() },
        )

        await waitFor(() => {
            expect(result.current.fetchStatus).toBe('idle')
        })

        expect(mockGetAudiencesSegments).not.toHaveBeenCalled()
        expect(result.current.data).toBeUndefined()
    })

    it('should refetch audience segments when integrationId changes', async () => {
        const mockAudienceSegments1 = [{ id: '1', name: 'Segment 1' }]
        const mockAudienceSegments2 = [{ id: '2', name: 'Segment 2' }]

        mockGetAudiencesSegments
            .mockResolvedValueOnce({ data: mockAudienceSegments1 })
            .mockResolvedValueOnce({ data: mockAudienceSegments2 })

        const { result, rerender } = renderHook(
            ({ integrationId }) => useAudienceSegments(integrationId),
            {
                wrapper: createWrapper(),
                initialProps: { integrationId: 123 },
            },
        )

        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(result.current.data).toEqual(mockAudienceSegments1)

        rerender({ integrationId: 456 })

        await waitFor(() =>
            expect(result.current.data).toEqual(mockAudienceSegments2),
        )

        expect(mockGetAudiencesSegments).toHaveBeenCalledTimes(2)
        expect(mockGetAudiencesSegments).toHaveBeenNthCalledWith(
            1,
            {
                store_integration_id: 123,
                search: undefined,
            },
            expect.any(Object),
        )
        expect(mockGetAudiencesSegments).toHaveBeenNthCalledWith(
            2,
            {
                store_integration_id: 456,
                search: undefined,
            },
            expect.any(Object),
        )
    })

    it('should refetch audience segments when search parameter changes', async () => {
        const mockAudienceSegments1 = [
            { id: '1', name: 'High Value Customers' },
            { id: '2', name: 'High Frequency Buyers' },
        ]
        const mockAudienceSegments2 = [{ id: '3', name: 'Low Value Customers' }]

        mockGetAudiencesSegments
            .mockResolvedValueOnce({ data: mockAudienceSegments1 })
            .mockResolvedValueOnce({ data: mockAudienceSegments2 })

        const { result, rerender } = renderHook(
            ({ search }) => useAudienceSegments(123, search),
            {
                wrapper: createWrapper(),
                initialProps: { search: 'High' },
            },
        )

        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(result.current.data).toEqual(mockAudienceSegments1)

        rerender({ search: 'Low' })

        await waitFor(() =>
            expect(result.current.data).toEqual(mockAudienceSegments2),
        )

        expect(mockGetAudiencesSegments).toHaveBeenCalledTimes(2)
        expect(mockGetAudiencesSegments).toHaveBeenNthCalledWith(
            1,
            {
                store_integration_id: 123,
                search: 'High',
            },
            expect.any(Object),
        )
        expect(mockGetAudiencesSegments).toHaveBeenNthCalledWith(
            2,
            {
                store_integration_id: 123,
                search: 'Low',
            },
            expect.any(Object),
        )
    })

    it('should pass custom options to useQuery', async () => {
        const mockAudienceSegments = [{ id: '1', name: 'Test Segment' }]
        const mockSelect = jest.fn((data) =>
            data.map((segment: any) => segment.id),
        )

        mockGetAudiencesSegments.mockResolvedValue({
            data: mockAudienceSegments,
        })

        const { result } = renderHook(
            () => useAudienceSegments(123, undefined, { select: mockSelect }),
            {
                wrapper: createWrapper(),
            },
        )

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(mockSelect).toHaveBeenCalledWith(mockAudienceSegments)
        expect(result.current.data).toEqual(['1'])
    })
})
