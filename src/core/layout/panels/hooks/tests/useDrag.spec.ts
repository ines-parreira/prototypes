import type { MouseEvent } from 'react'

import { fireEvent } from '@testing-library/react'
import { act, renderHook } from '@testing-library/react-hooks'

import useDrag from '../useDrag'

describe('useDrag', () => {
    it('should return the drag and a function to create a resizer', () => {
        const { result } = renderHook(() => useDrag({}))
        expect(result.current).toEqual({
            createResizer: expect.any(Function),
            drag: null,
        })
    })

    it('should set the drag when a resizer is clicked', () => {
        const preventDefault = jest.fn()
        const { result } = renderHook(() => useDrag({ panel1: 100 }))
        const resizer = result.current.createResizer(1)
        act(() => {
            resizer({
                clientX: 10,
                clientY: 20,
                preventDefault,
            } as unknown as MouseEvent)
        })
        expect(preventDefault).toHaveBeenCalled()
        expect(result.current.drag).toEqual({
            handle: 1,
            position: { x: 10, y: 20 },
            sizes: { panel1: 100 },
        })
    })

    it('should unset the drag when the resizer is released', () => {
        const preventDefault = jest.fn()
        const { result } = renderHook(() => useDrag({ panel1: 100 }))
        const resizer = result.current.createResizer(1)
        act(() => {
            resizer({
                clientX: 10,
                clientY: 20,
                preventDefault,
            } as unknown as MouseEvent)
        })
        act(() => {
            fireEvent.mouseUp(window)
        })
        expect(result.current.drag).toBe(null)
    })
})
