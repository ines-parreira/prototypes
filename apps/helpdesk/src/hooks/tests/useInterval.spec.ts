import { renderHook } from '@repo/testing'

import useInterval from 'hooks/useInterval'

const callback = jest.fn()

jest.useFakeTimers({ advanceTimers: true })

const setIntervalSpy = jest.spyOn(window, 'setInterval')
const clearIntervalSpy = jest.spyOn(window, 'clearInterval')

describe('useInterval', () => {
    beforeEach(() => {
        callback.mockRestore()
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

        jest.advanceTimersByTime(199)
        expect(callback).not.toHaveBeenCalled()

        jest.advanceTimersByTime(1)
        expect(callback).toHaveBeenCalledTimes(1)

        jest.advanceTimersToNextTimer()
        expect(callback).toHaveBeenCalledTimes(2)

        jest.advanceTimersToNextTimer(3)
        expect(callback).toHaveBeenCalledTimes(5)
    })

    it('should clear interval on unmount', () => {
        const { unmount } = renderHook(() => useInterval(callback, 200))
        const initialTimerCount = jest.getTimerCount()
        expect(clearIntervalSpy).not.toHaveBeenCalled()

        unmount()

        expect(clearIntervalSpy).toHaveBeenCalledTimes(1)
        expect(jest.getTimerCount()).toBe(initialTimerCount - 1)
    })

    it('should handle new interval when delay is updated', () => {
        const { rerender } = renderHook(
            ({ delay }) => useInterval(callback, delay),
            { initialProps: { delay: 200 } },
        )
        expect(callback).not.toHaveBeenCalled()

        jest.advanceTimersByTime(200)
        expect(callback).toHaveBeenCalledTimes(1)

        rerender({ delay: 500 })

        jest.advanceTimersByTime(200)
        expect(callback).toHaveBeenCalledTimes(1)

        jest.advanceTimersByTime(300)
        expect(callback).toHaveBeenCalledTimes(2)
    })

    it('should clear pending interval when delay is updated', () => {
        const { rerender } = renderHook(
            ({ delay }) => useInterval(callback, delay),
            { initialProps: { delay: 200 } },
        )
        expect(clearInterval).not.toHaveBeenCalled()
        const initialTimerCount = jest.getTimerCount()

        rerender({ delay: 500 })

        expect(clearInterval).toHaveBeenCalledTimes(1)
        expect(jest.getTimerCount()).toBe(initialTimerCount)
    })
})
