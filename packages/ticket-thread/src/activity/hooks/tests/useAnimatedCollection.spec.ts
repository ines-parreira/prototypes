import { act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderHook } from '../../../tests/render.utils'
import { useAnimatedCollection } from '../useAnimatedCollection'

const animationFrameCallbacks: FrameRequestCallback[] = []
const cancelAnimationFrameSpy = vi.spyOn(window, 'cancelAnimationFrame')

vi.spyOn(window, 'requestAnimationFrame').mockImplementation(
    (callback: FrameRequestCallback) => {
        animationFrameCallbacks.push(callback)

        return animationFrameCallbacks.length
    },
)

const runAnimationFrame = () => {
    // advance one queued RAF callback so the test can step through the
    // hook's double-requestAnimationFrame visibility transition.
    const callback = animationFrameCallbacks.shift()

    callback?.(performance.now())
}

describe('useAnimatedCollection', () => {
    beforeEach(() => {
        animationFrameCallbacks.length = 0
        cancelAnimationFrameSpy.mockClear()
    })

    it('returns the empty hidden state when there are no items', () => {
        const { result } = renderHook(() => useAnimatedCollection<string>([]))

        expect(result.current).toEqual({
            displayedItems: [],
            hasItems: false,
            isVisible: false,
        })
    })

    it('reveals a collection after two animation frames', () => {
        const { result, rerender } = renderHook(
            ({ items }: { items: string[] }) => useAnimatedCollection(items),
            {
                initialProps: {
                    items: [] as string[],
                },
            },
        )

        rerender({
            items: ['Alice'],
        })

        expect(result.current.displayedItems).toEqual(['Alice'])
        expect(result.current.hasItems).toBe(true)
        expect(result.current.isVisible).toBe(false)

        act(() => {
            runAnimationFrame()
        })

        expect(result.current.isVisible).toBe(false)

        act(() => {
            runAnimationFrame()
        })

        expect(result.current.isVisible).toBe(true)
    })

    it('keeps the previous items rendered while hiding the collection', () => {
        const { result, rerender } = renderHook(
            ({ items }: { items: string[] }) => useAnimatedCollection(items),
            {
                initialProps: {
                    items: ['Alice'],
                },
            },
        )

        act(() => {
            runAnimationFrame()
            runAnimationFrame()
        })

        rerender({
            items: [],
        })

        expect(result.current.displayedItems).toEqual(['Alice'])
        expect(result.current.hasItems).toBe(false)
        expect(result.current.isVisible).toBe(false)
    })

    it('cancels the pending animation frame on unmount', () => {
        const { unmount } = renderHook(() => useAnimatedCollection(['Alice']))

        cancelAnimationFrameSpy.mockClear()

        unmount()

        expect(cancelAnimationFrameSpy).toHaveBeenCalledTimes(1)
    })
})
