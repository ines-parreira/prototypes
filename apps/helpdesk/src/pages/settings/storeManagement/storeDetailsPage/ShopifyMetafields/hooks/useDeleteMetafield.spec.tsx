import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'

import type { Field } from '../MetafieldsTable/types'
import { useDeleteMetafield } from './useDeleteMetafield'
import { METAFIELDS_QUERY_KEY } from './useMetafields'

describe('useDeleteMetafield', () => {
    let queryClient: QueryClient

    const mockFields: Field[] = [
        {
            id: '1',
            name: 'Field 1',
            type: 'single_line_text',
            category: 'order',
            isVisible: true,
        },
        {
            id: '2',
            name: 'Field 2',
            type: 'multi_line_text',
            category: 'customer',
            isVisible: false,
        },
        {
            id: '3',
            name: 'Field 3',
            type: 'date',
            category: 'draft_order',
            isVisible: true,
        },
    ]

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        })
        queryClient.setQueryData(METAFIELDS_QUERY_KEY, mockFields)
    })

    afterEach(() => {
        queryClient.clear()
    })

    it('should delete metafield optimistically', async () => {
        const { result } = renderHook(() => useDeleteMetafield(), { wrapper })

        await act(async () => {
            result.current.mutate({ id: '2' })
        })

        const updatedFields =
            queryClient.getQueryData<Field[]>(METAFIELDS_QUERY_KEY)
        expect(updatedFields).toEqual([
            {
                id: '1',
                name: 'Field 1',
                type: 'single_line_text',
                category: 'order',
                isVisible: true,
            },
            {
                id: '3',
                name: 'Field 3',
                type: 'date',
                category: 'draft_order',
                isVisible: true,
            },
        ])
    })

    it('should delete first field from the list', async () => {
        const { result } = renderHook(() => useDeleteMetafield(), { wrapper })

        await act(async () => {
            result.current.mutate({ id: '1' })
        })

        const updatedFields =
            queryClient.getQueryData<Field[]>(METAFIELDS_QUERY_KEY)
        expect(updatedFields).toEqual([
            {
                id: '2',
                name: 'Field 2',
                type: 'multi_line_text',
                category: 'customer',
                isVisible: false,
            },
            {
                id: '3',
                name: 'Field 3',
                type: 'date',
                category: 'draft_order',
                isVisible: true,
            },
        ])
    })

    it('should delete last field from the list', async () => {
        const { result } = renderHook(() => useDeleteMetafield(), { wrapper })

        await act(async () => {
            result.current.mutate({ id: '3' })
        })

        const updatedFields =
            queryClient.getQueryData<Field[]>(METAFIELDS_QUERY_KEY)
        expect(updatedFields).toEqual([
            {
                id: '1',
                name: 'Field 1',
                type: 'single_line_text',
                category: 'order',
                isVisible: true,
            },
            {
                id: '2',
                name: 'Field 2',
                type: 'multi_line_text',
                category: 'customer',
                isVisible: false,
            },
        ])
    })

    it('should handle deleting non-existent field gracefully', async () => {
        const { result } = renderHook(() => useDeleteMetafield(), { wrapper })

        await act(async () => {
            result.current.mutate({ id: 'non-existent' })
        })

        const updatedFields =
            queryClient.getQueryData<Field[]>(METAFIELDS_QUERY_KEY)
        expect(updatedFields).toEqual(mockFields)
    })

    it('should handle undefined cache data gracefully', async () => {
        queryClient.clear()

        const { result } = renderHook(() => useDeleteMetafield(), { wrapper })

        await act(async () => {
            result.current.mutate({ id: '1' })
        })

        const updatedFields =
            queryClient.getQueryData<Field[]>(METAFIELDS_QUERY_KEY)
        expect(updatedFields).toBeUndefined()
    })

    it('should cancel queries before mutation', async () => {
        const cancelQueriesSpy = jest.spyOn(queryClient, 'cancelQueries')

        const { result } = renderHook(() => useDeleteMetafield(), { wrapper })

        await act(async () => {
            result.current.mutate({ id: '1' })
        })

        expect(cancelQueriesSpy).toHaveBeenCalledWith({
            queryKey: METAFIELDS_QUERY_KEY,
        })
    })

    it('should remove deleted field from cache', async () => {
        const { result } = renderHook(() => useDeleteMetafield(), { wrapper })

        await act(async () => {
            result.current.mutate({ id: '1' })
        })

        const updatedFields =
            queryClient.getQueryData<Field[]>(METAFIELDS_QUERY_KEY)
        expect(updatedFields?.find((f) => f.id === '1')).toBeUndefined()
        expect(updatedFields?.length).toBe(2)
    })
})
