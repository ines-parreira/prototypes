import { act } from '@testing-library/react'

import { renderHook } from 'utils/testing/renderHook'

import useScrollOffset from '../useScrollOffset'

describe('useScrollOffset', () => {
    it('should return the scroll offset for the given element', () => {
        const addEventListener = jest.fn()
        const removeEventListener = jest.fn()
        const element = {
            addEventListener,
            removeEventListener,
            scrollTop: 0,
        } as unknown as HTMLDivElement

        const { result, unmount } = renderHook(() => useScrollOffset(element))

        expect(result.current).toEqual([0])
        expect(addEventListener).toHaveBeenCalledWith(
            'scroll',
            expect.any(Function),
        )

        const [[, cb]] = addEventListener.mock.calls as [[string, () => void]]

        act(() => {
            element.scrollTop = 50
            cb()
        })

        expect(result.current).toEqual([50])

        unmount()
        expect(removeEventListener).toHaveBeenCalledWith('scroll', cb)
    })
})
