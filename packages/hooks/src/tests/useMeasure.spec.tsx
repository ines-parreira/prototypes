import { renderHook } from '@repo/testing/vitest'
import { act } from '@testing-library/react'
import noop from 'lodash/noop'

import { useMeasure } from '../useMeasure'

type ResizeListener = (rect: any) => void

const resizeObserverMethods = {
    observe: noop,
    disconnect: noop,
}

describe('useMeasure', () => {
    it('should have default state with every value 0', () => {
        const { result } = renderHook(() => useMeasure())

        act(() => {
            const div = document.createElement('div')
            const [ref] = result.current
            ref(div)
        })

        expect(result.current[1]).toMatchObject({
            width: 0,
            height: 0,
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
        })
    })

    it('should synchronously set up ResizeObserver listener', () => {
        const spy = vi.spyOn(window, 'ResizeObserver')

        const { result } = renderHook(() => useMeasure())

        act(() => {
            const div = document.createElement('div')
            const [ref] = result.current
            ref(div)
        })

        expect(typeof spy.mock.lastCall?.[0]).toBe('function')
    })

    it('should track rectangle of a DOM element', () => {
        let resizeListener: ResizeListener = noop
        vi.spyOn(window, 'ResizeObserver').mockImplementation(function (
            listener: ResizeListener,
        ) {
            resizeListener = listener
            return resizeObserverMethods
        } as unknown as typeof ResizeObserver)

        const { result } = renderHook(() => useMeasure())

        act(() => {
            const div = document.createElement('div')
            const [ref] = result.current
            ref(div)
        })

        const contentRect = {
            x: 1,
            y: 2,
            width: 200,
            height: 200,
            top: 100,
            bottom: 0,
            left: 100,
            right: 0,
        }

        act(() => {
            resizeListener([{ contentRect }])
        })

        expect(result.current[1]).toMatchObject(contentRect)
    })

    it('should track multiple updates', () => {
        let resizeListener: ResizeListener = noop
        vi.spyOn(window, 'ResizeObserver').mockImplementation(function (
            listener: ResizeListener,
        ) {
            resizeListener = listener
            return resizeObserverMethods
        } as unknown as typeof ResizeObserver)

        const { result } = renderHook(() => useMeasure())

        act(() => {
            const div = document.createElement('div')
            const [ref] = result.current
            ref(div)
        })

        const contentRect = {
            x: 1,
            y: 1,
            width: 1,
            height: 1,
            top: 1,
            bottom: 1,
            left: 1,
            right: 1,
        }

        act(() => {
            resizeListener([{ contentRect }])
        })

        expect(result.current[1]).toMatchObject(contentRect)

        const updatedContentRect = {
            x: 2,
            y: 2,
            width: 2,
            height: 2,
            top: 2,
            bottom: 2,
            left: 2,
            right: 2,
        }

        act(() => {
            resizeListener([{ contentRect: updatedContentRect }])
        })

        expect(result.current[1]).toMatchObject(updatedContentRect)
    })

    it('should call .disconnect() on ResizeObserver when component unmounts', () => {
        const disconnect = vi.fn()
        vi.spyOn(window, 'ResizeObserver').mockImplementation(function () {
            return { observe: noop, disconnect }
        } as unknown as typeof ResizeObserver)

        const { result, unmount } = renderHook(() => useMeasure())

        act(() => {
            const div = document.createElement('div')
            const [ref] = result.current
            ref(div)
        })

        expect(disconnect).toHaveBeenCalledTimes(0)

        unmount()

        expect(disconnect).toHaveBeenCalledTimes(1)
    })
})
