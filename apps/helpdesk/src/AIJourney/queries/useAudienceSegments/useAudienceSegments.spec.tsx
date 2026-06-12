import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { AudienceListSource } from '@gorgias/convert-client'
import {
    mockAudienceSchema,
    mockGetAudiencesSegmentsHandler,
    mockGetAudiencesSegmentsResponse,
} from '@gorgias/convert-mocks'

import { getGorgiasRevenueAddonApiBaseUrl } from 'rest_api/revenue_addon_api/client'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { useAudienceSegments } from './useAudienceSegments'

jest.mock('rest_api/revenue_addon_api/client', () => ({
    getGorgiasRevenueAddonApiBaseUrl: jest.fn(),
}))

const mockGetBaseUrl = getGorgiasRevenueAddonApiBaseUrl as jest.Mock
const server = setupServer()
let queryClient = mockQueryClient()

const createWrapper = () => {
    queryClient = mockQueryClient()

    return ({ children }: { children?: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}

const createSegmentsResponse = (ids: string[]) =>
    mockGetAudiencesSegmentsResponse({
        data: ids.map((id) =>
            mockAudienceSchema({
                id,
                name: `Segment ${id}`,
                source: AudienceListSource.Gorgias,
            }),
        ),
        links: null,
        permission_error: null,
    })

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    mockGetBaseUrl.mockReturnValue('http://mocked-base-url')
})

afterEach(() => {
    server.resetHandlers()
    queryClient.clear()
    jest.clearAllMocks()
})

afterAll(() => {
    server.close()
})

describe('useAudienceSegments', () => {
    it('should fetch audience segments successfully', async () => {
        const response = createSegmentsResponse(['1', '2'])
        const getAudiencesSegmentsMock = mockGetAudiencesSegmentsHandler(
            async () => HttpResponse.json(response),
        )
        const waitForGetAudiencesSegmentsRequest =
            getAudiencesSegmentsMock.waitForRequest(server)
        server.use(getAudiencesSegmentsMock.handler)

        const { result } = renderHook(() => useAudienceSegments(123), {
            wrapper: createWrapper(),
        })

        await waitForGetAudiencesSegmentsRequest((request) => {
            const url = new URL(request.url)

            expect(url.origin).toBe('http://mocked-base-url')
            expect(url.searchParams.get('store_integration_id')).toBe('123')
            expect(url.searchParams.has('source')).toBe(false)
            expect(url.searchParams.has('search')).toBe(false)
        })
        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.data).toEqual(response)
    })

    it('should fetch audience segments with source and search parameters', async () => {
        const getAudiencesSegmentsMock = mockGetAudiencesSegmentsHandler(
            async () => HttpResponse.json(createSegmentsResponse(['1'])),
        )
        const waitForGetAudiencesSegmentsRequest =
            getAudiencesSegmentsMock.waitForRequest(server)
        server.use(getAudiencesSegmentsMock.handler)

        const { result } = renderHook(
            () =>
                useAudienceSegments(
                    123,
                    AudienceListSource.Gorgias,
                    'High Value',
                ),
            { wrapper: createWrapper() },
        )

        await waitForGetAudiencesSegmentsRequest((request) => {
            const searchParams = new URL(request.url).searchParams

            expect(searchParams.get('store_integration_id')).toBe('123')
            expect(searchParams.get('source')).toBe(AudienceListSource.Gorgias)
            expect(searchParams.get('search')).toBe('High Value')
        })
        await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })

    it('should handle errors when fetching audience segments', async () => {
        server.use(
            mockGetAudiencesSegmentsHandler(async () =>
                HttpResponse.json(
                    { error: 'Failed to fetch audience segments' } as never,
                    { status: 500 },
                ),
            ).handler,
        )

        const { result } = renderHook(() => useAudienceSegments(123), {
            wrapper: createWrapper(),
        })

        await waitFor(() => expect(result.current.isError).toBe(true))

        expect(result.current.error).toBeDefined()
    })

    it('should not fetch audience segments if integrationId is undefined', async () => {
        const requests: Request[] = []
        server.use(
            mockGetAudiencesSegmentsHandler(async ({ request }) => {
                requests.push(request)

                return HttpResponse.json(createSegmentsResponse([]))
            }).handler,
        )

        const { result } = renderHook(() => useAudienceSegments(undefined), {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(result.current.fetchStatus).toBe('idle')
        })

        expect(requests).toHaveLength(0)
        expect(result.current.data).toBeUndefined()
    })

    it('should respect the enabled option when set to false', async () => {
        const requests: Request[] = []
        server.use(
            mockGetAudiencesSegmentsHandler(async ({ request }) => {
                requests.push(request)

                return HttpResponse.json(createSegmentsResponse([]))
            }).handler,
        )

        const { result } = renderHook(
            () =>
                useAudienceSegments(123, undefined, undefined, {
                    enabled: false,
                }),
            { wrapper: createWrapper() },
        )

        await waitFor(() => {
            expect(result.current.fetchStatus).toBe('idle')
        })

        expect(requests).toHaveLength(0)
        expect(result.current.data).toBeUndefined()
    })

    it('should refetch audience segments when parameters change', async () => {
        const firstResponse = createSegmentsResponse(['1'])
        const secondResponse = createSegmentsResponse(['2'])

        server.use(
            mockGetAudiencesSegmentsHandler(async ({ request }) => {
                const searchParams = new URL(request.url).searchParams
                const id =
                    searchParams.get('store_integration_id') === '456' ||
                    searchParams.get('source') === AudienceListSource.Klaviyo ||
                    searchParams.get('search') === 'Low'
                        ? '2'
                        : '1'

                return HttpResponse.json(
                    id === '2' ? secondResponse : firstResponse,
                )
            }).handler,
        )

        const { result, rerender } = renderHook(
            ({ integrationId, source, search }) =>
                useAudienceSegments(integrationId, source, search),
            {
                wrapper: createWrapper(),
                initialProps: {
                    integrationId: 123,
                    source: AudienceListSource.Gorgias as
                        | AudienceListSource
                        | undefined,
                    search: 'High',
                },
            },
        )

        await waitFor(() => expect(result.current.data).toEqual(firstResponse))

        rerender({
            integrationId: 456,
            source: AudienceListSource.Klaviyo,
            search: 'Low',
        })

        await waitFor(() => expect(result.current.data).toEqual(secondResponse))
    })

    it('should pass custom options to useQuery', async () => {
        const response = createSegmentsResponse(['1'])

        server.use(
            mockGetAudiencesSegmentsHandler(async () =>
                HttpResponse.json(response),
            ).handler,
        )
        const selectIds = jest.fn(
            (data: ReturnType<typeof createSegmentsResponse>) =>
                data.data.map((segment) => segment.id),
        )

        const { result } = renderHook(
            () =>
                useAudienceSegments(123, undefined, undefined, {
                    select: selectIds,
                }),
            {
                wrapper: createWrapper(),
            },
        )

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(selectIds).toHaveBeenCalledWith(response)
        expect(result.current.data).toEqual(['1'])
    })
})
