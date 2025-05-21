import type { MouseEvent } from 'react'

import { act, waitFor } from '@testing-library/react'

import { renderHook } from 'utils/testing/renderHook'

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

    it('should unset the drag when the resizer is released', async () => {
        const preventDefault = jest.fn()
        const { result } = renderHook(() => useDrag({ panel1: 100 }))
        const resizer = result.current.createResizer(1)

        // Set drag state
        act(() => {
            resizer({
                clientX: 10,
                clientY: 20,
                preventDefault,
            } as unknown as MouseEvent)
        })

        // Confirm drag is set (triggers useEffect to attach mouseup listener)
        await waitFor(() => {
            expect(result.current.drag).not.toBe(null)
        })

        // Ensure the event loop progresses to register the handler
        await act(async () => {
            await Promise.resolve()
        })

        // Dispatch native event manually — critical in JSDOM
        act(() => {
            window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
        })

        // Wait for the state to be reset
        await waitFor(() => {
            expect(result.current.drag).toBe(null)
        })
    })
})
