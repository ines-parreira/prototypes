import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { AudienceListSource } from '@gorgias/convert-client'
import {
    mockAudienceUsageSchema,
    mockGetAudiencesUsageHandler,
    mockGetAudiencesUsageResponse,
} from '@gorgias/convert-mocks'

import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { useAudiencesUsage } from './useAudiencesUsage'

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

const createUsageResponse = (id: string) =>
    mockGetAudiencesUsageResponse({
        data: [
            mockAudienceUsageSchema({
                id,
                identifier: 'segment-abc',
                source: AudienceListSource.Gorgias,
                count_campaigns: 1,
                count_journeys: 2,
                usage: [
                    {
                        id: 'journey-1',
                        name: 'Cart Flow',
                        type: 'cart_abandoned',
                    },
                ],
            }),
        ],
    })

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

describe('useAudiencesUsage', () => {
    it('should fetch audience usage successfully', async () => {
        const response = createUsageResponse('audience-1')
        const getAudiencesUsageMock = mockGetAudiencesUsageHandler(async () =>
            HttpResponse.json(response),
        )
        const waitForGetAudiencesUsageRequest =
            getAudiencesUsageMock.waitForRequest(server)
        server.use(getAudiencesUsageMock.handler)

        const { result } = renderHook(() => useAudiencesUsage(123), {
            wrapper: createWrapper(),
        })

        await waitForGetAudiencesUsageRequest((request) => {
            expect(
                new URL(request.url).searchParams.get('store_integration_id'),
            ).toBe('123')
        })
        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.data).toEqual(response)
    })

    it('should include extra params in the request', async () => {
        const getAudiencesUsageMock = mockGetAudiencesUsageHandler(async () =>
            HttpResponse.json(createUsageResponse('audience-1')),
        )
        const waitForGetAudiencesUsageRequest =
            getAudiencesUsageMock.waitForRequest(server)
        server.use(getAudiencesUsageMock.handler)

        const { result } = renderHook(
            () =>
                useAudiencesUsage(123, { source: AudienceListSource.Gorgias }),
            { wrapper: createWrapper() },
        )

        await waitForGetAudiencesUsageRequest((request) => {
            const searchParams = new URL(request.url).searchParams

            expect(searchParams.get('store_integration_id')).toBe('123')
            expect(searchParams.get('source')).toBe(AudienceListSource.Gorgias)
        })
        await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })

    it('should handle errors when fetching audience usage', async () => {
        server.use(
            mockGetAudiencesUsageHandler(async () =>
                HttpResponse.json(
                    { error: 'Failed to fetch audience usage' } as never,
                    { status: 500 },
                ),
            ).handler,
        )

        const { result } = renderHook(() => useAudiencesUsage(123), {
            wrapper: createWrapper(),
        })

        await waitFor(() => expect(result.current.isError).toBe(true))

        expect(result.current.error).toBeDefined()
    })

    it('should not fetch when integrationId is undefined', async () => {
        const requests: Request[] = []
        server.use(
            mockGetAudiencesUsageHandler(async ({ request }) => {
                requests.push(request)

                return HttpResponse.json(createUsageResponse('audience-1'))
            }).handler,
        )

        const { result } = renderHook(() => useAudiencesUsage(undefined), {
            wrapper: createWrapper(),
        })

        await waitFor(() => expect(result.current.fetchStatus).toBe('idle'))

        expect(requests).toHaveLength(0)
        expect(result.current.data).toBeUndefined()
    })

    it('should not fetch when options.enabled is false', async () => {
        const requests: Request[] = []
        server.use(
            mockGetAudiencesUsageHandler(async ({ request }) => {
                requests.push(request)

                return HttpResponse.json(createUsageResponse('audience-1'))
            }).handler,
        )

        const { result } = renderHook(
            () => useAudiencesUsage(123, undefined, { enabled: false }),
            { wrapper: createWrapper() },
        )

        await waitFor(() => expect(result.current.fetchStatus).toBe('idle'))

        expect(requests).toHaveLength(0)
        expect(result.current.data).toBeUndefined()
    })

    it('should refetch when integrationId changes', async () => {
        const firstResponse = createUsageResponse('a1')
        const secondResponse = createUsageResponse('a2')

        server.use(
            mockGetAudiencesUsageHandler(async ({ request }) => {
                const integrationId = new URL(request.url).searchParams.get(
                    'store_integration_id',
                )

                return HttpResponse.json(
                    integrationId === '123' ? firstResponse : secondResponse,
                )
            }).handler,
        )

        const { result, rerender } = renderHook(
            ({ integrationId }: { integrationId: number }) =>
                useAudiencesUsage(integrationId),
            {
                wrapper: createWrapper(),
                initialProps: { integrationId: 123 },
            },
        )

        await waitFor(() => expect(result.current.data).toEqual(firstResponse))

        rerender({ integrationId: 456 })

        await waitFor(() => expect(result.current.data).toEqual(secondResponse))
    })

    it('should apply a custom select option', async () => {
        const response = createUsageResponse('audience-1')

        server.use(
            mockGetAudiencesUsageHandler(async () =>
                HttpResponse.json(response),
            ).handler,
        )

        const selectIds = jest.fn(
            (data: ReturnType<typeof createUsageResponse>) =>
                data.data.map((entry) => entry.id),
        )

        const { result } = renderHook(
            () => useAudiencesUsage(123, undefined, { select: selectIds }),
            { wrapper: createWrapper() },
        )

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(selectIds).toHaveBeenCalledWith(response)
        expect(result.current.data).toEqual(['audience-1'])
    })
})
