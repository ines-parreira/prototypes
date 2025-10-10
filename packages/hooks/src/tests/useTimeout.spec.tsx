import { renderHook } from '@repo/testing/vitest'

import { useTimeout } from '../useTimeout'

describe('useTimeout', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.clearAllTimers()
        vi.useRealTimers()
    })

    it('should execute callback after specified delay', () => {
        const callback = vi.fn()
        const { result } = renderHook(() => useTimeout())
        const [set] = result.current

        set(callback, 1000)

        expect(callback).not.toHaveBeenCalled()

        vi.advanceTimersByTime(1000)
        expect(callback).toHaveBeenCalledTimes(1)
    })

    it('should clear previous timeout when setting a new one', () => {
        const callback1 = vi.fn()
        const callback2 = vi.fn()
        const { result } = renderHook(() => useTimeout())
        const [set] = result.current

        set(callback1, 1000)
        set(callback2, 1000)

        vi.advanceTimersByTime(1000)

        expect(callback1).not.toHaveBeenCalled()
        expect(callback2).toHaveBeenCalledTimes(1)
    })

    it('should clear timeout when clear is called', () => {
        const callback = vi.fn()
        const { result } = renderHook(() => useTimeout())
        const [set, clear] = result.current

        set(callback, 1000)
        clear()

        vi.advanceTimersByTime(1000)
        expect(callback).not.toHaveBeenCalled()
    })

    it('should clear timeout on unmount', () => {
        const callback = vi.fn()
        const { result, unmount } = renderHook(() => useTimeout())
        const [set] = result.current

        set(callback, 1000)
        unmount()

        vi.advanceTimersByTime(1000)
        expect(callback).not.toHaveBeenCalled()
    })
})
