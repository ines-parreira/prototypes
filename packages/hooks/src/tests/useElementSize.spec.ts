import { renderHook } from '@repo/testing/vitest'
import { act } from '@testing-library/react'
import { type Mock } from 'vitest'

import { useElementSize } from '../useElementSize'

describe('useElementSize', () => {
    let observe: Mock
    let unobserve: Mock

    beforeAll(() => {
        observe = vi.fn()
        unobserve = vi.fn()

        // @ts-expect-error
        window.ResizeObserver = vi.fn(() => ({ observe, unobserve }))
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
})
