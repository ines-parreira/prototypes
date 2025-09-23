import { act, renderHook } from '@testing-library/react'

import { usePaginatedItems } from '../usePaginatedItems'

describe('usePaginatedItems', () => {
    const mockItems = Array.from({ length: 100 }, (_, i) => ({
        id: `item-${i}`,
        title: `Item ${i}`,
    }))

    it('should return initial state with default config', () => {
        const { result } = renderHook(() => usePaginatedItems(mockItems))

        expect(result.current.paginatedItems).toHaveLength(25)
        expect(result.current.paginatedItems[0]).toEqual({
            id: 'item-0',
            title: 'Item 0',
        })
        expect(result.current.page).toBe(1)
        expect(result.current.search).toBe('')
        expect(result.current.pagination.hasNextPage).toBe(true)
        expect(result.current.pagination.hasPrevPage).toBe(false)
    })

    it('should paginate items with custom page size', () => {
        const { result } = renderHook(() =>
            usePaginatedItems(mockItems, { itemsPerPage: 10 }),
        )

        expect(result.current.paginatedItems).toHaveLength(10)
        expect(result.current.pagination.hasNextPage).toBe(true)
        expect(result.current.pagination.hasPrevPage).toBe(false)
    })

    it('should navigate to next page', () => {
        const { result } = renderHook(() =>
            usePaginatedItems(mockItems, { itemsPerPage: 10 }),
        )

        act(() => {
            result.current.pagination.onNextClick()
        })

        expect(result.current.page).toBe(2)
        expect(result.current.paginatedItems[0]).toEqual({
            id: 'item-10',
            title: 'Item 10',
        })
        expect(result.current.pagination.hasNextPage).toBe(true)
        expect(result.current.pagination.hasPrevPage).toBe(true)
    })

    it('should navigate to previous page', () => {
        const { result } = renderHook(() =>
            usePaginatedItems(mockItems, { itemsPerPage: 10 }),
        )

        act(() => {
            result.current.pagination.onNextClick()
            result.current.pagination.onNextClick()
        })

        expect(result.current.page).toBe(3)

        act(() => {
            result.current.pagination.onPrevClick()
        })

        expect(result.current.page).toBe(2)
        expect(result.current.paginatedItems[0]).toEqual({
            id: 'item-10',
            title: 'Item 10',
        })
    })

    it('should not go below page 1', () => {
        const { result } = renderHook(() =>
            usePaginatedItems(mockItems, { itemsPerPage: 10 }),
        )

        act(() => {
            result.current.pagination.onPrevClick()
        })

        expect(result.current.page).toBe(1)
    })

    it('should filter items by search term', () => {
        const items = [
            { id: '1', title: 'Apple' },
            { id: '2', title: 'Banana' },
            { id: '3', title: 'Cherry' },
            { id: '4', title: 'Date' },
            { id: '5', title: 'Elderberry' },
        ]

        const { result } = renderHook(() => usePaginatedItems(items))

        act(() => {
            result.current.setSearch('err')
        })

        expect(result.current.paginatedItems).toHaveLength(2)
        expect(result.current.paginatedItems[0]).toEqual({
            id: '3',
            title: 'Cherry',
        })
        expect(result.current.paginatedItems[1]).toEqual({
            id: '5',
            title: 'Elderberry',
        })
        expect(result.current.search).toBe('err')
    })

    it('should handle case-insensitive search', () => {
        const items = [
            { id: '1', title: 'Apple' },
            { id: '2', title: 'BANANA' },
            { id: '3', title: 'cherry' },
        ]

        const { result } = renderHook(() => usePaginatedItems(items))

        act(() => {
            result.current.setSearch('AN')
        })

        expect(result.current.paginatedItems).toHaveLength(1)
        expect(result.current.paginatedItems[0]).toEqual({
            id: '2',
            title: 'BANANA',
        })
    })

    it('should reset to page 1 when search changes', () => {
        const { result } = renderHook(() =>
            usePaginatedItems(mockItems, { itemsPerPage: 10 }),
        )

        act(() => {
            result.current.pagination.onNextClick()
            result.current.pagination.onNextClick()
        })

        expect(result.current.page).toBe(3)

        act(() => {
            result.current.setSearch('5')
        })

        expect(result.current.page).toBe(1)
        expect(result.current.search).toBe('5')
    })

    it('should return empty array when no items match search', () => {
        const items = [
            { id: '1', title: 'Apple' },
            { id: '2', title: 'Banana' },
        ]

        const { result } = renderHook(() => usePaginatedItems(items))

        act(() => {
            result.current.setSearch('xyz')
        })

        expect(result.current.paginatedItems).toHaveLength(0)
        expect(result.current.pagination.hasNextPage).toBe(false)
        expect(result.current.pagination.hasPrevPage).toBe(false)
    })

    it('should reset pagination state', () => {
        const { result } = renderHook(() =>
            usePaginatedItems(mockItems, { itemsPerPage: 10 }),
        )

        act(() => {
            result.current.setSearch('test')
            result.current.setPage(3)
        })

        expect(result.current.page).toBe(3)
        expect(result.current.search).toBe('test')

        act(() => {
            result.current.resetPagination()
        })

        expect(result.current.page).toBe(1)
        expect(result.current.search).toBe('')
    })

    it('should manually set page', () => {
        const { result } = renderHook(() =>
            usePaginatedItems(mockItems, { itemsPerPage: 10 }),
        )

        act(() => {
            result.current.setPage(5)
        })

        expect(result.current.page).toBe(5)
        expect(result.current.paginatedItems[0]).toEqual({
            id: 'item-40',
            title: 'Item 40',
        })
    })

    it('should handle empty items array', () => {
        const { result } = renderHook(() => usePaginatedItems([]))

        expect(result.current.paginatedItems).toHaveLength(0)
        expect(result.current.pagination.hasNextPage).toBe(false)
        expect(result.current.pagination.hasPrevPage).toBe(false)
        expect(result.current.page).toBe(1)
    })

    it('should handle single page of items', () => {
        const items = [
            { id: '1', title: 'Item 1' },
            { id: '2', title: 'Item 2' },
        ]

        const { result } = renderHook(() =>
            usePaginatedItems(items, { itemsPerPage: 10 }),
        )

        expect(result.current.paginatedItems).toHaveLength(2)
        expect(result.current.pagination.hasNextPage).toBe(false)
        expect(result.current.pagination.hasPrevPage).toBe(false)
    })

    it('should correctly calculate hasNextPage on last page', () => {
        const items = Array.from({ length: 30 }, (_, i) => ({
            id: `item-${i}`,
            title: `Item ${i}`,
        }))

        const { result } = renderHook(() =>
            usePaginatedItems(items, { itemsPerPage: 10 }),
        )

        act(() => {
            result.current.setPage(3)
        })

        expect(result.current.paginatedItems).toHaveLength(10)
        expect(result.current.pagination.hasNextPage).toBe(false)
        expect(result.current.pagination.hasPrevPage).toBe(true)
    })

    it('should handle items that exactly fill pages', () => {
        const items = Array.from({ length: 50 }, (_, i) => ({
            id: `item-${i}`,
            title: `Item ${i}`,
        }))

        const { result } = renderHook(() =>
            usePaginatedItems(items, { itemsPerPage: 25 }),
        )

        expect(result.current.paginatedItems).toHaveLength(25)
        expect(result.current.pagination.hasNextPage).toBe(true)

        act(() => {
            result.current.pagination.onNextClick()
        })

        expect(result.current.paginatedItems).toHaveLength(25)
        expect(result.current.pagination.hasNextPage).toBe(false)
        expect(result.current.pagination.hasPrevPage).toBe(true)
    })
})
