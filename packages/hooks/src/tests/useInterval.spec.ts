import { renderHook } from '@repo/testing/vitest'

import { useInterval } from '../useInterval'

const callback = vi.fn()

vi.useFakeTimers()

const setIntervalSpy = vi.spyOn(window, 'setInterval')
const clearIntervalSpy = vi.spyOn(window, 'clearInterval')

describe('useInterval', () => {
    beforeEach(() => {
        callback.mockClear()
        setIntervalSpy.mockClear()
        clearIntervalSpy.mockClear()
    })

    it('should init hook with default delay', () => {
        const { result } = renderHook(() => useInterval(callback))

        expect(result.current).toBeUndefined()
        expect(setIntervalSpy).toHaveBeenCalledTimes(1)
        expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 0)
    })

    it('should init hook with custom delay', () => {
        const { result } = renderHook(() => useInterval(callback, 5000))

        expect(result.current).toBeUndefined()
        expect(setIntervalSpy).toHaveBeenCalledTimes(1)
        expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 5000)
    })

    it('should init hook without delay', () => {
        const { result } = renderHook(() => useInterval(callback, null))

        expect(result.current).toBeUndefined()
        // if null delay provided, it's assumed as no delay
        expect(setIntervalSpy).not.toHaveBeenCalled()
    })

    it('should repeatedly calls provided callback with a fixed time delay between each call', () => {
        renderHook(() => useInterval(callback, 200))
        expect(callback).not.toHaveBeenCalled()

        vi.advanceTimersByTime(199)
        expect(callback).not.toHaveBeenCalled()

        vi.advanceTimersByTime(1)
        expect(callback).toHaveBeenCalledTimes(1)

        vi.advanceTimersByTime(200)
        expect(callback).toHaveBeenCalledTimes(2)

        vi.advanceTimersByTime(200)
        vi.advanceTimersByTime(200)
        vi.advanceTimersByTime(200)
        expect(callback).toHaveBeenCalledTimes(5)
    })

    it('should clear interval on unmount', () => {
        const { unmount } = renderHook(() => useInterval(callback, 200))
        const initialTimerCount = vi.getTimerCount()
        expect(clearIntervalSpy).not.toHaveBeenCalled()

        unmount()

        expect(clearIntervalSpy).toHaveBeenCalledTimes(1)
        expect(vi.getTimerCount()).toBe(initialTimerCount - 1)
    })

    it('should handle new interval when delay is updated', () => {
        const { rerender } = renderHook(
            ({ delay }) => useInterval(callback, delay),
            { initialProps: { delay: 200 } },
        )
        expect(callback).not.toHaveBeenCalled()

        vi.advanceTimersByTime(200)
        expect(callback).toHaveBeenCalledTimes(1)

        rerender({ delay: 500 })

        vi.advanceTimersByTime(200)
        expect(callback).toHaveBeenCalledTimes(1)

        vi.advanceTimersByTime(300)
        expect(callback).toHaveBeenCalledTimes(2)
    })

    it('should clear pending interval when delay is updated', () => {
        const { rerender } = renderHook(
            ({ delay }) => useInterval(callback, delay),
            { initialProps: { delay: 200 } },
        )
        expect(clearInterval).not.toHaveBeenCalled()
        const initialTimerCount = vi.getTimerCount()

        rerender({ delay: 500 })

        expect(clearInterval).toHaveBeenCalledTimes(1)
        expect(vi.getTimerCount()).toBe(initialTimerCount)
    })
})
