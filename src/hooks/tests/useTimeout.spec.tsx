import { renderHook } from '@testing-library/react-hooks'

import { useTimeout } from '../useTimeout'

describe('useTimeout', () => {
    beforeEach(() => {
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.clearAllTimers()
        jest.useRealTimers()
    })

    it('should execute callback after specified delay', () => {
        const callback = jest.fn()
        const { result } = renderHook(() => useTimeout())
        const [set] = result.current

        set(callback, 1000)

        expect(callback).not.toHaveBeenCalled()

        jest.advanceTimersByTime(1000)
        expect(callback).toHaveBeenCalledTimes(1)
    })

    it('should clear previous timeout when setting a new one', () => {
        const callback1 = jest.fn()
        const callback2 = jest.fn()
        const { result } = renderHook(() => useTimeout())
        const [set] = result.current

        set(callback1, 1000)
        set(callback2, 1000)

        jest.advanceTimersByTime(1000)

        expect(callback1).not.toHaveBeenCalled()
        expect(callback2).toHaveBeenCalledTimes(1)
    })

    it('should clear timeout when clear is called', () => {
        const callback = jest.fn()
        const { result } = renderHook(() => useTimeout())
        const [set, clear] = result.current

        set(callback, 1000)
        clear()

        jest.advanceTimersByTime(1000)
        expect(callback).not.toHaveBeenCalled()
    })

    it('should clear timeout on unmount', () => {
        const callback = jest.fn()
        const { result, unmount } = renderHook(() => useTimeout())
        const [set] = result.current

        set(callback, 1000)
        unmount()

        jest.advanceTimersByTime(1000)
        expect(callback).not.toHaveBeenCalled()
    })
})
