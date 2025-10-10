import { renderHook } from '@repo/testing/vitest'
import { act, fireEvent } from '@testing-library/react'

import { useEvent } from '../useEvent'

describe('useEvent', () => {
    it('should add and remove event listener', () => {
        const listener = vi.fn()
        const target = document.createElement('div')

        vi.spyOn(target, 'addEventListener')
        vi.spyOn(target, 'removeEventListener')

        const { unmount } = renderHook(() =>
            useEvent('click', listener, target),
        )

        act(() => {
            fireEvent.click(target)
        })

        expect(listener).toHaveBeenCalledTimes(1)

        unmount()

        act(() => {
            fireEvent.click(target)
        })

        expect(listener).toHaveBeenCalledTimes(1)

        expect(target.addEventListener).toHaveBeenCalledWith(
            'click',
            listener,
            undefined,
        )
        expect(target.removeEventListener).toHaveBeenCalledWith(
            'click',
            listener,
            undefined,
        )
    })

    it('should handle default target if target is not provided', () => {
        const listener = vi.fn()

        const { unmount } = renderHook(() => useEvent('click', listener))

        act(() => {
            fireEvent.click(window)
        })

        expect(listener).toHaveBeenCalledTimes(1)

        unmount()

        act(() => {
            fireEvent.click(window)
        })

        expect(listener).toHaveBeenCalledTimes(1)
    })

    it('should add and remove event listener with options', () => {
        const listener = vi.fn()
        const target = document.createElement('div')
        const options = { capture: true, passive: true }

        vi.spyOn(target, 'addEventListener')
        vi.spyOn(target, 'removeEventListener')

        const { unmount } = renderHook(() =>
            useEvent('click', listener, target, options),
        )

        act(() => {
            fireEvent.click(target)
        })

        expect(listener).toHaveBeenCalledTimes(1)

        unmount()

        act(() => {
            fireEvent.click(target)
        })

        expect(listener).toHaveBeenCalledTimes(1)

        expect(target.addEventListener).toHaveBeenCalledWith(
            'click',
            listener,
            options,
        )
        expect(target.removeEventListener).toHaveBeenCalledWith(
            'click',
            listener,
            options,
        )
    })

    it('should add and remove event listener when parameters change', () => {
        const listener = vi.fn()
        const otherListener = vi.fn()
        const target = document.createElement('div')
        const otherTarget = document.createElement('span')

        vi.spyOn(target, 'addEventListener')
        vi.spyOn(target, 'removeEventListener')
        vi.spyOn(otherTarget, 'addEventListener')
        vi.spyOn(otherTarget, 'removeEventListener')

        const getOptions = (): AddEventListenerOptions => ({
            once: false,
        })
        const getOtherOptions = (): AddEventListenerOptions => ({
            passive: false,
        })

        const { rerender, unmount } = renderHook(
            ({ type, listener, target, options }) =>
                useEvent(type, listener, target, options),
            {
                initialProps: {
                    type: 'click' as keyof HTMLElementEventMap,
                    listener: listener,
                    target: target as Element,
                    options: getOptions(),
                },
            },
        )

        expect(target.addEventListener).toBeCalledWith(
            'click',
            listener,
            getOptions(),
        )

        // Change the type
        rerender({
            type: 'focus',
            listener,
            target,
            options: getOptions(),
        })

        expect(target.addEventListener).toBeCalledWith(
            'focus',
            listener,
            getOptions(),
        )
        expect(target.removeEventListener).toBeCalledTimes(1)

        // Change the listener
        rerender({
            type: 'focus',
            listener: otherListener,
            target,
            options: getOptions(),
        })

        expect(target.addEventListener).toBeCalledWith(
            'focus',
            otherListener,
            getOptions(),
        )
        expect(target.removeEventListener).toBeCalledTimes(2)

        // Change the target
        rerender({
            type: 'focus',
            listener: otherListener,
            target: otherTarget,
            options: getOptions(),
        })

        expect(otherTarget.addEventListener).toBeCalledWith(
            'focus',
            otherListener,
            getOptions(),
        )
        expect(target.removeEventListener).toBeCalledTimes(3)

        // Change the options
        rerender({
            type: 'focus',
            listener: otherListener,
            target: otherTarget,
            options: getOtherOptions(),
        })

        expect(otherTarget.addEventListener).toBeCalledWith(
            'focus',
            otherListener,
            getOtherOptions(),
        )

        expect(otherTarget.removeEventListener).toBeCalledTimes(1)

        unmount()

        expect(otherTarget.removeEventListener).toBeCalledTimes(2)
    })
})
