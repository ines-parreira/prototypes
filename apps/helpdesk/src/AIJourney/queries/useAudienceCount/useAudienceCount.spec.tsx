import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockGetAudienceCountHandler,
    mockGetAudienceCountResponse,
} from '@gorgias/customer-segmentation-mocks'

import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { aiJourneyKeys } from '../utils'
import { useAudienceCount } from './useAudienceCount'

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

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
    queryClient.clear()
})

afterAll(() => {
    server.close()
})

describe('useAudienceCount', () => {
    it('should fetch audience count successfully with no params', async () => {
        const response = mockGetAudienceCountResponse({ count: 42 })
        const getAudienceCountMock = mockGetAudienceCountHandler(async () =>
            HttpResponse.json(response),
        )
        const waitForGetAudienceCountRequest =
            getAudienceCountMock.waitForRequest(server)
        server.use(getAudienceCountMock.handler)

        const { result } = renderHook(() => useAudienceCount(), {
            wrapper: createWrapper(),
        })

        await waitForGetAudienceCountRequest((request) => {
            expect(new URL(request.url).search).toBe('')
        })
        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.data).toEqual(response)
    })

    it('should fetch audience count with request params', async () => {
        const response = mockGetAudienceCountResponse({ count: 55 })
        const getAudienceCountMock = mockGetAudienceCountHandler(async () =>
            HttpResponse.json(response),
        )
        const waitForGetAudienceCountRequest =
            getAudienceCountMock.waitForRequest(server)
        server.use(getAudienceCountMock.handler)

        const params = {
            integration_id: 123,
            include_segments: ['seg-1', 'seg-2'],
            exclude_segments: ['seg-3'],
            conditions: 'gt(shopper.lifetime_value, 1000)',
        }

        const { result } = renderHook(() => useAudienceCount(params), {
            wrapper: createWrapper(),
        })

        await waitForGetAudienceCountRequest((request) => {
            const searchParams = new URL(request.url).searchParams

            expect(searchParams.get('integration_id')).toBe('123')
            expect(searchParams.getAll('include_segments')).toEqual([
                'seg-1',
                'seg-2',
            ])
            expect(searchParams.getAll('exclude_segments')).toEqual(['seg-3'])
            expect(searchParams.get('conditions')).toBe(
                'gt(shopper.lifetime_value, 1000)',
            )
        })
        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.data).toEqual(response)
    })

    it('should handle errors when fetching audience count', async () => {
        const getAudienceCountMock = mockGetAudienceCountHandler(async () =>
            HttpResponse.json(
                { error: 'Failed to fetch audience count' } as never,
                {
                    status: 500,
                },
            ),
        )
        server.use(getAudienceCountMock.handler)

        const { result } = renderHook(() => useAudienceCount(), {
            wrapper: createWrapper(),
        })

        await waitFor(() => expect(result.current.isError).toBe(true))

        expect(result.current.error).toBeDefined()
    })

    it('should not fetch when enabled option is false', async () => {
        const requests: Request[] = []
        const getAudienceCountMock = mockGetAudienceCountHandler(
            async ({ request }) => {
                requests.push(request)

                return HttpResponse.json(mockGetAudienceCountResponse())
            },
        )
        server.use(getAudienceCountMock.handler)

        const { result } = renderHook(
            () => useAudienceCount({}, { enabled: false }),
            { wrapper: createWrapper() },
        )

        await waitFor(() => {
            expect(result.current.fetchStatus).toBe('idle')
        })

        expect(requests).toHaveLength(0)
        expect(result.current.data).toBeUndefined()
    })

    it('should use the correct query key', async () => {
        const params = { integration_id: 123 }
        const response = mockGetAudienceCountResponse({ count: 10 })
        server.use(
            mockGetAudienceCountHandler(async () => HttpResponse.json(response))
                .handler,
        )

        const { result } = renderHook(() => useAudienceCount(params), {
            wrapper: createWrapper(),
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(
            queryClient.getQueryData(aiJourneyKeys.audienceCount(params)),
        ).toEqual(response)
    })

    it('should support select option to transform data', async () => {
        server.use(
            mockGetAudienceCountHandler(async () =>
                HttpResponse.json(mockGetAudienceCountResponse({ count: 77 })),
            ).handler,
        )

        const { result } = renderHook(
            () => useAudienceCount({}, { select: (data) => data.count }),
            { wrapper: createWrapper() },
        )

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.data).toBe(77)
    })

    it('should refetch when params change', async () => {
        const getAudienceCountMock = mockGetAudienceCountHandler(
            async ({ request }) => {
                const integrationId = new URL(request.url).searchParams.get(
                    'integration_id',
                )

                return HttpResponse.json(
                    mockGetAudienceCountResponse({
                        count: integrationId === '1' ? 10 : 20,
                    }),
                )
            },
        )
        server.use(getAudienceCountMock.handler)

        const { result, rerender } = renderHook(
            ({ params }) => useAudienceCount(params),
            {
                wrapper: createWrapper(),
                initialProps: { params: { integration_id: 1 } },
            },
        )

        await waitFor(() => expect(result.current.data).toEqual({ count: 10 }))

        rerender({ params: { integration_id: 2 } })

        await waitFor(() => expect(result.current.data).toEqual({ count: 20 }))
    })

    it('should not refetch on window focus', async () => {
        server.use(mockGetAudienceCountHandler().handler)

        renderHook(() => useAudienceCount(), { wrapper: createWrapper() })

        const query = queryClient
            .getQueryCache()
            .find(aiJourneyKeys.audienceCount({}))
        const queryOptions = query?.options as
            | { refetchOnWindowFocus?: boolean }
            | undefined

        expect(queryOptions?.refetchOnWindowFocus).toBe(false)
    })
})
