import { renderHook } from '@repo/testing/vitest'
import noop from 'lodash/noop'

import { useDebouncedCallback } from '../useDebouncedCallback'

vi.useFakeTimers()

describe('useDebouncedCallback', () => {
    it('should render', () => {
        expect(() =>
            renderHook(() => useDebouncedCallback(noop, 200)),
        ).not.toThrow()
    })

    it('should return function same length and wrapped name', () => {
        let { result } = renderHook(() =>
            useDebouncedCallback(
                (a: number, b: number, c: number) => a + b + c,
                200,
            ),
        )

        expect(result.current.length).toBe(3)
        expect(result.current.name).toBe(`anonymous__debounced__200`)

        function namedFunction(a: number, b: number, c: number) {
            return a + b + c
        }
        result = renderHook(() =>
            useDebouncedCallback(namedFunction, 100),
        ).result

        expect(result.current.length).toBe(3)
        expect(result.current.name).toBe(`namedFunction__debounced__100`)
    })

    it('should return new callback if delay is changed', () => {
        const { result, rerender } = renderHook(
            ({ delay }) => useDebouncedCallback(noop, delay),
            {
                initialProps: { delay: 200 },
            },
        )

        const cb1 = result.current
        rerender({ delay: 123 })

        expect(cb1).not.toBe(result.current)
    })

    it('should run given callback only after specified delay since last call', () => {
        const cb = vi.fn()
        const { result } = renderHook(() => useDebouncedCallback(cb, 200))

        result.current()
        expect(cb).not.toHaveBeenCalled()

        vi.advanceTimersByTime(100)
        result.current()

        vi.advanceTimersByTime(199)
        expect(cb).not.toHaveBeenCalled()

        vi.advanceTimersByTime(1)
        expect(cb).toHaveBeenCalledTimes(1)
    })

    it('should pass parameters to callback', () => {
        const cb = vi.fn(noop)
        const { result } = renderHook(() => useDebouncedCallback(cb, 200))

        result.current(1, 'abc')
        vi.advanceTimersByTime(200)
        expect(cb).toHaveBeenCalledWith(1, 'abc')
    })

    it('should cancel previously scheduled call if parameters changed', () => {
        const callback = vi.fn(noop)
        const changedCallback = vi.fn(noop)

        const { result, rerender } = renderHook(
            ({ callback }) => useDebouncedCallback(callback, 200),
            { initialProps: { callback } },
        )

        result.current()
        vi.advanceTimersByTime(100)

        rerender({ callback: changedCallback })
        result.current()
        vi.advanceTimersByTime(200)

        expect(callback).not.toHaveBeenCalled()
        expect(changedCallback).toHaveBeenCalledTimes(1)
    })

    it('should cancel debounce execution after component unmount', () => {
        const cb = vi.fn()

        const { result, unmount } = renderHook(() =>
            useDebouncedCallback(cb, 150, 200),
        )

        result.current()
        expect(cb).not.toHaveBeenCalled()
        vi.advanceTimersByTime(149)
        expect(cb).not.toHaveBeenCalled()
        unmount()
        vi.advanceTimersByTime(100)
        expect(cb).not.toHaveBeenCalled()
    })

    it('should force execute callback after maxWait milliseconds', () => {
        const cb = vi.fn()

        const { result } = renderHook(() => useDebouncedCallback(cb, 150, 200))

        result.current()
        expect(cb).not.toHaveBeenCalled()
        vi.advanceTimersByTime(149)
        result.current()
        expect(cb).not.toHaveBeenCalled()
        vi.advanceTimersByTime(50)
        expect(cb).not.toHaveBeenCalled()
        vi.advanceTimersByTime(1)
        expect(cb).toHaveBeenCalledTimes(1)
    })

    it('should not execute callback twice if maxWait equals delay', () => {
        const cb = vi.fn()

        const { result } = renderHook(() => useDebouncedCallback(cb, 200, 200))

        result.current()
        expect(cb).not.toHaveBeenCalled()
        vi.advanceTimersByTime(200)
        expect(cb).toHaveBeenCalledTimes(1)
    })
})
