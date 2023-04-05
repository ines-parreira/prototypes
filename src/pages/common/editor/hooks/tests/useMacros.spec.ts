import {act, renderHook} from '@testing-library/react-hooks'

import useMacros from '../useMacros'

describe('useMacros', () => {
    it('should return the default state', () => {
        const {result} = renderHook(() => useMacros())

        expect(result.current).toEqual({
            hasShown: false,
            isActive: false,
            onChangeActive: expect.any(Function),
        })
    })

    it('should set active and shown to true on toggle', () => {
        const {result} = renderHook(() => useMacros())

        act(() => {
            result.current.onChangeActive()
        })

        expect(result.current).toEqual(
            expect.objectContaining({
                isActive: true,
                hasShown: true,
            })
        )
    })

    it('should not change the state if the same value is passed to the toggle function', () => {
        const {result} = renderHook(() => useMacros())

        act(() => {
            result.current.onChangeActive(false)
        })

        expect(result.current).toEqual(
            expect.objectContaining({
                isActive: false,
                hasShown: false,
            })
        )
    })

    it('should not set shown to false if active is changed back to false', () => {
        const {result} = renderHook(() => useMacros())

        act(() => {
            result.current.onChangeActive()
        })
        act(() => {
            result.current.onChangeActive()
        })

        expect(result.current).toEqual(
            expect.objectContaining({
                isActive: false,
                hasShown: true,
            })
        )
    })
})
