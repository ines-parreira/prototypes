import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import { useMinDisplayTime } from './useMinDisplayTime'

describe('useMinDisplayTime', () => {
    beforeEach(() => {
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.runOnlyPendingTimers()
        jest.useRealTimers()
    })

    it('returns false when active starts false', () => {
        const { result } = renderHook(() => useMinDisplayTime(false, 100))

        expect(result.current).toBe(false)
    })

    it('returns true immediately when active starts true', () => {
        const { result } = renderHook(() => useMinDisplayTime(true, 100))

        expect(result.current).toBe(true)
    })

    it('keeps returning true for the minimum duration after active flips false', () => {
        const { result, rerender } = renderHook(
            ({ active }: { active: boolean }) => useMinDisplayTime(active, 100),
            { initialProps: { active: true } },
        )

        expect(result.current).toBe(true)

        // Active flips false almost immediately
        act(() => {
            jest.advanceTimersByTime(20)
        })
        rerender({ active: false })

        // Still held: 100 - 20 = 80ms remaining
        expect(result.current).toBe(true)

        act(() => {
            jest.advanceTimersByTime(79)
        })
        expect(result.current).toBe(true)

        act(() => {
            jest.advanceTimersByTime(1)
        })
        expect(result.current).toBe(false)
    })

    it('flips to false immediately when active turns off after the minimum duration', () => {
        const { result, rerender } = renderHook(
            ({ active }: { active: boolean }) => useMinDisplayTime(active, 100),
            { initialProps: { active: true } },
        )

        act(() => {
            jest.advanceTimersByTime(150)
        })

        rerender({ active: false })
        expect(result.current).toBe(false)
    })

    it('restarts the hold window when active flips back on while held', () => {
        const { result, rerender } = renderHook(
            ({ active }: { active: boolean }) => useMinDisplayTime(active, 100),
            { initialProps: { active: true } },
        )

        act(() => {
            jest.advanceTimersByTime(50)
        })
        rerender({ active: false })

        // Held with 50ms remaining
        act(() => {
            jest.advanceTimersByTime(30)
        })
        expect(result.current).toBe(true)

        // Active comes back: hold should reset
        rerender({ active: true })
        expect(result.current).toBe(true)

        rerender({ active: false })

        // 100ms required again from the latest start
        act(() => {
            jest.advanceTimersByTime(99)
        })
        expect(result.current).toBe(true)

        act(() => {
            jest.advanceTimersByTime(1)
        })
        expect(result.current).toBe(false)
    })

    it('cancels the pending release on unmount', () => {
        const { result, rerender, unmount } = renderHook(
            ({ active }: { active: boolean }) => useMinDisplayTime(active, 100),
            { initialProps: { active: true } },
        )

        rerender({ active: false })
        expect(result.current).toBe(true)

        unmount()

        expect(() => {
            jest.advanceTimersByTime(200)
        }).not.toThrow()
    })
})
