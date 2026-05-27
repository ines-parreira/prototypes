import { act, renderHook } from '@repo/testing'

import type { StoreWorkflowsConfiguration } from 'pages/aiAgent/actions/types'

import { usePaginatedActions } from '../usePaginatedActions'

const make = (id: number): StoreWorkflowsConfiguration =>
    ({ id: String(id), name: `Action ${id}` }) as StoreWorkflowsConfiguration

describe('usePaginatedActions()', () => {
    it('returns the first page of items', () => {
        const actions = Array.from({ length: 50 }, (_, idx) => make(idx))
        const { result } = renderHook(() => usePaginatedActions(actions, 14))
        expect(result.current.page).toBe(1)
        expect(result.current.pageSize).toBe(14)
        expect(result.current.totalPages).toBe(4)
        expect(result.current.pageActions).toHaveLength(14)
        expect(result.current.pageActions[0]?.id).toBe('0')
    })

    it('advances pages', () => {
        const actions = Array.from({ length: 30 }, (_, idx) => make(idx))
        const { result } = renderHook(() => usePaginatedActions(actions, 14))
        act(() => result.current.setPage(2))
        expect(result.current.pageActions[0]?.id).toBe('14')
        expect(result.current.pageActions).toHaveLength(14)
    })

    it('resets to page 1 when page size changes', () => {
        const actions = Array.from({ length: 30 }, (_, idx) => make(idx))
        const { result } = renderHook(() => usePaginatedActions(actions, 14))
        act(() => result.current.setPage(2))
        act(() => result.current.setPageSize(25))
        expect(result.current.page).toBe(1)
        expect(result.current.pageSize).toBe(25)
    })

    it('clamps the current page when the dataset shrinks', () => {
        const big = Array.from({ length: 30 }, (_, idx) => make(idx))
        const { result, rerender } = renderHook(
            ({ data }) => usePaginatedActions(data, 14),
            { initialProps: { data: big } },
        )
        act(() => result.current.setPage(3))
        rerender({ data: big.slice(0, 5) })
        expect(result.current.page).toBe(1)
        expect(result.current.totalPages).toBe(1)
    })
})
