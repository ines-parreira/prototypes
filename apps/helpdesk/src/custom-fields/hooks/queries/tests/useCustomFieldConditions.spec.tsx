import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockListCustomFieldConditionsHandler,
    mockListCustomFieldConditionsResponse,
} from '@gorgias/helpdesk-mocks'
import { queryKeys } from '@gorgias/helpdesk-queries'

import { OBJECT_TYPES } from 'custom-fields/constants'
import {
    MAX_CONDITIONS,
    STALE_TIME_MS,
    useCustomFieldConditions,
} from 'custom-fields/hooks/queries/useCustomFieldConditions'
import { customFieldCondition } from 'fixtures/customFieldCondition'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

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

describe('useCustomFieldConditions', () => {
    it('should return loading state initially and configure the query', () => {
        server.use(
            mockListCustomFieldConditionsHandler(async () => {
                await new Promise(() => undefined)

                return HttpResponse.json(
                    mockListCustomFieldConditionsResponse({ data: [] }),
                )
            }).handler,
        )

        const { result } = renderHook(
            () => useCustomFieldConditions({ objectType: OBJECT_TYPES.TICKET }),
            { wrapper: createWrapper() },
        )

        const query = queryClient.getQueryCache().find(
            queryKeys.customFieldConditions.listCustomFieldConditions({
                object_type: OBJECT_TYPES.TICKET,
                include_deactivated: true,
            }),
        )
        const queryOptions = query?.options as
            | { staleTime?: number; enabled?: boolean }
            | undefined

        expect(queryOptions?.staleTime).toBe(STALE_TIME_MS)
        expect(queryOptions?.enabled).toBe(true)
        expect(result.current.isLoading).toBe(true)
        expect(result.current.customFieldConditions).toEqual([])
    })

    it('should return custom field conditions on success', async () => {
        const listConditionsMock = mockListCustomFieldConditionsHandler(
            async () =>
                HttpResponse.json(
                    mockListCustomFieldConditionsResponse({
                        data: [customFieldCondition],
                    }),
                ),
        )
        const waitForListConditionsRequest =
            listConditionsMock.waitForRequest(server)
        server.use(listConditionsMock.handler)

        const { result } = renderHook(
            () => useCustomFieldConditions({ objectType: OBJECT_TYPES.TICKET }),
            { wrapper: createWrapper() },
        )

        await waitForListConditionsRequest((request) => {
            const searchParams = new URL(request.url).searchParams

            expect(searchParams.get('object_type')).toBe(OBJECT_TYPES.TICKET)
            expect(searchParams.get('order_by')).toBe('sort_order:asc')
            expect(searchParams.get('limit')).toBe(String(MAX_CONDITIONS))
            expect(searchParams.get('include_deactivated')).toBe('true')
        })
        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.customFieldConditions).toEqual([
            customFieldCondition,
        ])
    })

    it('should show error toast on error', async () => {
        server.use(
            mockListCustomFieldConditionsHandler(async () =>
                HttpResponse.json(
                    {
                        error: 'Failed to fetch custom field conditions',
                    } as never,
                    { status: 500 },
                ),
            ).handler,
        )

        const { result } = renderHook(
            () =>
                useCustomFieldConditions({
                    objectType: OBJECT_TYPES.TICKET,
                    includeDeactivated: false,
                    enabled: true,
                    invalidate: true,
                }),
            { wrapper: createWrapper() },
        )

        const query = queryClient.getQueryCache().find(
            queryKeys.customFieldConditions.listCustomFieldConditions({
                object_type: OBJECT_TYPES.TICKET,
                include_deactivated: false,
            }),
        )
        const queryOptions = query?.options as
            | { staleTime?: number; enabled?: boolean }
            | undefined

        expect(queryOptions?.staleTime).toBe(0)
        expect(queryOptions?.enabled).toBe(true)

        const toastEl = await screen.findByRole('status', {
            name: 'Failed to fetch ticket custom fields conditions',
        })
        expect(toastEl).toHaveAttribute('data-intent', 'destructive')

        await waitFor(() => expect(result.current.isError).toBe(true))
    })
})
