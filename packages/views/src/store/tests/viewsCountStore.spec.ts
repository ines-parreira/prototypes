import { act, renderHook } from '@testing-library/react'

import {
    clearViewsCount,
    getViewCount,
    setViewsCount,
    useViewCount,
    viewsCountStore,
} from '../viewsCountStore'

vi.mock('@repo/browser-storage', () => ({
    localForageManager: {
        getTable: vi.fn(() => ({
            getItem: vi.fn().mockResolvedValue(null),
            setItem: vi.fn().mockResolvedValue(undefined),
            removeItem: vi.fn().mockResolvedValue(undefined),
        })),
    },
}))

beforeEach(() => {
    clearViewsCount()
})

describe('setViewsCount', () => {
    it('sets counts on the store', () => {
        setViewsCount({ 1: 10, 2: 20 })

        expect(viewsCountStore.getState().counts).toEqual({ 1: 10, 2: 20 })
    })

    it('merges with existing counts', () => {
        setViewsCount({ 1: 10 })
        setViewsCount({ 2: 20 })

        expect(viewsCountStore.getState().counts).toEqual({ 1: 10, 2: 20 })
    })

    it('overwrites existing counts for the same view', () => {
        setViewsCount({ 1: 10 })
        setViewsCount({ 1: 42 })

        expect(viewsCountStore.getState().counts).toEqual({ 1: 42 })
    })
})

describe('useViewCount', () => {
    it('returns undefined when no count exists for the view', () => {
        const { result } = renderHook(() => useViewCount(999))

        expect(result.current).toBeUndefined()
    })

    it('returns the count for a given view', () => {
        setViewsCount({ 5: 50 })

        const { result } = renderHook(() => useViewCount(5))

        expect(result.current).toBe(50)
    })

    it('reacts to count updates', () => {
        const { result } = renderHook(() => useViewCount(3))

        expect(result.current).toBeUndefined()

        act(() => {
            setViewsCount({ 3: 30 })
        })

        expect(result.current).toBe(30)
    })

    it('returns zero for a zero count', () => {
        setViewsCount({ 7: 0 })

        const { result } = renderHook(() => useViewCount(7))

        expect(result.current).toBe(0)
    })
})

describe('getViewCount', () => {
    it('returns undefined when no count exists', () => {
        expect(getViewCount(999)).toBeUndefined()
    })

    it('returns the count for a given view', () => {
        setViewsCount({ 5: 50 })

        expect(getViewCount(5)).toBe(50)
    })

    it('returns zero for a zero count', () => {
        setViewsCount({ 7: 0 })

        expect(getViewCount(7)).toBe(0)
    })
})

describe('clearViewsCount', () => {
    it('clears all counts', () => {
        setViewsCount({ 1: 10, 2: 20 })

        clearViewsCount()

        expect(viewsCountStore.getState().counts).toEqual({})
    })
})

describe('viewsCountStore persistence', () => {
    it('can clear persisted storage', async () => {
        setViewsCount({ 1: 10 })

        await viewsCountStore.persist.clearStorage()

        expect(viewsCountStore.getState().counts).toEqual({ 1: 10 })
    })
})
