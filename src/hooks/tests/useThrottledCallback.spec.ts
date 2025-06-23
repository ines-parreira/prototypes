import noop from 'lodash/noop'

import { renderHook } from 'utils/testing/renderHook'

import useThrottledCallback from '../useThrottledCallback'

jest.useFakeTimers()

describe('useThrottledCallback', () => {
    it('should render', () => {
        expect(() =>
            renderHook(() => {
                useThrottledCallback(noop, 200)
            }),
        ).not.toThrow()
    })

    it('should return function same length and wrapped name', () => {
        let { result } = renderHook(() =>
            useThrottledCallback(
                (a: number, b: number, c: number) => a + b + c,
                200,
            ),
        )

        expect(result.current.length).toBe(3)
        expect(result.current.name).toBe(`anonymous__throttled__200`)

        function namedFunction(a: number, b: number, c: number) {
            return a + b + c
        }
        result = renderHook(() =>
            useThrottledCallback(namedFunction, 100),
        ).result

        expect(result.current.length).toBe(3)
        expect(result.current.name).toBe(`namedFunction__throttled__100`)
    })

    it('should return a new callback if delay is changed', () => {
        const { result, rerender } = renderHook(
            ({ delay }) => useThrottledCallback(noop, delay),
            {
                initialProps: { delay: 200 },
            },
        )

        const cb1 = result.current
        rerender({ delay: 123 })

        expect(cb1).not.toBe(result.current)
    })

    it('should return a new callback if the passed callback has changed', () => {
        const initialCallback = noop

        const { result, rerender } = renderHook(
            ({ callback }) => useThrottledCallback(callback, 200),
            {
                initialProps: { callback: initialCallback },
            },
        )
        const initialResult = result.current

        rerender({ callback: initialCallback })

        expect(result.current).toBe(initialResult)

        rerender({ callback: () => void 0 })

        expect(result.current).not.toBe(initialCallback)
    })

    it('should invoke given callback immediately', () => {
        const cb = jest.fn()
        const { result } = renderHook(() => useThrottledCallback(cb, 200))

        result.current()
        expect(cb).toHaveBeenCalledTimes(1)
    })

    it('should pass parameters to callback', () => {
        const cb = jest.fn(noop)
        const { result } = renderHook(() => useThrottledCallback(cb, 200))

        result.current(1, 'abc')
        expect(cb).toHaveBeenCalledWith(1, 'abc')
    })

    it('should ignore consequential calls occurred within delay, but execute last call after delay is passed', () => {
        const cb = jest.fn()
        const { result } = renderHook(() => useThrottledCallback(cb, 200))

        result.current()
        result.current()
        result.current()
        result.current()
        expect(cb).toHaveBeenCalledTimes(1)
        jest.advanceTimersByTime(199)
        result.current()
        expect(cb).toHaveBeenCalledTimes(1)
        jest.advanceTimersByTime(1)
        expect(cb).toHaveBeenCalledTimes(2)
        result.current()
        expect(cb).toHaveBeenCalledTimes(2)
        jest.advanceTimersByTime(200)
        expect(cb).toHaveBeenCalledTimes(3)
    })

    it('should drop trailing execution if `noTrailing is set to true`', () => {
        const cb = jest.fn()
        const { result } = renderHook(() => useThrottledCallback(cb, 200, true))

        result.current()
        result.current()
        result.current()
        result.current()
        expect(cb).toHaveBeenCalledTimes(1)
        jest.advanceTimersByTime(199)
        result.current()
        expect(cb).toHaveBeenCalledTimes(1)
        jest.advanceTimersByTime(1)
        expect(cb).toHaveBeenCalledTimes(1)
        result.current()
        result.current()
        result.current()
        expect(cb).toHaveBeenCalledTimes(2)
        jest.advanceTimersByTime(200)
        expect(cb).toHaveBeenCalledTimes(2)
    })
})
