import { act, renderHook } from '@testing-library/react-hooks'

import useSelectedIndex from '../useSelectedIndex'

describe('useSelectedIndex', () => {
    it('should return -1 by default', () => {
        const { result } = renderHook(() => useSelectedIndex(2))
        expect(result.current.index).toBe(-1)
    })

    it('should increment when calling `next`', () => {
        const { result } = renderHook(() => useSelectedIndex(2))

        act(() => {
            result.current.next()
        })
        act(() => {
            result.current.next()
        })
        expect(result.current.index).toBe(1)
    })

    it('should stay at max if the max is reached and looping is not enabled', () => {
        const { result } = renderHook(() => useSelectedIndex(2))

        act(() => {
            result.current.next()
        })
        act(() => {
            result.current.next()
        })
        act(() => {
            result.current.next()
        })
        expect(result.current.index).toBe(2)

        act(() => {
            result.current.next()
        })
        expect(result.current.index).toBe(2)
    })

    it('should go back to 0 if the max is reached while looping is enabled', () => {
        const { result } = renderHook(() => useSelectedIndex(2, { loop: true }))

        act(() => {
            result.current.next()
        })
        act(() => {
            result.current.next()
        })
        act(() => {
            result.current.next()
        })
        expect(result.current.index).toBe(2)

        act(() => {
            result.current.next()
        })
        expect(result.current.index).toBe(0)
    })

    it('should decrement when calling `previous`', () => {
        const { result } = renderHook(() => useSelectedIndex(2))

        act(() => {
            result.current.next()
        })
        act(() => {
            result.current.next()
        })
        act(() => {
            result.current.previous()
        })
        expect(result.current.index).toBe(0)
    })

    it('should stay at 0 if 0 is reached while looping is not enabled', () => {
        const { result } = renderHook(() => useSelectedIndex(2))

        act(() => {
            result.current.next()
        })
        expect(result.current.index).toBe(0)

        act(() => {
            result.current.previous()
        })
        expect(result.current.index).toBe(0)
    })

    it('should go to max when 0 is reached while looping is enabled', () => {
        const { result } = renderHook(() => useSelectedIndex(2, { loop: true }))

        act(() => {
            result.current.next()
        })
        expect(result.current.index).toBe(0)

        act(() => {
            result.current.previous()
        })
        expect(result.current.index).toBe(2)
    })

    it('should reset to -1 when calling `reset`', () => {
        const { result } = renderHook(() => useSelectedIndex(2))

        act(() => {
            result.current.next()
        })
        expect(result.current.index).toBe(0)

        act(() => {
            result.current.reset()
        })
        expect(result.current.index).toBe(-1)
    })

    it('should set the index to the given one when calling `setIndex`', () => {
        const { result } = renderHook(() => useSelectedIndex(2))
        act(() => {
            result.current.setIndex(2)
        })
        expect(result.current.index).toBe(2)
    })
})
