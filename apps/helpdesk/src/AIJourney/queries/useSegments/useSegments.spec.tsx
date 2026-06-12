import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockListSegmentsHandler,
    mockListSegmentsResponse,
    mockSegmentDefinition,
} from '@gorgias/customer-segmentation-mocks'

import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { useSegments } from './useSegments'

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
    mockListSegmentsResponse({
        data: ids.map((id) =>
            mockSegmentDefinition({
                id,
                name: `Segment ${id}`,
                integration_id: 123,
            }),
        ),
        metadata: { next_cursor: null, prev_cursor: null },
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

describe('useSegments', () => {
    it('should fetch segments successfully', async () => {
        const response = createSegmentsResponse(['1'])
        const listSegmentsMock = mockListSegmentsHandler(async () =>
            HttpResponse.json(response),
        )
        const waitForListSegmentsRequest =
            listSegmentsMock.waitForRequest(server)
        server.use(listSegmentsMock.handler)

        const { result } = renderHook(() => useSegments(123), {
            wrapper: createWrapper(),
        })

        await waitForListSegmentsRequest((request) => {
            expect(
                new URL(request.url).searchParams.get('integration_id'),
            ).toBe('123')
        })
        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.data).toEqual(response)
    })

    it('should pass additional params to listSegments', async () => {
        const listSegmentsMock = mockListSegmentsHandler(async () =>
            HttpResponse.json(createSegmentsResponse([])),
        )
        const waitForListSegmentsRequest =
            listSegmentsMock.waitForRequest(server)
        server.use(listSegmentsMock.handler)

        const { result } = renderHook(
            () => useSegments(123, { limit: 25, cursor: 'cursor_abc' }),
            { wrapper: createWrapper() },
        )

        await waitForListSegmentsRequest((request) => {
            const searchParams = new URL(request.url).searchParams

            expect(searchParams.get('integration_id')).toBe('123')
            expect(searchParams.get('limit')).toBe('25')
            expect(searchParams.get('cursor')).toBe('cursor_abc')
        })
        await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })

    it('should not fetch when integrationId is undefined', async () => {
        const requests: Request[] = []
        server.use(
            mockListSegmentsHandler(async ({ request }) => {
                requests.push(request)

                return HttpResponse.json(createSegmentsResponse([]))
            }).handler,
        )

        const { result } = renderHook(() => useSegments(undefined), {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(result.current.fetchStatus).toBe('idle')
        })

        expect(requests).toHaveLength(0)
        expect(result.current.data).toBeUndefined()
    })

    it('should not fetch when enabled option is false', async () => {
        const requests: Request[] = []
        server.use(
            mockListSegmentsHandler(async ({ request }) => {
                requests.push(request)

                return HttpResponse.json(createSegmentsResponse([]))
            }).handler,
        )

        const { result } = renderHook(
            () => useSegments(123, undefined, { enabled: false }),
            { wrapper: createWrapper() },
        )

        await waitFor(() => {
            expect(result.current.fetchStatus).toBe('idle')
        })

        expect(requests).toHaveLength(0)
        expect(result.current.data).toBeUndefined()
    })

    it('should handle errors when fetching segments', async () => {
        server.use(
            mockListSegmentsHandler(async () =>
                HttpResponse.json(
                    { error: 'Failed to fetch segments' } as never,
                    { status: 500 },
                ),
            ).handler,
        )

        const { result } = renderHook(() => useSegments(123), {
            wrapper: createWrapper(),
        })

        await waitFor(() => expect(result.current.isError).toBe(true))

        expect(result.current.error).toBeDefined()
    })

    it('should refetch when integrationId changes', async () => {
        const firstResponse = createSegmentsResponse(['1'])
        const secondResponse = createSegmentsResponse(['2'])

        server.use(
            mockListSegmentsHandler(async ({ request }) => {
                const integrationId = new URL(request.url).searchParams.get(
                    'integration_id',
                )

                return HttpResponse.json(
                    integrationId === '123' ? firstResponse : secondResponse,
                )
            }).handler,
        )

        const { result, rerender } = renderHook(
            ({ integrationId }: { integrationId: number }) =>
                useSegments(integrationId),
            {
                wrapper: createWrapper(),
                initialProps: { integrationId: 123 },
            },
        )

        await waitFor(() => expect(result.current.data).toEqual(firstResponse))

        rerender({ integrationId: 456 })

        await waitFor(() => expect(result.current.data).toEqual(secondResponse))
    })
})
