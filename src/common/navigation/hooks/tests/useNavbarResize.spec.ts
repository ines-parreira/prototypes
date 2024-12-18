import {fireEvent} from '@testing-library/react'
import {act, renderHook} from '@testing-library/react-hooks'
import type {MouseEvent as MouseEventReact, RefObject} from 'react'

import useNavbarResize, {DEFAULT_WIDTH} from '../useNavbarResize'

describe('useNavbarResize', () => {
    let getBoundingClientRect: jest.Mock
    let defaultRef: RefObject<HTMLDivElement>
    let getItem: jest.SpyInstance
    let setItem: jest.SpyInstance

    beforeEach(() => {
        jest.resetAllMocks()

        getItem = jest.spyOn(Storage.prototype, 'getItem')
        setItem = jest.spyOn(Storage.prototype, 'setItem')

        getBoundingClientRect = jest.fn()
        defaultRef = {
            current: {getBoundingClientRect},
        } as unknown as RefObject<HTMLDivElement>
    })

    it('should return the default state', () => {
        const {result} = renderHook(() => useNavbarResize(defaultRef))
        expect(result.current).toEqual({
            onStartResize: expect.any(Function),
            isResizing: false,
            width: DEFAULT_WIDTH,
        })
    })

    it('should return the default width if localstorage contains an invalid value', () => {
        getItem.mockReturnValue('non-number')
        const {result} = renderHook(() => useNavbarResize(defaultRef))
        expect(result.current.width).toBe(DEFAULT_WIDTH)
    })

    it('should return the stored value if it is a number', () => {
        getItem.mockReturnValue('123')
        const {result} = renderHook(() => useNavbarResize(defaultRef))
        expect(result.current.width).toBe(123)
    })

    it('should set `isResizing` when resizing begins', () => {
        const {result} = renderHook(() => useNavbarResize(defaultRef))
        act(() => {
            result.current.onStartResize({} as MouseEventReact)
        })

        expect(result.current.isResizing).toBe(true)
    })

    it('should not set `isResizing` if the right mouse button is used', () => {
        const {result} = renderHook(() => useNavbarResize(defaultRef))
        act(() => {
            result.current.onStartResize({button: 2} as MouseEventReact)
        })

        expect(result.current.isResizing).toBe(false)
    })

    it('should handle touch resize events', () => {
        getBoundingClientRect.mockReturnValue({left: 0})
        const {result} = renderHook(() => useNavbarResize(defaultRef))
        act(() => {
            result.current.onStartResize({} as MouseEventReact)
        })
        act(() => {
            fireEvent.touchMove(window, {touches: [{pageX: 300}]})
        })

        expect(result.current.width).toBe(300)
    })

    it('should handle non-touch resize events', () => {
        getBoundingClientRect.mockReturnValue({left: 0})
        const {result} = renderHook(() => useNavbarResize(defaultRef))
        act(() => {
            result.current.onStartResize({} as MouseEventReact)
        })
        act(() => {
            fireEvent.mouseMove(window, {clientX: 300})
        })

        expect(result.current.width).toBe(300)
    })

    it('should not allow the navbar width to be below its minimum width', () => {
        getBoundingClientRect.mockReturnValue({left: 0})
        const {result} = renderHook(() => useNavbarResize(defaultRef))
        act(() => {
            result.current.onStartResize({} as MouseEventReact)
        })
        act(() => {
            fireEvent.mouseMove(window, {clientX: 150})
        })

        expect(result.current.width).toBe(200)
    })

    it('should not allow the navbar width to be above its maximum width', () => {
        getBoundingClientRect.mockReturnValue({left: 0})
        const {result} = renderHook(() => useNavbarResize(defaultRef))
        act(() => {
            result.current.onStartResize({} as MouseEventReact)
        })
        act(() => {
            fireEvent.mouseMove(window, {clientX: 400})
        })

        expect(result.current.width).toBe(350)
    })

    it('should stop touch resizes', () => {
        const {result} = renderHook(() => useNavbarResize(defaultRef))
        act(() => {
            result.current.onStartResize({} as MouseEventReact)
        })
        act(() => {
            fireEvent.touchEnd(window)
        })

        expect(setItem).toHaveBeenCalledWith('navbar-width', '238')
        expect(result.current.isResizing).toBe(false)
    })

    it('should stop non-touch resizes', () => {
        const {result} = renderHook(() => useNavbarResize(defaultRef))
        act(() => {
            result.current.onStartResize({} as MouseEventReact)
        })
        act(() => {
            fireEvent.mouseUp(window)
        })

        expect(setItem).toHaveBeenCalledWith('navbar-width', '238')
        expect(result.current.isResizing).toBe(false)
    })
})
