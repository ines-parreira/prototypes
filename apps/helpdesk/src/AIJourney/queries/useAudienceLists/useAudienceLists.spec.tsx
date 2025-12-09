import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'

import { getAudiencesLists } from '@gorgias/convert-client'

import { getGorgiasRevenueAddonApiBaseUrl } from 'rest_api/revenue_addon_api/client'

import { useAudienceLists } from './useAudienceLists'

jest.mock('@gorgias/convert-client', () => ({
    ...jest.requireActual('@gorgias/convert-client'),
    getAudiencesLists: jest.fn(),
}))

jest.mock('rest_api/revenue_addon_api/client', () => ({
    getGorgiasRevenueAddonApiBaseUrl: jest.fn(),
}))

const mockGetAudiencesLists = getAudiencesLists as jest.Mock
const mockGetGorgiasRevenueAddonApiBaseUrl =
    getGorgiasRevenueAddonApiBaseUrl as jest.Mock

describe('useAudienceLists', () => {
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

    it('should fetch audience lists successfully', async () => {
        const mockAudienceLists = [
            { id: '1', name: 'VIP Customers' },
            { id: '2', name: 'Newsletter Subscribers' },
        ]

        mockGetAudiencesLists.mockResolvedValue({ data: mockAudienceLists })

        const { result } = renderHook(() => useAudienceLists(123), {
            wrapper: createWrapper(),
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(mockGetAudiencesLists).toHaveBeenCalledTimes(1)
        expect(mockGetAudiencesLists).toHaveBeenCalledWith(
            {
                store_integration_id: 123,
                search: undefined,
            },
            {
                baseURL: 'http://mocked-base-url',
            },
        )
        expect(result.current.data).toEqual(mockAudienceLists)
    })

    it('should fetch audience lists with search parameter', async () => {
        const mockAudienceLists = [{ id: '1', name: 'VIP Customers' }]

        mockGetAudiencesLists.mockResolvedValue({ data: mockAudienceLists })

        const { result } = renderHook(() => useAudienceLists(123, 'VIP'), {
            wrapper: createWrapper(),
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(mockGetAudiencesLists).toHaveBeenCalledTimes(1)
        expect(mockGetAudiencesLists).toHaveBeenCalledWith(
            {
                store_integration_id: 123,
                search: 'VIP',
            },
            {
                baseURL: 'http://mocked-base-url',
            },
        )
        expect(result.current.data).toEqual(mockAudienceLists)
    })

    it('should handle errors when fetching audience lists', async () => {
        const mockError = new Error('Failed to fetch audience lists')

        mockGetAudiencesLists.mockRejectedValue(mockError)

        const { result } = renderHook(() => useAudienceLists(123), {
            wrapper: createWrapper(),
        })

        await waitFor(() => expect(result.current.isError).toBe(true))

        expect(mockGetAudiencesLists).toHaveBeenCalledTimes(1)
        expect(result.current.error).toEqual(mockError)
    })

    it('should not fetch audience lists if integrationId is undefined', async () => {
        const { result } = renderHook(() => useAudienceLists(undefined), {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(result.current.fetchStatus).toBe('idle')
        })

        expect(mockGetAudiencesLists).not.toHaveBeenCalled()
        expect(result.current.data).toBeUndefined()
    })

    it('should respect the enabled option when set to false', async () => {
        const { result } = renderHook(
            () => useAudienceLists(123, undefined, { enabled: false }),
            { wrapper: createWrapper() },
        )

        await waitFor(() => {
            expect(result.current.fetchStatus).toBe('idle')
        })

        expect(mockGetAudiencesLists).not.toHaveBeenCalled()
        expect(result.current.data).toBeUndefined()
    })

    it('should refetch audience lists when integrationId changes', async () => {
        const mockAudienceLists1 = [{ id: '1', name: 'List 1' }]
        const mockAudienceLists2 = [{ id: '2', name: 'List 2' }]

        mockGetAudiencesLists
            .mockResolvedValueOnce({ data: mockAudienceLists1 })
            .mockResolvedValueOnce({ data: mockAudienceLists2 })

        const { result, rerender } = renderHook(
            ({ integrationId }) => useAudienceLists(integrationId),
            {
                wrapper: createWrapper(),
                initialProps: { integrationId: 123 },
            },
        )

        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(result.current.data).toEqual(mockAudienceLists1)

        rerender({ integrationId: 456 })

        await waitFor(() =>
            expect(result.current.data).toEqual(mockAudienceLists2),
        )

        expect(mockGetAudiencesLists).toHaveBeenCalledTimes(2)
        expect(mockGetAudiencesLists).toHaveBeenNthCalledWith(
            1,
            {
                store_integration_id: 123,
                search: undefined,
            },
            expect.any(Object),
        )
        expect(mockGetAudiencesLists).toHaveBeenNthCalledWith(
            2,
            {
                store_integration_id: 456,
                search: undefined,
            },
            expect.any(Object),
        )
    })

    it('should refetch audience lists when search parameter changes', async () => {
        const mockAudienceLists1 = [
            { id: '1', name: 'VIP Customers' },
            { id: '2', name: 'VIP Members' },
        ]
        const mockAudienceLists2 = [{ id: '3', name: 'Newsletter Subscribers' }]

        mockGetAudiencesLists
            .mockResolvedValueOnce({ data: mockAudienceLists1 })
            .mockResolvedValueOnce({ data: mockAudienceLists2 })

        const { result, rerender } = renderHook(
            ({ search }) => useAudienceLists(123, search),
            {
                wrapper: createWrapper(),
                initialProps: { search: 'VIP' },
            },
        )

        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(result.current.data).toEqual(mockAudienceLists1)

        rerender({ search: 'Newsletter' })

        await waitFor(() =>
            expect(result.current.data).toEqual(mockAudienceLists2),
        )

        expect(mockGetAudiencesLists).toHaveBeenCalledTimes(2)
        expect(mockGetAudiencesLists).toHaveBeenNthCalledWith(
            1,
            {
                store_integration_id: 123,
                search: 'VIP',
            },
            expect.any(Object),
        )
        expect(mockGetAudiencesLists).toHaveBeenNthCalledWith(
            2,
            {
                store_integration_id: 123,
                search: 'Newsletter',
            },
            expect.any(Object),
        )
    })

    it('should pass custom options to useQuery', async () => {
        const mockAudienceLists = [{ id: '1', name: 'Test List' }]
        const mockSelect = jest.fn((data) => data.map((list: any) => list.id))

        mockGetAudiencesLists.mockResolvedValue({ data: mockAudienceLists })

        const { result } = renderHook(
            () => useAudienceLists(123, undefined, { select: mockSelect }),
            {
                wrapper: createWrapper(),
            },
        )

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(mockSelect).toHaveBeenCalledWith(mockAudienceLists)
        expect(result.current.data).toEqual(['1'])
    })
})
