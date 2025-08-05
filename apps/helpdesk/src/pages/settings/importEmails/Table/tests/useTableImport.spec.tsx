import { act, renderHook } from '@testing-library/react'

import { OrderDirection } from 'models/api/types'

import { useTableImport } from '../useTableImport'

describe('useTableImport', () => {
    describe('Initial State', () => {
        it('initializes with correct default values', () => {
            const { result } = renderHook(() => useTableImport())

            expect(result.current.tableProps.sortOrder).toBe(OrderDirection.Asc)
            expect(result.current.tableProps.isLoading).toBe(false)
        })

        it('provides all required functions', () => {
            const { result } = renderHook(() => useTableImport())

            expect(typeof result.current.tableProps.handleSortToggle).toBe(
                'function',
            )
            expect(typeof result.current.tableProps.fetchNextItems).toBe(
                'function',
            )
            expect(typeof result.current.tableProps.fetchPrevItems).toBe(
                'function',
            )
        })
    })

    describe('Sorting Functionality', () => {
        it('toggles sort order from ascending to descending', () => {
            const { result } = renderHook(() => useTableImport())

            expect(result.current.tableProps.sortOrder).toBe(OrderDirection.Asc)

            act(() => {
                result.current.tableProps.handleSortToggle()
            })

            expect(result.current.tableProps.sortOrder).toBe(
                OrderDirection.Desc,
            )
        })

        it('toggles sort order from descending to ascending', () => {
            const { result } = renderHook(() => useTableImport())

            act(() => {
                result.current.tableProps.handleSortToggle()
            })
            expect(result.current.tableProps.sortOrder).toBe(
                OrderDirection.Desc,
            )

            act(() => {
                result.current.tableProps.handleSortToggle()
            })
            expect(result.current.tableProps.sortOrder).toBe(OrderDirection.Asc)
        })

        it('sorts import list in ascending order by email', () => {
            const { result } = renderHook(() => useTableImport())

            const emails = result.current.tableProps.importList.map(
                (item) => item.email,
            )
            const sortedEmails = [...emails].sort()

            expect(emails).toEqual(sortedEmails)
        })

        it('sorts import list in descending order by email', () => {
            const { result } = renderHook(() => useTableImport())

            act(() => {
                result.current.tableProps.handleSortToggle()
            })

            const emails = result.current.tableProps.importList.map(
                (item) => item.email,
            )
            const sortedEmails = [...emails].sort().reverse()

            expect(emails).toEqual(sortedEmails)
        })
    })

    describe('Pagination Functionality', () => {
        it('returns first 8 items on initial page', () => {
            const { result } = renderHook(() => useTableImport())

            expect(result.current.tableProps.importList).toHaveLength(8)
        })

        it('increments page when fetchNextItems is called', () => {
            const { result } = renderHook(() => useTableImport())

            const initialFirstEmail =
                result.current.tableProps.importList[0].email

            act(() => {
                result.current.tableProps.fetchNextItems()
            })

            const newFirstEmail = result.current.tableProps.importList[0].email
            expect(newFirstEmail).not.toBe(initialFirstEmail)
        })

        it('decrements page when fetchPrevItems is called', () => {
            const { result } = renderHook(() => useTableImport())

            const initialFirstEmail =
                result.current.tableProps.importList[0].email

            act(() => {
                result.current.tableProps.fetchNextItems()
            })

            act(() => {
                result.current.tableProps.fetchPrevItems()
            })

            const finalFirstEmail =
                result.current.tableProps.importList[0].email
            expect(finalFirstEmail).toBe(initialFirstEmail)
        })

        it('returns correct page size by default', () => {
            const { result } = renderHook(() => useTableImport())
            expect(result.current.tableProps.importList).toHaveLength(8)
        })
    })

    describe('Computed Values', () => {
        it('calculates hasNextItems correctly when there are more items', () => {
            const { result } = renderHook(() => useTableImport())

            // With 16 items and pageSize 8, should have next items on page 1
            expect(result.current.tableProps.hasNextItems).toBe(true)
        })

        it('calculates hasNextItems correctly when there are no more items', () => {
            const { result } = renderHook(() => useTableImport())

            // Navigate to page 2 first
            act(() => {
                result.current.tableProps.fetchNextItems()
            })

            // On page 2 with 16 items and pageSize 8, should have no next items
            expect(result.current.tableProps.hasNextItems).toBe(false)
        })

        it('calculates hasPrevItems correctly on first page', () => {
            const { result } = renderHook(() => useTableImport())

            expect(result.current.tableProps.hasPrevItems).toBe(false)
        })

        it('calculates hasPrevItems correctly on subsequent pages', () => {
            const { result } = renderHook(() => useTableImport())

            act(() => {
                result.current.tableProps.fetchNextItems()
            })

            expect(result.current.tableProps.hasPrevItems).toBe(true)
        })

        it('returns correct number of items on last page', () => {
            const { result } = renderHook(() => useTableImport())

            act(() => {
                result.current.tableProps.fetchNextItems()
            })

            // Page 2 with 16 items and pageSize 8 should have 8 items
            expect(result.current.tableProps.importList).toHaveLength(8)
        })

        it('returns correct items with fixed page size', () => {
            const { result } = renderHook(() => useTableImport())

            // Should return 8 items with fixed pageSize of 8
            expect(result.current.tableProps.importList).toHaveLength(8)
        })
    })

    describe('Integration Tests', () => {
        it('maintains sorting when navigating between pages', () => {
            const { result } = renderHook(() => useTableImport())

            // Set to descending order
            act(() => {
                result.current.tableProps.handleSortToggle()
            })

            const page1Emails = result.current.tableProps.importList.map(
                (item) => item.email,
            )

            // Navigate to next page
            act(() => {
                result.current.tableProps.fetchNextItems()
            })

            const page2Emails = result.current.tableProps.importList.map(
                (item) => item.email,
            )

            // Both pages should maintain descending order
            expect(page1Emails).toEqual([...page1Emails].sort().reverse())
            expect(page2Emails).toEqual([...page2Emails].sort().reverse())
        })

        it('maintains sort order when navigating pages', () => {
            const { result } = renderHook(() => useTableImport())

            act(() => {
                result.current.tableProps.handleSortToggle()
            })

            expect(result.current.tableProps.sortOrder).toBe(
                OrderDirection.Desc,
            )

            act(() => {
                result.current.tableProps.fetchNextItems()
            })

            expect(result.current.tableProps.sortOrder).toBe(
                OrderDirection.Desc,
            )
        })

        it('maintains consistent importList length', () => {
            const { result } = renderHook(() => useTableImport())

            const initialLength = result.current.tableProps.importList.length
            expect(result.current.tableProps.importList.length).toBe(8)
            expect(initialLength).toBe(8)
        })

        it('provides correct navigation flags on first page', () => {
            const { result } = renderHook(() => useTableImport())

            // On first page with pageSize 8 and 16 items, should have next items but no prev items
            expect(result.current.tableProps.hasNextItems).toBe(true)
            expect(result.current.tableProps.hasPrevItems).toBe(false)
        })
    })

    describe('Edge Cases', () => {
        it('handles first page correctly', () => {
            const { result } = renderHook(() => useTableImport())

            expect(result.current.tableProps.importList).toHaveLength(8)
            expect(result.current.tableProps.hasNextItems).toBe(true)
            expect(result.current.tableProps.hasPrevItems).toBe(false)
        })

        it('handles fixed page size correctly', () => {
            const { result } = renderHook(() => useTableImport())

            expect(result.current.tableProps.importList).toHaveLength(8)
            expect(result.current.tableProps.hasNextItems).toBe(true)
        })

        it('handles second page correctly', () => {
            const { result } = renderHook(() => useTableImport())

            // Navigate to second page
            act(() => {
                result.current.tableProps.fetchNextItems()
            })

            expect(result.current.tableProps.importList).toHaveLength(8)
            expect(result.current.tableProps.hasNextItems).toBe(false)
            expect(result.current.tableProps.hasPrevItems).toBe(true)
        })
    })
})
