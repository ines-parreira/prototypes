import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { mockUpdateMetafieldDefinitionHandler } from '@gorgias/helpdesk-mocks'
import { queryKeys } from '@gorgias/helpdesk-queries'
import type {
    ListMetafieldDefinitionsResult,
    MetafieldDefinition,
} from '@gorgias/helpdesk-types'

import { useDeleteMetafield } from './useDeleteMetafield'

const server = setupServer()

const INTEGRATION_ID = 123

function getPinnedQueryKey() {
    return queryKeys.integrations.listMetafieldDefinitions(INTEGRATION_ID, {
        pinned: true,
    })
}

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

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('useDeleteMetafield', () => {
    let queryClient: QueryClient

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
        {
            id: '3',
            name: 'Field 3',
            key: 'field_3',
            namespace: 'custom',
            type: 'date',
            ownerType: 'DraftOrder',
            isVisible: true,
        },
    ]

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MemoryRouter initialEntries={[`/integrations/${INTEGRATION_ID}`]}>
            <Route path="/integrations/:id">
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            </Route>
        </MemoryRouter>
    )

    function getCachedData() {
        return queryClient.getQueryData<ListMetafieldDefinitionsResult>(
            getPinnedQueryKey(),
        )?.data?.data
    }

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        })
        queryClient.setQueryData(
            getPinnedQueryKey(),
            createMockResponse(mockDefinitions),
        )

        const mockHandler = mockUpdateMetafieldDefinitionHandler()
        server.use(mockHandler.handler)
    })

    afterEach(() => {
        queryClient.clear()
    })

    it.each([
        { id: '1', description: 'first' },
        { id: '2', description: 'middle' },
        { id: '3', description: 'last' },
    ])('should delete $description field from the list', async ({ id }) => {
        const { result } = renderHook(() => useDeleteMetafield(), { wrapper })

        act(() => {
            result.current.mutate({ id })
        })

        await waitFor(() => {
            expect(getCachedData()?.length).toBe(2)
            expect(getCachedData()?.find((d) => d.id === id)).toBeUndefined()
        })
    })

    it('should handle deleting non-existent field gracefully', async () => {
        const { result } = renderHook(() => useDeleteMetafield(), { wrapper })

        act(() => {
            result.current.mutate({ id: 'non-existent' })
        })

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true)
        })

        expect(getCachedData()).toEqual(mockDefinitions)
    })

    it('should handle mutation without cached data', async () => {
        queryClient.setQueryData(getPinnedQueryKey(), undefined)

        const { result } = renderHook(() => useDeleteMetafield(), { wrapper })

        act(() => {
            result.current.mutate({ id: '1' })
        })

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true)
        })
    })

    it('should handle mutation when previousData array is undefined', async () => {
        queryClient.setQueryData(getPinnedQueryKey(), {
            data: {
                data: undefined,
                meta: { next_cursor: null, prev_cursor: null },
                object: 'list',
                uri: '/api/integrations/123/metafield-definitions',
            },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {} as ListMetafieldDefinitionsResult['config'],
        })

        const { result } = renderHook(() => useDeleteMetafield(), { wrapper })

        act(() => {
            result.current.mutate({ id: '1' })
        })

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true)
        })

        expect(getCachedData()).toEqual([])
    })

    it('should cancel queries before mutation', async () => {
        const cancelQueriesSpy = jest.spyOn(queryClient, 'cancelQueries')

        const { result } = renderHook(() => useDeleteMetafield(), { wrapper })

        act(() => {
            result.current.mutate({ id: '1' })
        })

        await waitFor(() => {
            expect(cancelQueriesSpy).toHaveBeenCalledWith({
                queryKey: getPinnedQueryKey(),
            })
        })
    })
})
