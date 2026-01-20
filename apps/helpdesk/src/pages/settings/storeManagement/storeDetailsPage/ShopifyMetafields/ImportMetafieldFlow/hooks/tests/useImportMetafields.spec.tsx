import type React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { mockUpdateMetafieldDefinitionHandler } from '@gorgias/helpdesk-mocks'
import { queryKeys } from '@gorgias/helpdesk-queries'

import type { Field } from '../../../MetafieldsTable/types'
import { useImportMetafields } from '../useImportMetafields'

const server = setupServer()

const INTEGRATION_ID = 123

function getPinnedQueryKey() {
    return queryKeys.integrations.listMetafieldDefinitions(INTEGRATION_ID, {
        pinned: true,
    })
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

describe('useImportMetafields', () => {
    let queryClient: QueryClient

    const mockField1: Field = {
        id: 'field-1',
        name: 'Customer Email',
        type: 'number_integer',
        category: 'Customer',
        isVisible: true,
    }

    const mockField2: Field = {
        id: 'field-2',
        name: 'Order Total',
        type: 'number_integer',
        category: 'Order',
        isVisible: true,
    }

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        })

        const mockHandler = mockUpdateMetafieldDefinitionHandler()
        server.use(mockHandler.handler)
    })

    afterEach(() => {
        queryClient.clear()
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <MemoryRouter initialEntries={[`/integrations/${INTEGRATION_ID}`]}>
            <Route path="/integrations/:id">
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            </Route>
        </MemoryRouter>
    )

    it('should execute mutation with provided fields', async () => {
        const { result } = renderHook(() => useImportMetafields(), { wrapper })

        await act(async () => {
            const response = await result.current.mutateAsync({
                fields: [mockField1],
            })
            expect(response.successful).toEqual([mockField1])
            expect(response.failed).toEqual([])
        })
    })

    it('should cancel pending queries before mutation', async () => {
        const cancelQueriesSpy = jest.spyOn(queryClient, 'cancelQueries')

        const { result } = renderHook(() => useImportMetafields(), { wrapper })

        act(() => {
            result.current.mutate({ fields: [mockField1] })
        })

        await waitFor(() => {
            expect(cancelQueriesSpy).toHaveBeenCalledWith({
                queryKey: getPinnedQueryKey(),
            })
        })

        cancelQueriesSpy.mockRestore()
    })

    it('should invalidate queries after mutation settles', async () => {
        const invalidateQueriesSpy = jest.spyOn(
            queryClient,
            'invalidateQueries',
        )

        const { result } = renderHook(() => useImportMetafields(), { wrapper })

        await act(async () => {
            await result.current.mutateAsync({ fields: [mockField1] })
        })

        expect(invalidateQueriesSpy).toHaveBeenCalledWith({
            queryKey: getPinnedQueryKey(),
        })

        invalidateQueriesSpy.mockRestore()
    })

    it('should return successful and failed fields on partial success', async () => {
        let callCount = 0
        const mockHandler = mockUpdateMetafieldDefinitionHandler(async () => {
            callCount++
            if (callCount === 1) {
                return new HttpResponse(null, { status: 204 })
            }
            return new HttpResponse(null, { status: 500 })
        })
        server.use(mockHandler.handler)

        const { result } = renderHook(() => useImportMetafields(), { wrapper })

        await act(async () => {
            const response = await result.current.mutateAsync({
                fields: [mockField1, mockField2],
            })
            expect(response.successful).toEqual([mockField1])
            expect(response.failed).toEqual([mockField2])
        })
    })

    it.each([
        { cacheData: undefined, description: 'no cached data' },
        {
            cacheData: {
                data: {
                    data: undefined,
                    meta: { next_cursor: null, prev_cursor: null },
                    object: 'list',
                    uri: '/api/integrations/123/metafield-definitions',
                },
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {},
            },
            description: 'undefined previousData array',
        },
    ])(
        'should handle mutation when there is $description',
        async ({ cacheData }) => {
            queryClient.setQueryData(getPinnedQueryKey(), cacheData)

            const { result } = renderHook(() => useImportMetafields(), {
                wrapper,
            })

            await act(async () => {
                const response = await result.current.mutateAsync({
                    fields: [mockField1],
                })
                expect(response.successful).toEqual([mockField1])
                expect(response.failed).toEqual([])
            })
        },
    )

    it('should return empty previousFields in context when cache has no data', async () => {
        queryClient.removeQueries({ queryKey: getPinnedQueryKey() })

        const { result } = renderHook(() => useImportMetafields(), { wrapper })

        let capturedContext: { previousFields: Field[] } | undefined

        await act(async () => {
            await result.current.mutateAsync(
                { fields: [mockField1] },
                {
                    onSuccess: (_data, _variables, context) => {
                        capturedContext = context
                    },
                },
            )
        })

        expect(capturedContext?.previousFields).toEqual([])
    })
})
