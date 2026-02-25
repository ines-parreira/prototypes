import { renderHook } from '@repo/testing/vitest'
import { act } from '@testing-library/react'
import type { Mock } from 'vitest'

import { useElementSize } from '../useElementSize'

describe('useElementSize', () => {
    let observe: Mock
    let unobserve: Mock

    beforeAll(() => {
        observe = vi.fn()
        unobserve = vi.fn()

        window.ResizeObserver = vi.fn(function () {
            return { observe, unobserve, disconnect: vi.fn() }
        })
    })

    beforeEach(() => {
        observe.mockClear()
        unobserve.mockClear()
    })

    it('should return the element size', () => {
        const element = document.createElement('div')
        const { result } = renderHook(() => useElementSize(element))

        expect(result.current).toEqual([0, 0])
        expect(observe).toHaveBeenCalledWith(element)

        const [[cb]] = (ResizeObserver as Mock).mock.calls as [
            [(entries: ResizeObserverEntry[]) => void],
        ]
        act(() => {
            cb([
                {
                    borderBoxSize: [{ blockSize: 30, inlineSize: 40 }],
                    target: element,
                } as unknown as ResizeObserverEntry,
            ])
        })

        expect(result.current).toEqual([40, 30])
    })

    it('should not observe when element is null', () => {
        const { result } = renderHook(() => useElementSize(null))

        expect(result.current).toEqual([0, 0])
        expect(observe).not.toHaveBeenCalled()
    })

    it('should switch observed elements when element changes', () => {
        const firstElement = document.createElement('div')
        const secondElement = document.createElement('div')

        const { rerender } = renderHook(
            ({ element }) => useElementSize(element),
            {
                initialProps: { element: firstElement as HTMLElement | null },
            },
        )

        rerender({ element: secondElement as HTMLElement | null })

        expect(unobserve).toHaveBeenCalledWith(firstElement)
        expect(observe).toHaveBeenCalledWith(secondElement)
    })

    it('should unobserve element on unmount', () => {
        const element = document.createElement('div')
        const { unmount } = renderHook(() => useElementSize(element))

        unmount()

        expect(unobserve).toHaveBeenCalledWith(element)
    })
})
