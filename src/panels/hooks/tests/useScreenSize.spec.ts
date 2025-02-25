import { fireEvent } from '@testing-library/react'
import { act, renderHook } from '@testing-library/react-hooks'

import useScreenSize from '../useScreenSize'

describe('useScreenSize', () => {
    beforeEach(() => {
        jest.restoreAllMocks()
    })

    it('should return the current screen size', () => {
        global.innerWidth = 800
        global.innerHeight = 640

        const { result } = renderHook(() => useScreenSize())

        expect(result.current).toEqual([800, 640])
    })

    it('should return the updated screen size on resize', () => {
        global.innerWidth = 800
        global.innerHeight = 640

        const { result } = renderHook(() => useScreenSize())

        global.innerWidth = 900
        global.innerHeight = 700

        act(() => {
            fireEvent.resize(window)
        })

        expect(result.current).toEqual([900, 700])
    })

    it('should remove the event listener on unmount', () => {
        const { unmount } = renderHook(() => useScreenSize())

        jest.spyOn(window, 'removeEventListener')

        act(() => {
            unmount()
        })

        expect(window.removeEventListener).toHaveBeenCalled()
    })
})
