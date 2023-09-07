import {fireEvent} from '@testing-library/react'
import {act, renderHook} from '@testing-library/react-hooks'

import useScreenSize from '../useScreenSize'

describe('useScreenSize', () => {
    beforeEach(() => {
        jest.restoreAllMocks()
    })

    it('should return the current screen size', () => {
        // @ts-expect-error
        window.innerWidth = 800
        // @ts-expect-error
        window.innerHeight = 640

        const {result} = renderHook(() => useScreenSize())

        expect(result.current).toEqual([800, 640])
    })

    it('should return the updated screen size on resize', () => {
        // @ts-expect-error
        window.innerWidth = 800
        // @ts-expect-error
        window.innerHeight = 640

        const {result} = renderHook(() => useScreenSize())

        // @ts-expect-error
        window.innerWidth = 900
        // @ts-expect-error
        window.innerHeight = 700

        act(() => {
            fireEvent.resize(window)
        })

        expect(result.current).toEqual([900, 700])
    })

    it('should remove the event listener on unmount', () => {
        const {unmount} = renderHook(() => useScreenSize())

        jest.spyOn(window, 'removeEventListener')

        act(() => {
            unmount()
        })

        expect(window.removeEventListener).toHaveBeenCalled()
    })
})
