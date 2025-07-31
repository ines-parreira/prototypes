import { renderHook } from '@repo/testing'
import { act, fireEvent } from '@testing-library/react'

import type { Delta, Drag } from '../../types'
import useDelta from '../useDelta'

describe('useDelta', () => {
    it('should return null if there is no drag', () => {
        const { result } = renderHook(() => useDelta(null))
        expect(result.current).toBe(null)
    })

    it('should return the delta', () => {
        const drag = { handle: 1, position: { x: 10, y: 20 }, sizes: {} }
        const { result } = renderHook(() => useDelta(drag))
        act(() => {
            fireEvent.mouseMove(window, { clientX: 12, clientY: 18 })
        })
        expect(result.current).toEqual({ x: 2, y: -2 })
    })

    it('should set the delta back to null once the drag ends', () => {
        const drag = { handle: 1, position: { x: 10, y: 20 }, sizes: {} }
        // I had to specify the type explicitly here, otherwise `rerender` expects
        // `Drag | undefined` rather than `Drag | null`... very weird
        const { rerender, result } = renderHook<Delta | null, Drag | null>(
            (drag: Drag | null) => useDelta(drag),
            { initialProps: drag },
        )
        act(() => {
            fireEvent.mouseMove(window, { clientX: 12, clientY: 18 })
        })
        act(() => {
            rerender(null)
        })
        expect(result.current).toBe(null)
    })
})
