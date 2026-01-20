import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { mockUpdateMetafieldDefinitionHandler } from '@gorgias/helpdesk-mocks'
import { queryKeys } from '@gorgias/helpdesk-queries'
import type {
    ListMetafieldDefinitionsResult,
    MetafieldDefinition,
} from '@gorgias/helpdesk-types'

import { useMetafieldDefinitionMutation } from './useMetafieldDefinitionMutation'

const server = setupServer()
const INTEGRATION_ID = 123

const pinnedQueryKey = queryKeys.integrations.listMetafieldDefinitions(
    INTEGRATION_ID,
    { pinned: true },
)

const mockDefinitions: MetafieldDefinition[] = [
    {
        id: '1',
        name: 'Field 1',
        key: 'field_1',
        namespace: 'custom',
        type: 'single_line_text_field',
        ownerType: 'Order',
        isVisible: true,
    },
    {
        id: '2',
        name: 'Field 2',
        key: 'field_2',
        namespace: 'custom',
        type: 'multi_line_text_field',
        ownerType: 'Customer',
        isVisible: false,
    },
]

const visibilityOptimisticUpdate = (
    params: { id: string; data: { isVisible: boolean } },
    previousData: MetafieldDefinition[] | undefined,
) => {
    if (!previousData) return previousData
    return previousData.map((def) =>
        def.id === params.id
            ? { ...def, isVisible: params.data.isVisible }
            : def,
    )
}

const mutationParams = (id: string, isVisible: boolean) => ({
    integrationId: INTEGRATION_ID,
    id,
    data: { isVisible, isPinned: true },
})

function createMockResponse(
    definitions: MetafieldDefinition[],
): ListMetafieldDefinitionsResult {
    return {
        data: {
            data: definitions,
            meta: { next_cursor: null, prev_cursor: null },
            object: 'list',
            uri: '/api/integrations/123/metafield-definitions',
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as ListMetafieldDefinitionsResult['config'],
    }
}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('useMetafieldDefinitionMutation', () => {
    let queryClient: QueryClient

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MemoryRouter initialEntries={[`/integrations/${INTEGRATION_ID}`]}>
            <Route path="/integrations/:id">
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            </Route>
        </MemoryRouter>
    )

    const getCachedField = (id: string) =>
        queryClient
            .getQueryData<ListMetafieldDefinitionsResult>(pinnedQueryKey)
            ?.data?.data?.find((d) => d.id === id)

    const getCachedData = () =>
        queryClient.getQueryData<ListMetafieldDefinitionsResult>(pinnedQueryKey)
            ?.data?.data

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        })
        queryClient.setQueryData(
            pinnedQueryKey,
            createMockResponse(mockDefinitions),
        )
        server.use(mockUpdateMetafieldDefinitionHandler().handler)
    })

    afterEach(() => queryClient.clear())

    describe('optimistic updates (onMutate)', () => {
        it('should apply optimistic update when provided', async () => {
            const { result } = renderHook(
                () =>
                    useMetafieldDefinitionMutation({
                        optimisticUpdate: visibilityOptimisticUpdate,
                    }),
                { wrapper },
            )

            expect(getCachedField('1')?.isVisible).toBe(true)

            act(() => result.current.mutate(mutationParams('1', false)))

            await waitFor(() => {
                expect(getCachedField('1')?.isVisible).toBe(false)
            })
        })

        it('should not modify cache when optimisticUpdate is not provided', async () => {
            const { result } = renderHook(
                () => useMetafieldDefinitionMutation(),
                { wrapper },
            )
            const originalData = getCachedData()

            act(() => result.current.mutate(mutationParams('1', false)))

            expect(getCachedData()).toEqual(originalData)
            await waitFor(() => expect(result.current.isSuccess).toBe(true))
        })

        it('should handle undefined previousResponse', async () => {
            queryClient.setQueryData(pinnedQueryKey, undefined)

            const { result } = renderHook(
                () =>
                    useMetafieldDefinitionMutation({
                        optimisticUpdate: visibilityOptimisticUpdate,
                    }),
                { wrapper },
            )

            act(() => result.current.mutate(mutationParams('1', false)))

            await waitFor(() => expect(result.current.isSuccess).toBe(true))
        })
    })

    describe('error rollback (onError)', () => {
        const useErrorHandler = () => {
            const handler = mockUpdateMetafieldDefinitionHandler(async () =>
                HttpResponse.json(null, { status: 500 }),
            )
            server.use(handler.handler)
        }

        it('should restore previous data when mutation fails', async () => {
            useErrorHandler()

            const { result } = renderHook(
                () =>
                    useMetafieldDefinitionMutation({
                        optimisticUpdate: visibilityOptimisticUpdate,
                    }),
                { wrapper },
            )

            expect(getCachedField('1')?.isVisible).toBe(true)

            act(() => result.current.mutate(mutationParams('1', false)))

            await waitFor(() => expect(result.current.isError).toBe(true))
            expect(getCachedField('1')?.isVisible).toBe(true)
        })

        it('should handle undefined previousResponse gracefully', async () => {
            queryClient.setQueryData(pinnedQueryKey, undefined)
            useErrorHandler()

            const { result } = renderHook(
                () => useMetafieldDefinitionMutation(),
                { wrapper },
            )

            act(() => result.current.mutate(mutationParams('1', false)))

            await waitFor(() => expect(result.current.isError).toBe(true))
        })
    })
})
