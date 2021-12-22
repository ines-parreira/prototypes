import {renderHook, act} from 'react-hooks-testing-library'

import useDimensions from '../useDimensions'

jest.spyOn(window, 'requestAnimationFrame').mockImplementation(((
    cb: () => void
) => {
    cb()
}) as any)

jest.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(
    function () {
        // @ts-ignore ts(2345)
        const {left, top, width, height} = window.getComputedStyle(this)

        return {
            x: parseInt(left),
            y: parseInt(top),
            width: parseInt(width),
            height: parseInt(height),
        } as unknown as DOMRect
    }
)

describe('useDimensions', () => {
    beforeEach(() => {
        const element = document.createElement('div')
        element.id = 'foo'
        element.style.height = '100px'
        element.style.left = '10px'
        element.style.top = '10px'
        element.style.width = '100px'
        window.document.body.appendChild(element)
    })

    afterEach(() => {
        document.getElementById('foo')?.remove()
        jest.clearAllMocks()
    })

    it('should return the element dimensions', () => {
        const {result} = renderHook(useDimensions)

        act(() => {
            result.current[0](document.getElementById('foo'))
        })
        expect(result.current[1]).toStrictEqual({
            x: 10,
            y: 10,
            width: 100,
            height: 100,
        })
    })

    it('should return the updated dimensions on resize', () => {
        const element = document.getElementById('foo')
        const {result} = renderHook(useDimensions)

        act(() => {
            result.current[0](element)
        })
        element!.style.width = '50px'

        window.dispatchEvent(new Event('resize'))
        expect(result.current[1]).toStrictEqual({
            x: 10,
            y: 10,
            width: 50,
            height: 100,
        })
    })
})
