import { renderHook } from '@repo/testing/vitest'
import { act } from '@testing-library/react'

import { useDelayedAsyncFn } from '../useDelayedAsyncFn'

vi.useFakeTimers()

describe('useDelayedAsyncFn hook', () => {
    it('should not be loading when resolved before delay', () => {
        const mockAsync = () => Promise.resolve()
        const { result } = renderHook(() =>
            useDelayedAsyncFn(mockAsync, [], 200),
        )

        expect(result.current[0].loading).toBe(false)
        act(() => {
            void result.current[1]()
        })
        expect(result.current[0].loading).toBe(false)
    })

    it('should be loading after delay', () => {
        const mockAsync = () => new Promise(() => null)
        const { result } = renderHook(() =>
            useDelayedAsyncFn(mockAsync, [], 200),
        )

        expect(result.current[0].loading).toBe(false)
        act(() => {
            void result.current[1]()
        })
        act(() => {
            vi.runAllTimers()
        })
        expect(result.current[0].loading).toBe(true)
    })

    it('should not set loading to true if async call is not pending', () => {
        const mockAsync = () =>
            new Promise((resolve) => setTimeout(resolve, 100))
        const { result } = renderHook(() =>
            useDelayedAsyncFn(mockAsync, [], 200),
        )

        expect(result.current[0].loading).toBe(false)
        act(() => {
            void result.current[1]()
        })
        act(() => {
            vi.advanceTimersByTime(100)
        })
        expect(result.current[0].loading).toBe(false)
    })

    it('should clear the previous timeout on a new function call', () => {
        const mockAsync = () =>
            new Promise((resolve) => setTimeout(resolve, 200))
        const { result } = renderHook(() =>
            useDelayedAsyncFn(mockAsync, [], 100),
        )

        act(() => {
            void result.current[1]()
            vi.advanceTimersByTime(50)
        })
        expect(result.current[0].loading).toBe(false)
        act(() => {
            void result.current[1]()
            vi.advanceTimersByTime(50)
        })
        expect(result.current[0].loading).toBe(false)
    })
})
