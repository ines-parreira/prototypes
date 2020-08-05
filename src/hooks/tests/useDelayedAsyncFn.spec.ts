import {act, renderHook} from 'react-hooks-testing-library'

import useDelayedAsyncFn from '../useDelayedAsyncFn'

jest.useFakeTimers()

describe('useDelayedAsyncFn hook', () => {
    it('should not be loading when resolved before delay', (done) => {
        const mockAsync = () => Promise.resolve()
        const {result} = renderHook(() => useDelayedAsyncFn(mockAsync, [], 200))

        expect(result.current[0].loading).toBe(false)
        act(() => {
            void result.current[1]()
        })
        setImmediate(() => {
            expect(result.current[0].loading).toBe(false)
            done()
        })
    })

    it('should be loading after delay', () => {
        const mockAsync = () => new Promise(() => null)
        const {result} = renderHook(() => useDelayedAsyncFn(mockAsync, [], 200))

        expect(result.current[0].loading).toBe(false)
        act(() => {
            void result.current[1]()
        })
        jest.runAllTimers()
        expect(result.current[0].loading).toBe(true)
    })

    it('should not set loading to true if async call is not pending', async () => {
        const mockAsync = () =>
            new Promise((resolve) => setTimeout(resolve, 100))
        const {result, waitForNextUpdate} = renderHook(() =>
            useDelayedAsyncFn(mockAsync, [], 200)
        )

        expect(result.current[0].loading).toBe(false)
        act(() => {
            void result.current[1]()
        })
        jest.advanceTimersByTime(100)
        await waitForNextUpdate()
        jest.advanceTimersByTime(100)
        expect(result.current[0].loading).toBe(false)
    })

    it('should clear the previous timeout on a new function call', () => {
        const mockAsync = () =>
            new Promise((resolve) => setTimeout(resolve, 200))
        const {result} = renderHook(() => useDelayedAsyncFn(mockAsync, [], 100))

        act(() => {
            void result.current[1]()
        })
        jest.advanceTimersByTime(50)
        expect(result.current[0].loading).toBe(false)
        act(() => {
            void result.current[1]()
        })
        jest.advanceTimersByTime(50)
        expect(result.current[0].loading).toBe(false)
    })
})
