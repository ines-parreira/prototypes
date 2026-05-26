import { renderHook } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockAudienceSchema,
    mockGetAudiencesListsHandler,
    mockGetAudiencesListsResponse,
} from '@gorgias/convert-mocks'

import { getGorgiasRevenueAddonApiBaseUrl } from 'rest_api/revenue_addon_api/client'

import { useAudienceLists } from './useAudienceLists'

jest.mock('rest_api/revenue_addon_api/client', () => ({
    getGorgiasRevenueAddonApiBaseUrl: jest.fn(),
}))

const mockGetGorgiasRevenueAddonApiBaseUrl =
    getGorgiasRevenueAddonApiBaseUrl as jest.Mock

const server = setupServer()

const createAudiencesResponse = (
    data: ReturnType<typeof mockAudienceSchema>[],
) =>
    mockGetAudiencesListsResponse({
        data,
        links: null,
        permission_error: null,
    })

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

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
            logger: { log: () => {}, warn: () => {}, error: () => {} },
        })

        return ({ children }: { children?: React.ReactNode }) => (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        )
    }

    it('should fetch audience lists successfully', async () => {
        const mockAudienceLists = [
            mockAudienceSchema({ id: '1', name: 'VIP Customers' }),
            mockAudienceSchema({
                id: '2',
                name: 'Newsletter Subscribers',
            }),
        ]
        const mockResponse = createAudiencesResponse(mockAudienceLists)
        const getAudiencesListsMock = mockGetAudiencesListsHandler(async () =>
            HttpResponse.json(mockResponse),
        )
        const waitForGetAudiencesListsRequest =
            getAudiencesListsMock.waitForRequest(server)

        server.use(getAudiencesListsMock.handler)

        const { result } = renderHook(() => useAudienceLists(123), {
            wrapper: createWrapper(),
        })

        await waitForGetAudiencesListsRequest((request) => {
            const url = new URL(request.url)

            expect(url.origin).toBe('http://mocked-base-url')
            expect(url.searchParams.get('store_integration_id')).toBe('123')
            expect(url.searchParams.has('search')).toBe(false)
        })
        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.data).toEqual(mockResponse)
    })

    it('should fetch audience lists with search parameter', async () => {
        const mockAudienceLists = [
            mockAudienceSchema({ id: '1', name: 'VIP Customers' }),
        ]
        const mockResponse = createAudiencesResponse(mockAudienceLists)
        const getAudiencesListsMock = mockGetAudiencesListsHandler(async () =>
            HttpResponse.json(mockResponse),
        )
        const waitForGetAudiencesListsRequest =
            getAudiencesListsMock.waitForRequest(server)

        server.use(getAudiencesListsMock.handler)

        const { result } = renderHook(() => useAudienceLists(123, 'VIP'), {
            wrapper: createWrapper(),
        })

        await waitForGetAudiencesListsRequest((request) => {
            const url = new URL(request.url)

            expect(url.searchParams.get('store_integration_id')).toBe('123')
            expect(url.searchParams.get('search')).toBe('VIP')
        })
        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.data).toEqual(mockResponse)
    })

    it('should handle errors when fetching audience lists', async () => {
        const getAudiencesListsMock = mockGetAudiencesListsHandler(async () =>
            HttpResponse.json(createAudiencesResponse([]), { status: 500 }),
        )
        const waitForGetAudiencesListsRequest =
            getAudiencesListsMock.waitForRequest(server)
        server.use(getAudiencesListsMock.handler)

        const { result } = renderHook(() => useAudienceLists(123), {
            wrapper: createWrapper(),
        })

        await waitForGetAudiencesListsRequest()
        await waitFor(() => expect(result.current.isError).toBe(true))

        expect(result.current.error).toBeDefined()
    })

    it('should not fetch audience lists if integrationId is undefined', async () => {
        const requests: Request[] = []
        const getAudiencesListsMock = mockGetAudiencesListsHandler(
            async ({ request }) => {
                requests.push(request)

                return HttpResponse.json(createAudiencesResponse([]))
            },
        )
        server.use(getAudiencesListsMock.handler)

        const { result } = renderHook(() => useAudienceLists(undefined), {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(result.current.fetchStatus).toBe('idle')
        })

        expect(result.current.data).toBeUndefined()
        expect(requests).toHaveLength(0)
    })

    it('should respect the enabled option when set to false', async () => {
        const requests: Request[] = []
        const getAudiencesListsMock = mockGetAudiencesListsHandler(
            async ({ request }) => {
                requests.push(request)

                return HttpResponse.json(createAudiencesResponse([]))
            },
        )
        server.use(getAudiencesListsMock.handler)

        const { result } = renderHook(
            () => useAudienceLists(123, undefined, { enabled: false }),
            { wrapper: createWrapper() },
        )

        await waitFor(() => {
            expect(result.current.fetchStatus).toBe('idle')
        })

        expect(result.current.data).toBeUndefined()
        expect(requests).toHaveLength(0)
    })

    it('should refetch audience lists when integrationId changes', async () => {
        const mockAudienceLists1 = [
            mockAudienceSchema({ id: '1', name: 'List 1' }),
        ]
        const mockAudienceLists2 = [
            mockAudienceSchema({ id: '2', name: 'List 2' }),
        ]
        const requests: Request[] = []
        const getAudiencesListsMock = mockGetAudiencesListsHandler(
            async ({ request }) => {
                requests.push(request)
                const integrationId = new URL(request.url).searchParams.get(
                    'store_integration_id',
                )
                const responseData =
                    integrationId === '123'
                        ? mockAudienceLists1
                        : mockAudienceLists2

                return HttpResponse.json(createAudiencesResponse(responseData))
            },
        )
        server.use(getAudiencesListsMock.handler)

        const { result, rerender } = renderHook(
            ({ integrationId }) => useAudienceLists(integrationId),
            {
                wrapper: createWrapper(),
                initialProps: { integrationId: 123 },
            },
        )

        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(result.current.data?.data).toEqual(mockAudienceLists1)

        rerender({ integrationId: 456 })

        await waitFor(() =>
            expect(result.current.data?.data).toEqual(mockAudienceLists2),
        )

        expect(
            requests.map((request) =>
                new URL(request.url).searchParams.get('store_integration_id'),
            ),
        ).toEqual(['123', '456'])
    })

    it('should refetch audience lists when search parameter changes', async () => {
        const mockAudienceLists1 = [
            mockAudienceSchema({ id: '1', name: 'VIP Customers' }),
            mockAudienceSchema({ id: '2', name: 'VIP Members' }),
        ]
        const mockAudienceLists2 = [
            mockAudienceSchema({
                id: '3',
                name: 'Newsletter Subscribers',
            }),
        ]
        const requests: Request[] = []
        const getAudiencesListsMock = mockGetAudiencesListsHandler(
            async ({ request }) => {
                requests.push(request)
                const search = new URL(request.url).searchParams.get('search')
                const responseData =
                    search === 'VIP' ? mockAudienceLists1 : mockAudienceLists2

                return HttpResponse.json(createAudiencesResponse(responseData))
            },
        )
        server.use(getAudiencesListsMock.handler)

        const { result, rerender } = renderHook(
            ({ search }) => useAudienceLists(123, search),
            {
                wrapper: createWrapper(),
                initialProps: { search: 'VIP' },
            },
        )

        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(result.current.data?.data).toEqual(mockAudienceLists1)

        rerender({ search: 'Newsletter' })

        await waitFor(() =>
            expect(result.current.data?.data).toEqual(mockAudienceLists2),
        )

        expect(
            requests.map((request) =>
                new URL(request.url).searchParams.get('search'),
            ),
        ).toEqual(['VIP', 'Newsletter'])
    })

    it('should pass custom options to useQuery', async () => {
        const mockAudienceLists = [
            mockAudienceSchema({ id: '1', name: 'Test List' }),
        ]
        const mockSelect = jest.fn((data) =>
            data.data.map((list: { id: string }) => list.id),
        )
        const mockResponse = createAudiencesResponse(mockAudienceLists)
        const getAudiencesListsMock = mockGetAudiencesListsHandler(async () =>
            HttpResponse.json(mockResponse),
        )

        server.use(getAudiencesListsMock.handler)

        const { result } = renderHook(
            () => useAudienceLists(123, undefined, { select: mockSelect }),
            {
                wrapper: createWrapper(),
            },
        )

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(mockSelect).toHaveBeenCalledWith(mockResponse)
        expect(result.current.data).toEqual(['1'])
    })
})
