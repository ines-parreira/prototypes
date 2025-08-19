import { act, renderHook } from '@testing-library/react'

import { useIsTruncated } from './useIsTruncated'

describe('useIsTruncated', () => {
    let originalScrollWidth: PropertyDescriptor | undefined
    let originalClientWidth: PropertyDescriptor | undefined
    let resizeObserverMock: jest.Mock
    let resizeObserverInstances: any[] = []

    beforeEach(() => {
        originalScrollWidth = Object.getOwnPropertyDescriptor(
            HTMLElement.prototype,
            'scrollWidth',
        )
        originalClientWidth = Object.getOwnPropertyDescriptor(
            HTMLElement.prototype,
            'clientWidth',
        )

        resizeObserverInstances = []
        resizeObserverMock = jest.fn().mockImplementation((callback) => {
            const instance = {
                observe: jest.fn(),
                disconnect: jest.fn(),
                unobserve: jest.fn(),
                callback,
            }
            resizeObserverInstances.push(instance)
            return instance
        })
        global.ResizeObserver = resizeObserverMock as any
    })

    afterEach(() => {
        if (originalScrollWidth) {
            Object.defineProperty(
                HTMLElement.prototype,
                'scrollWidth',
                originalScrollWidth,
            )
        }
        if (originalClientWidth) {
            Object.defineProperty(
                HTMLElement.prototype,
                'clientWidth',
                originalClientWidth,
            )
        }
        jest.clearAllTimers()
    })

    it('should return false when element is not truncated', () => {
        const element = document.createElement('div')
        Object.defineProperty(element, 'scrollWidth', {
            configurable: true,
            value: 100,
        })
        Object.defineProperty(element, 'clientWidth', {
            configurable: true,
            value: 100,
        })

        const ref = { current: element }
        const { result } = renderHook(() => useIsTruncated(ref))

        expect(result.current).toBe(false)
    })

    it('should return true when element is truncated', () => {
        const element = document.createElement('div')
        Object.defineProperty(element, 'scrollWidth', {
            configurable: true,
            value: 150,
        })
        Object.defineProperty(element, 'clientWidth', {
            configurable: true,
            value: 100,
        })

        const ref = { current: element }
        const { result } = renderHook(() => useIsTruncated(ref))

        expect(result.current).toBe(true)
    })

    it('should return false when ref is null', () => {
        const ref = { current: null }
        const { result } = renderHook(() => useIsTruncated(ref))

        expect(result.current).toBe(false)
    })

    it('should recalculate when dependency changes', () => {
        const element = document.createElement('div')
        Object.defineProperty(element, 'scrollWidth', {
            configurable: true,
            value: 100,
        })
        Object.defineProperty(element, 'clientWidth', {
            configurable: true,
            value: 100,
        })

        const ref = { current: element }
        const { result, rerender } = renderHook(
            ({ dependency }) => useIsTruncated(ref, dependency),
            { initialProps: { dependency: 'initial' } },
        )

        expect(result.current).toBe(false)

        Object.defineProperty(element, 'scrollWidth', {
            configurable: true,
            value: 150,
        })

        rerender({ dependency: 'updated' })

        expect(result.current).toBe(true)
    })

    it('should handle resize observer events', () => {
        jest.useFakeTimers()
        const element = document.createElement('div')
        Object.defineProperty(element, 'scrollWidth', {
            configurable: true,
            value: 100,
        })
        Object.defineProperty(element, 'clientWidth', {
            configurable: true,
            value: 100,
        })

        const ref = { current: element }
        const { result } = renderHook(() => useIsTruncated(ref))

        act(() => {
            jest.runAllTimers()
        })

        expect(result.current).toBe(false)

        Object.defineProperty(element, 'scrollWidth', {
            configurable: true,
            value: 150,
        })

        act(() => {
            const resizeObserverInstance = resizeObserverInstances[0]
            resizeObserverInstance.callback()
        })

        expect(result.current).toBe(true)
        jest.useRealTimers()
    })

    it('should cleanup resize observer on unmount', () => {
        jest.useFakeTimers()
        const element = document.createElement('div')
        Object.defineProperty(element, 'scrollWidth', {
            configurable: true,
            value: 100,
        })
        Object.defineProperty(element, 'clientWidth', {
            configurable: true,
            value: 100,
        })

        const ref = { current: element }
        const { unmount } = renderHook(() => useIsTruncated(ref))

        act(() => {
            jest.runAllTimers()
        })

        const resizeObserverInstance = resizeObserverInstances[0]
        expect(resizeObserverInstance.observe).toHaveBeenCalledWith(element)

        unmount()

        expect(resizeObserverInstance.disconnect).toHaveBeenCalled()
        jest.useRealTimers()
    })
})
