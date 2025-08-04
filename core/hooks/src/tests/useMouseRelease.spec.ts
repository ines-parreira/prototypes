import { renderHook } from '@repo/testing'
import { fireEvent } from '@testing-library/react'

import { useMouseRelease } from '../useMouseRelease'

describe('useMouseRelease', () => {
    it('should return a mouse down handler', () => {
        const callback = jest.fn()
        const { result } = renderHook(() => useMouseRelease(callback))

        expect(result.current).toEqual(expect.any(Function))
    })

    it('should call the callback function on a mouseup after the mousedown is called', () => {
        const callback = jest.fn()
        const { result } = renderHook(() => useMouseRelease(callback))

        result.current()
        fireEvent.mouseUp(document.body)

        expect(callback).toHaveBeenCalledWith()
    })
})
