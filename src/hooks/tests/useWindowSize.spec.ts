import {act, renderHook} from '@testing-library/react-hooks'
import {mockRequestAnimationFrame} from 'utils/testing'
import useWindowSize from '../useWindowSize'

const rafControl = mockRequestAnimationFrame()

describe('useWindowSize', () => {
    beforeEach(() => {
        rafControl.clear()
    })

    function triggerResize(dimension: 'width' | 'height', value: number) {
        if (dimension === 'width') {
            Object.defineProperty(window, 'innerWidth', {value})
        } else if (dimension === 'height') {
            Object.defineProperty(window, 'innerHeight', {value})
        }

        window.dispatchEvent(new Event('resize'))
    }

    it('should return current window dimensions', () => {
        const hook = renderHook(() => useWindowSize())

        expect(typeof hook.result.current).toBe('object')
        expect(typeof hook.result.current.height).toBe('number')
        expect(typeof hook.result.current.width).toBe('number')
    })

    it('should re-render after height change on closest RAF', () => {
        const hook = renderHook(() => useWindowSize())

        act(() => {
            triggerResize('height', 360)
            rafControl.run()
        })

        expect(hook.result.current.height).toBe(360)

        act(() => {
            triggerResize('height', 2048)
            rafControl.run()
        })

        expect(hook.result.current.height).toBe(2048)
    })

    it('should re-render after width change on closest RAF', () => {
        const hook = renderHook(() => useWindowSize())

        act(() => {
            triggerResize('width', 360)
            rafControl.run()
        })

        expect(hook.result.current.width).toBe(360)

        act(() => {
            triggerResize('width', 2048)
            rafControl.run()
        })

        expect(hook.result.current.width).toBe(2048)
    })
})
