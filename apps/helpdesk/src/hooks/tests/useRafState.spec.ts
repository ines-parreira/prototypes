import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import { mockRequestAnimationFrame } from 'utils/testing'

import useRafState from '../useRafState'

const rafControl = mockRequestAnimationFrame()

jest.spyOn(window, 'cancelAnimationFrame')

describe('useRafState', () => {
    beforeEach(() => {
        rafControl.clear()
    })

    it('should only update state after requestAnimationFrame when providing an object', () => {
        const { result } = renderHook(() => useRafState(0))

        act(() => {
            result.current[1](1)
        })
        expect(result.current[0]).toBe(0)

        act(() => {
            rafControl.run()
        })
        expect(result.current[0]).toBe(1)

        act(() => {
            result.current[1](2)
            rafControl.run()
        })
        expect(result.current[0]).toBe(2)

        act(() => {
            result.current[1]((prevState) => prevState * 2)
            rafControl.run()
        })
        expect(result.current[0]).toBe(4)
    })

    it('should only update state after requestAnimationFrame when providing a function', () => {
        const { result } = renderHook(() => useRafState(0))

        act(() => {
            result.current[1]((prevState) => prevState + 1)
        })
        expect(result.current[0]).toBe(0)

        act(() => {
            rafControl.run()
        })
        expect(result.current[0]).toBe(1)

        act(() => {
            result.current[1]((prevState) => prevState * 3)
            rafControl.run()
        })
        expect(result.current[0]).toBe(3)
    })

    it('should cancel update state on unmount', () => {
        const { unmount } = renderHook(() => useRafState(0))

        expect(cancelAnimationFrame).not.toHaveBeenCalled()

        unmount()

        expect(cancelAnimationFrame).toHaveBeenCalledTimes(1)
    })
})
