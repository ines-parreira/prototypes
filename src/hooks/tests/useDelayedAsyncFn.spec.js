//@flow
import {act, renderHook} from 'react-hooks-testing-library'

import useDelayedAsyncFn from '../useDelayedAsyncFn'

jest.useFakeTimers()

describe('useDelayedAsyncFn hook', () => {
    it('is not loading when resolved before delay', (done) => {
        const mockAsync = () => Promise.resolve()
        const {result} = renderHook(() => useDelayedAsyncFn(mockAsync, [], 200))

        expect(result.current[0].loading).toBe(false)
        act(() => {
            result.current[1]()
        })
        setImmediate(() => {
            expect(result.current[0].loading).toBe(false)
            done()
        })
    })

    it('is loading after delay', () => {
        const mockAsync = () => new Promise(() => null)
        const {result} = renderHook(() => useDelayedAsyncFn(mockAsync, [], 200))

        expect(result.current[0].loading).toBe(false)
        act(() => {
            result.current[1]()
        })
        jest.runAllTimers()
        expect(result.current[0].loading).toBe(true)
    })
})
