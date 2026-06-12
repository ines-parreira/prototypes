import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockGetConditionsMetadataHandler,
    mockGetConditionsMetadataResponse,
} from '@gorgias/customer-segmentation-mocks'

import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { aiJourneyKeys } from '../utils'
import { useConditionsMetadata } from './useConditionsMetadata'

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

describe('useConditionsMetadata', () => {
    it('should fetch conditions metadata successfully', async () => {
        const response = mockGetConditionsMetadataResponse({
            operators: { comparison: ['eq'], set: [], unary: [] },
            objects: {},
        })
        server.use(
            mockGetConditionsMetadataHandler(async () =>
                HttpResponse.json(response),
            ).handler,
        )

        const { result } = renderHook(() => useConditionsMetadata(), {
            wrapper: createWrapper(),
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.data).toEqual(response)
    })

    it('should handle errors when fetching conditions metadata', async () => {
        server.use(
            mockGetConditionsMetadataHandler(async () =>
                HttpResponse.json(
                    { error: 'Failed to fetch conditions metadata' } as never,
                    { status: 500 },
                ),
            ).handler,
        )

        const { result } = renderHook(() => useConditionsMetadata(), {
            wrapper: createWrapper(),
        })

        await waitFor(() => expect(result.current.isError).toBe(true))

        expect(result.current.error).toBeDefined()
    })

    it('should not fetch when enabled option is false', async () => {
        const requests: Request[] = []
        const getConditionsMetadataMock = mockGetConditionsMetadataHandler(
            async ({ request }) => {
                requests.push(request)

                return HttpResponse.json(mockGetConditionsMetadataResponse())
            },
        )
        server.use(getConditionsMetadataMock.handler)

        const { result } = renderHook(
            () => useConditionsMetadata({ enabled: false }),
            { wrapper: createWrapper() },
        )

        await waitFor(() => {
            expect(result.current.fetchStatus).toBe('idle')
        })

        expect(requests).toHaveLength(0)
        expect(result.current.data).toBeUndefined()
    })

    it('should use the correct query key', async () => {
        const response = mockGetConditionsMetadataResponse({
            operators: { comparison: ['eq'], set: [], unary: [] },
            objects: {},
        })
        server.use(
            mockGetConditionsMetadataHandler(async () =>
                HttpResponse.json(response),
            ).handler,
        )

        const { result } = renderHook(() => useConditionsMetadata(), {
            wrapper: createWrapper(),
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(
            queryClient.getQueryData(aiJourneyKeys.conditionsMetadata()),
        ).toEqual(response)
    })

    it('should have staleTime set to Infinity', async () => {
        server.use(mockGetConditionsMetadataHandler().handler)

        renderHook(() => useConditionsMetadata(), {
            wrapper: createWrapper(),
        })

        const query = queryClient
            .getQueryCache()
            .find(aiJourneyKeys.conditionsMetadata())
        const queryOptions = query?.options as
            | { staleTime?: number }
            | undefined

        expect(queryOptions?.staleTime).toBe(Infinity)
    })

    it('should support select option to transform data', async () => {
        const response = mockGetConditionsMetadataResponse({
            operators: { comparison: ['eq'], set: [], unary: [] },
            objects: { shopper: { fields: {}, aggregates: {} } },
        })

        server.use(
            mockGetConditionsMetadataHandler(async () =>
                HttpResponse.json(response),
            ).handler,
        )

        const { result } = renderHook(
            () =>
                useConditionsMetadata({
                    select: (data) => Object.keys(data.objects),
                }),
            { wrapper: createWrapper() },
        )

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.data).toEqual(Object.keys(response.objects))
    })
})
