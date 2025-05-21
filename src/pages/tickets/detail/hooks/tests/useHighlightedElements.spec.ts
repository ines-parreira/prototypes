// TODO(React18): Remove act import this once we upgrade to React 18
import { act, renderHook } from 'utils/testing/renderHook'

import useHighlightedElements from '../useHighlightedElements'

describe('useHighlightedElements', () => {
    beforeEach(() => {
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('should return null by default', () => {
        const { result } = renderHook(() => useHighlightedElements())
        expect(result.current[0]).toEqual(null)
    })

    it('should return the highlighted elements range when set', () => {
        const { result } = renderHook(() => useHighlightedElements())
        act(() => {
            result.current[1]({ first: 1, last: 3 })
        })
        expect(result.current[0]).toEqual({ first: 1, last: 3 })
    })

    it('should automatically reset the highlighted elements after 1 second', () => {
        const { result } = renderHook(() => useHighlightedElements())
        act(() => {
            result.current[1]({ first: 1, last: 3 })
        })
        jest.advanceTimersByTime(999)
        expect(result.current[0]).toEqual({ first: 1, last: 3 })

        act(() => {
            jest.advanceTimersByTime(1)
        })
        expect(result.current[0]).toEqual(null)
    })
})
