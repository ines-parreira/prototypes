import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'

import type { Field } from '../MetafieldsTable/types'
import { METAFIELDS_QUERY_KEY } from './useMetafields'
import { useToggleMetafieldVisibility } from './useToggleMetafieldVisibility'

describe('useToggleMetafieldVisibility', () => {
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

    it('should toggle metafield visibility optimistically', async () => {
        const { result } = renderHook(() => useToggleMetafieldVisibility(), {
            wrapper,
        })

        await act(async () => {
            result.current.mutate({ id: '1', isVisible: false })
        })

        const updatedFields =
            queryClient.getQueryData<Field[]>(METAFIELDS_QUERY_KEY)
        expect(updatedFields).toEqual([
            {
                id: '1',
                name: 'Field 1',
                type: 'single_line_text',
                category: 'order',
                isVisible: false,
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
        ])
    })

    it('should toggle visibility from false to true', async () => {
        const { result } = renderHook(() => useToggleMetafieldVisibility(), {
            wrapper,
        })

        await act(async () => {
            result.current.mutate({ id: '2', isVisible: true })
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

    it('should handle undefined cache data gracefully', async () => {
        queryClient.clear()

        const { result } = renderHook(() => useToggleMetafieldVisibility(), {
            wrapper,
        })

        await act(async () => {
            result.current.mutate({ id: '1', isVisible: false })
        })

        const updatedFields =
            queryClient.getQueryData<Field[]>(METAFIELDS_QUERY_KEY)
        expect(updatedFields).toBeUndefined()
    })

    it('should cancel queries before mutation', async () => {
        const cancelQueriesSpy = jest.spyOn(queryClient, 'cancelQueries')

        const { result } = renderHook(() => useToggleMetafieldVisibility(), {
            wrapper,
        })

        await act(async () => {
            result.current.mutate({ id: '1', isVisible: false })
        })

        expect(cancelQueriesSpy).toHaveBeenCalledWith({
            queryKey: METAFIELDS_QUERY_KEY,
        })
    })
})
