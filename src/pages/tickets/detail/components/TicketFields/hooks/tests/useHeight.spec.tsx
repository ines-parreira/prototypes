import {render} from '@testing-library/react'
import {renderHook, act} from '@testing-library/react-hooks/dom'
import noop from 'lodash/noop'
import React, {createRef, forwardRef} from 'react'

import useHeight from '../useHeight'

type MockedResizeObserver = (listener: any) => any
type ResizeListener = (rect: any) => void

const resizeObserverMethods = {
    observe: noop,
    disconnect: noop,
}

let resizeListener: ResizeListener
jest.spyOn(window, 'ResizeObserver').mockImplementation(((listener) => {
    resizeListener = listener
    return resizeObserverMethods
}) as MockedResizeObserver)

const HookWrapper = forwardRef<HTMLDivElement, Record<string, unknown>>(
    (_props, ref) => (
        <div
            ref={ref}
            style={{
                left: 0,
                top: 0,
                height: 100,
                width: 200,
            }}
        />
    )
)

let mockCounter = 0
jest.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(
    function () {
        // @ts-ignore ts(2683)
        const {left, top, width, height} = window.getComputedStyle(this)

        mockCounter += 10
        return {
            x: parseInt(left),
            y: parseInt(top),
            width: parseInt(width) + mockCounter,
            height: parseInt(height),
        } as unknown as DOMRect
    }
)

const mockScrollHeight = 100
let mockHeight = 0
jest.spyOn(Element.prototype, 'scrollHeight', 'get').mockImplementation(() => {
    mockHeight += 50
    return mockScrollHeight + mockHeight
})

describe('useHeight', () => {
    beforeEach(() => {
        mockCounter = 0
        mockHeight = 0
    })

    it('should return default height', () => {
        const ref = createRef<HTMLDivElement>()
        const {result} = renderHook(() => useHeight(ref))

        expect(result.current).toBeUndefined()
    })

    it('should set up ResizeObserver listener', () => {
        const spy = jest.spyOn(window, 'ResizeObserver')
        const ref = createRef<HTMLDivElement>()

        renderHook(() => useHeight(ref))

        expect(typeof spy.mock.lastCall?.[0]).toBe('function')
    })

    it('should set the initial value for the height', () => {
        const ref = createRef<HTMLDivElement>()
        render(<HookWrapper ref={ref} />)
        const {result} = renderHook(() => useHeight(ref))

        expect(result.current).toBe(150)
    })

    it('should track the height value', () => {
        const ref = createRef<HTMLDivElement>()
        render(<HookWrapper ref={ref} />)
        const {result} = renderHook(() => useHeight(ref))

        act(() => {
            resizeListener({})
        })

        expect(result.current).toBe(200)

        act(() => {
            resizeListener({})
        })

        expect(result.current).toBe(250)
    })
})
