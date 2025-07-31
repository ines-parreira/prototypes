import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import useElementSize from '../useElementSize'

describe('useElementSize', () => {
    let observe: jest.Mock
    let unobserve: jest.Mock

    beforeAll(() => {
        observe = jest.fn()
        unobserve = jest.fn()

        // @ts-expect-error
        window.ResizeObserver = jest.fn(() => ({ observe, unobserve }))
    })

    it('should return the element size', () => {
        const element = document.createElement('div')
        const { result } = renderHook(() => useElementSize(element))

        expect(result.current).toEqual([0, 0])
        expect(observe).toHaveBeenCalledWith(element)

        const [[cb]] = (ResizeObserver as jest.Mock).mock.calls as [
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
