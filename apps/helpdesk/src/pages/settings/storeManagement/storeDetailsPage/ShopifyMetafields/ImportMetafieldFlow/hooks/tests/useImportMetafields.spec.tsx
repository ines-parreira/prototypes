import type React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'

import { METAFIELDS_QUERY_KEY } from '../../../hooks/useMetafields'
import type { Field } from '../../../MetafieldsTable/types'
import { useImportMetafields } from '../useImportMetafields'

describe('useImportMetafields', () => {
    let queryClient: QueryClient

    const mockField1: Field = {
        id: 'field-1',
        name: 'Customer Email',
        type: 'number_integer',
        category: 'customer',
        isVisible: true,
    }

    const mockField2: Field = {
        id: 'field-2',
        name: 'Order Total',
        type: 'number_integer',
        category: 'order',
        isVisible: true,
    }

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        })
    })

    afterEach(() => {
        queryClient.clear()
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )

    describe('mutation execution', () => {
        it('should execute mutation with provided fields', async () => {
            const { result } = renderHook(() => useImportMetafields(), {
                wrapper,
            })

            const params = { fields: [mockField1] }

            await act(async () => {
                const response = await result.current.mutateAsync(params)
                expect(response).toEqual(params)
            })
        })
    })

    describe('optimistic updates', () => {
        it('should optimistically add fields to empty cache', async () => {
            const { result } = renderHook(() => useImportMetafields(), {
                wrapper,
            })

            await act(async () => {
                await result.current.mutateAsync({ fields: [mockField1] })
            })

            const cachedData =
                queryClient.getQueryData<Field[]>(METAFIELDS_QUERY_KEY)
            expect(cachedData).toEqual([mockField1])
        })

        it('should optimistically append fields to existing cache', async () => {
            queryClient.setQueryData<Field[]>(METAFIELDS_QUERY_KEY, [
                mockField1,
            ])

            const { result } = renderHook(() => useImportMetafields(), {
                wrapper,
            })

            await act(async () => {
                await result.current.mutateAsync({ fields: [mockField2] })
            })

            const cachedData =
                queryClient.getQueryData<Field[]>(METAFIELDS_QUERY_KEY)
            expect(cachedData).toEqual([mockField1, mockField2])
        })
    })

    describe('query cancellation', () => {
        it('should cancel pending queries before mutation', async () => {
            const cancelQueriesSpy = jest.spyOn(queryClient, 'cancelQueries')

            const { result } = renderHook(() => useImportMetafields(), {
                wrapper,
            })

            await act(async () => {
                await result.current.mutateAsync({ fields: [mockField1] })
            })

            expect(cancelQueriesSpy).toHaveBeenCalledWith({
                queryKey: METAFIELDS_QUERY_KEY,
            })

            cancelQueriesSpy.mockRestore()
        })
    })

    describe('query invalidation', () => {
        it('should invalidate queries after mutation settles', async () => {
            const invalidateQueriesSpy = jest.spyOn(
                queryClient,
                'invalidateQueries',
            )

            const { result } = renderHook(() => useImportMetafields(), {
                wrapper,
            })

            await act(async () => {
                await result.current.mutateAsync({ fields: [mockField1] })
            })

            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: METAFIELDS_QUERY_KEY,
            })

            invalidateQueriesSpy.mockRestore()
        })
    })
})
