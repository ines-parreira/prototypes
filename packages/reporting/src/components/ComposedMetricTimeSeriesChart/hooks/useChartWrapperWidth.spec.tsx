import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { useChartWrapperWidth } from './useChartWrapperWidth'

type ResizeObserverCallback = (
    entries: { contentRect: DOMRectReadOnly }[],
) => void

class TestResizeObserver {
    static instances: TestResizeObserver[] = []

    callback: ResizeObserverCallback
    observed: Element[] = []
    isDisconnected = false

    constructor(callback: ResizeObserverCallback) {
        this.callback = callback
        TestResizeObserver.instances.push(this)
    }

    observe(target: Element) {
        this.observed.push(target)
    }

    unobserve() {}

    disconnect() {
        this.isDisconnected = true
    }

    trigger(width: number) {
        this.callback([
            {
                contentRect: { width } as DOMRectReadOnly,
            },
        ])
    }
}

type WrapperProps = {
    isDisabled: boolean
    onState: (width: number | undefined) => void
}

const Wrapper = ({ isDisabled, onState }: WrapperProps) => {
    const { chartWrapperRef, chartWrapperWidth } =
        useChartWrapperWidth(isDisabled)

    onState(chartWrapperWidth)

    return <div ref={chartWrapperRef} />
}

const renderWrapper = (props: { isDisabled?: boolean } = {}) => {
    const states: (number | undefined)[] = []
    const result = render(
        <Wrapper
            isDisabled={props.isDisabled ?? false}
            onState={(width) => {
                states.push(width)
            }}
        />,
    )

    return { ...result, states }
}

const stubBoundingRectWidth = (width: number) => {
    const original = Element.prototype.getBoundingClientRect

    Element.prototype.getBoundingClientRect = function getBoundingClientRect() {
        return { width } as DOMRect
    }

    return () => {
        Element.prototype.getBoundingClientRect = original
    }
}

describe('useChartWrapperWidth', () => {
    const originalResizeObserver = globalThis.ResizeObserver

    beforeEach(() => {
        TestResizeObserver.instances = []
        ;(
            globalThis as unknown as {
                ResizeObserver: typeof TestResizeObserver
            }
        ).ResizeObserver = TestResizeObserver
    })

    afterEach(() => {
        ;(
            globalThis as unknown as {
                ResizeObserver: typeof ResizeObserver | undefined
            }
        ).ResizeObserver = originalResizeObserver
    })

    it('captures the initial wrapper width from the rendered element', () => {
        const restoreRect = stubBoundingRectWidth(420)

        const { states } = renderWrapper()

        expect(states.at(-1)).toBe(420)

        restoreRect()
    })

    it('updates the width when the ResizeObserver reports a new content rect', () => {
        const restoreRect = stubBoundingRectWidth(420)

        const { states } = renderWrapper()
        const observer = TestResizeObserver.instances.at(-1)!

        act(() => {
            observer.trigger(640)
        })

        expect(states.at(-1)).toBe(640)

        restoreRect()
    })

    it('treats a non-positive measured width as no width', () => {
        const restoreRect = stubBoundingRectWidth(0)

        const { states } = renderWrapper()

        expect(states.at(-1)).toBeUndefined()

        restoreRect()
    })

    it('skips measuring while disabled', () => {
        const restoreRect = stubBoundingRectWidth(420)

        const { states } = renderWrapper({ isDisabled: true })

        expect(states.at(-1)).toBeUndefined()
        expect(TestResizeObserver.instances).toHaveLength(0)

        restoreRect()
    })

    it('disconnects the ResizeObserver on unmount', () => {
        const restoreRect = stubBoundingRectWidth(420)

        const { unmount } = renderWrapper()
        const observer = TestResizeObserver.instances.at(-1)!

        unmount()

        expect(observer.isDisconnected).toBe(true)

        restoreRect()
    })

    it('still captures the initial width when ResizeObserver is unavailable', () => {
        const restoreRect = stubBoundingRectWidth(420)
        ;(
            globalThis as unknown as {
                ResizeObserver: typeof ResizeObserver | undefined
            }
        ).ResizeObserver = undefined

        const { states } = renderWrapper()

        expect(states.at(-1)).toBe(420)
        expect(TestResizeObserver.instances).toHaveLength(0)

        restoreRect()
    })
})
