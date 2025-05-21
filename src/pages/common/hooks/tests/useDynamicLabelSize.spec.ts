import { act } from '@testing-library/react'

import { renderHook } from 'utils/testing/renderHook'

import { useDynamicLabelSize } from '../useDynamicLabelSize'

describe('useDynamicLabelSize', () => {
    let mockLabelSpan: HTMLSpanElement
    let mockLabelContainer: HTMLDivElement
    let mockResizeObserver: jest.Mock
    let resizeObserverCallback: (entries: ResizeObserverEntry[]) => void
    let currentFontSize: number

    beforeEach(() => {
        mockLabelSpan = document.createElement('span')
        mockLabelContainer = document.createElement('div')

        currentFontSize = 16 // Initial font size
        let callCount = 0
        Object.defineProperty(mockLabelSpan, 'clientWidth', {
            get: () => {
                callCount++
                return currentFontSize * 10 - callCount * 5 // Simulate width changing with each call
            },
            configurable: true,
        })
        Object.defineProperty(mockLabelContainer, 'clientWidth', {
            value: 200,
            writable: true,
        })

        document.body.appendChild(mockLabelSpan)
        document.body.appendChild(mockLabelContainer)

        const observe = jest.fn()
        const unobserve = jest.fn()
        const disconnect = jest.fn()

        mockResizeObserver = jest.fn((callback) => {
            resizeObserverCallback = callback
            return { observe, unobserve, disconnect }
        })
        window.ResizeObserver =
            mockResizeObserver as unknown as typeof ResizeObserver
    })

    afterEach(() => {
        document.body.removeChild(mockLabelSpan)
        document.body.removeChild(mockLabelContainer)
    })

    it('should initialize refs correctly', () => {
        const { result } = renderHook(() => useDynamicLabelSize())
        expect(result.current.labelSpan.current).toBeNull()
        expect(result.current.labelContainer.current).toBeNull()
    })

    it('emulates resize label font size dynamically', () => {
        const { result } = renderHook(() => useDynamicLabelSize())

        act(() => {
            ;(
                result.current
                    .labelSpan as React.MutableRefObject<HTMLSpanElement>
            ).current = mockLabelSpan
            ;(
                result.current
                    .labelContainer as React.MutableRefObject<HTMLDivElement>
            ).current = mockLabelContainer
        })

        act(() => {
            mockLabelSpan.style.fontSize = '16px'
        })

        act(() => {
            // Simulate the resizing logic by invoking the callback
            resizeObserverCallback([])
        })

        expect(parseFloat(mockLabelSpan.style.fontSize)).toBeLessThan(16)
    })

    it('should return early when the refs are not set', () => {
        const { result } = renderHook(() => useDynamicLabelSize())

        act(() => {
            result.current.labelSpan = { current: null }
            result.current.labelContainer = { current: null }
        })

        act(() => {
            // Simulate the resizing logic by invoking the callback
            resizeObserverCallback([])
        })

        expect(mockLabelSpan.style.fontSize).toBe('')
    })
})
