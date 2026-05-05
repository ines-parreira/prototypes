import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { renderHook } from '../../tests/render.utils'
import { useInfobarActiveSection } from '../useInfobarActiveSection'

const resizeObservers: MockResizeObserver[] = []
const fixtures: HTMLElement[] = []

class MockResizeObserver {
    callback: ResizeObserverCallback
    observed = new Set<Element>()

    constructor(callback: ResizeObserverCallback) {
        this.callback = callback
        resizeObservers.push(this)
    }

    observe(target: Element) {
        this.observed.add(target)
    }

    unobserve(target: Element) {
        this.observed.delete(target)
    }

    disconnect() {
        this.observed.clear()
    }
}

let rafCallbacks: FrameRequestCallback[] = []

function flushRaf() {
    const callbacks = rafCallbacks
    rafCallbacks = []
    for (const cb of callbacks) cb(0)
}

type Section = {
    id: string
    top: number
    height: number
}

function setupDom({
    scrollTop = 0,
    scrollHeight,
    clientHeight,
    sections,
    scrollMarginTop = 0,
}: {
    scrollTop?: number
    scrollHeight: number
    clientHeight: number
    sections: Section[]
    scrollMarginTop?: number
}) {
    const container = document.createElement('div')
    container.style.overflowY = 'auto'
    container.getBoundingClientRect = () =>
        ({
            top: 0,
            left: 0,
            right: 0,
            bottom: clientHeight,
            width: 0,
            height: clientHeight,
            x: 0,
            y: 0,
            toJSON: () => '',
        }) as DOMRect
    Object.defineProperty(container, 'scrollTop', {
        value: scrollTop,
        writable: true,
        configurable: true,
    })
    Object.defineProperty(container, 'scrollHeight', {
        value: scrollHeight,
        writable: true,
        configurable: true,
    })
    Object.defineProperty(container, 'clientHeight', {
        value: clientHeight,
        writable: true,
        configurable: true,
    })
    document.body.appendChild(container)
    fixtures.push(container)

    for (const { id, top, height } of sections) {
        const el = document.createElement('div')
        el.id = id
        if (scrollMarginTop > 0) {
            el.style.scrollMarginTop = `${scrollMarginTop}px`
        }
        el.getBoundingClientRect = () =>
            ({
                top,
                left: 0,
                right: 0,
                bottom: top + height,
                width: 0,
                height,
                x: 0,
                y: top,
                toJSON: () => '',
            }) as DOMRect
        container.appendChild(el)
    }

    return container
}

function scrollContainerTo(
    container: HTMLElement,
    scrollTop: number,
    sectionUpdates: { id: string; top: number; height: number }[],
) {
    Object.defineProperty(container, 'scrollTop', {
        value: scrollTop,
        writable: true,
        configurable: true,
    })
    for (const { id, top, height } of sectionUpdates) {
        const el = document.getElementById(id)
        if (!el) continue
        el.getBoundingClientRect = () =>
            ({
                top,
                left: 0,
                right: 0,
                bottom: top + height,
                width: 0,
                height,
                x: 0,
                y: top,
                toJSON: () => '',
            }) as DOMRect
    }
    container.dispatchEvent(new Event('scroll'))
}

beforeEach(() => {
    resizeObservers.length = 0
    rafCallbacks = []
    globalThis.ResizeObserver =
        MockResizeObserver as unknown as typeof ResizeObserver
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
        rafCallbacks.push(cb)
        return rafCallbacks.length
    })
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {
        rafCallbacks = []
    })
})

afterEach(() => {
    for (const el of fixtures) {
        el.remove()
    }
    fixtures.length = 0
    vi.restoreAllMocks()
})

describe('useInfobarActiveSection', () => {
    it('emits the first section when scrolled to the top', () => {
        setupDom({
            scrollTop: 0,
            scrollHeight: 2000,
            clientHeight: 500,
            sections: [
                { id: 'a', top: 0, height: 800 },
                { id: 'b', top: 800, height: 800 },
                { id: 'c', top: 1600, height: 400 },
            ],
        })
        const onChange = vi.fn()
        renderHook(() =>
            useInfobarActiveSection({
                sectionIds: ['a', 'b', 'c'],
                onChange,
            }),
        )
        expect(onChange).toHaveBeenCalledTimes(1)
        expect(onChange).toHaveBeenCalledWith('a')
    })

    it('emits the section whose top has crossed the trigger line', () => {
        setupDom({
            scrollTop: 900,
            scrollHeight: 2000,
            clientHeight: 500,
            sections: [
                { id: 'a', top: -900, height: 800 },
                { id: 'b', top: -100, height: 800 },
                { id: 'c', top: 700, height: 400 },
            ],
        })
        const onChange = vi.fn()
        renderHook(() =>
            useInfobarActiveSection({
                sectionIds: ['a', 'b', 'c'],
                onChange,
            }),
        )
        expect(onChange).toHaveBeenCalledWith('b')
    })

    it('emits the last section when scrolled to the bottom even if the tail sections are short', () => {
        setupDom({
            scrollTop: 1500,
            scrollHeight: 2000,
            clientHeight: 500,
            sections: [
                { id: 'shopify', top: -1500, height: 1200 },
                { id: 'yotpo', top: -300, height: 200 },
                { id: 'custom', top: -100, height: 100 },
            ],
        })
        const onChange = vi.fn()
        renderHook(() =>
            useInfobarActiveSection({
                sectionIds: ['shopify', 'yotpo', 'custom'],
                onChange,
            }),
        )
        expect(onChange).toHaveBeenCalledWith('custom')
    })

    it('emits the section landed by scrollIntoView even when scroll-margin-top offsets it below the container top', () => {
        setupDom({
            scrollTop: 1200,
            scrollHeight: 3000,
            clientHeight: 800,
            scrollMarginTop: 8,
            sections: [
                { id: 'customer', top: -1200, height: 600 },
                { id: 'shopify', top: -600, height: 600 },
                { id: 'yotpo', top: 8, height: 800 },
                { id: 'custom', top: 808, height: 200 },
            ],
        })
        const onChange = vi.fn()
        renderHook(() =>
            useInfobarActiveSection({
                sectionIds: ['customer', 'shopify', 'yotpo', 'custom'],
                onChange,
            }),
        )
        expect(onChange).toHaveBeenCalledWith('yotpo')
    })

    it('updates the active section as the user scrolls', () => {
        const container = setupDom({
            scrollTop: 0,
            scrollHeight: 2000,
            clientHeight: 500,
            sections: [
                { id: 'a', top: 0, height: 800 },
                { id: 'b', top: 800, height: 800 },
                { id: 'c', top: 1600, height: 400 },
            ],
        })
        const onChange = vi.fn()
        renderHook(() =>
            useInfobarActiveSection({
                sectionIds: ['a', 'b', 'c'],
                onChange,
            }),
        )

        scrollContainerTo(container, 850, [
            { id: 'a', top: -850, height: 800 },
            { id: 'b', top: -50, height: 800 },
            { id: 'c', top: 750, height: 400 },
        ])
        flushRaf()

        expect(onChange).toHaveBeenLastCalledWith('b')
    })

    it('does not re-emit while the active section stays the same', () => {
        const container = setupDom({
            scrollTop: 0,
            scrollHeight: 2000,
            clientHeight: 500,
            sections: [
                { id: 'a', top: 0, height: 800 },
                { id: 'b', top: 800, height: 800 },
            ],
        })
        const onChange = vi.fn()
        renderHook(() =>
            useInfobarActiveSection({
                sectionIds: ['a', 'b'],
                onChange,
            }),
        )

        scrollContainerTo(container, 100, [
            { id: 'a', top: -100, height: 800 },
            { id: 'b', top: 700, height: 800 },
        ])
        flushRaf()
        scrollContainerTo(container, 200, [
            { id: 'a', top: -200, height: 800 },
            { id: 'b', top: 600, height: 800 },
        ])
        flushRaf()

        expect(onChange).toHaveBeenCalledTimes(1)
        expect(onChange).toHaveBeenCalledWith('a')
    })

    it('coalesces multiple scroll events within a single frame', () => {
        const container = setupDom({
            scrollTop: 0,
            scrollHeight: 2000,
            clientHeight: 500,
            sections: [
                { id: 'a', top: 0, height: 800 },
                { id: 'b', top: 800, height: 800 },
            ],
        })
        renderHook(() =>
            useInfobarActiveSection({
                sectionIds: ['a', 'b'],
                onChange: vi.fn(),
            }),
        )

        const rafSpy = vi.mocked(window.requestAnimationFrame)
        rafSpy.mockClear()

        for (let i = 0; i < 5; i++) {
            container.dispatchEvent(new Event('scroll'))
        }

        expect(rafSpy).toHaveBeenCalledTimes(1)
    })

    it('recomputes when the resize observer fires', () => {
        const container = setupDom({
            scrollTop: 1500,
            scrollHeight: 1700,
            clientHeight: 500,
            sections: [
                { id: 'a', top: -1500, height: 1200 },
                { id: 'b', top: -300, height: 100 },
                { id: 'c', top: -200, height: 200 },
            ],
        })
        const onChange = vi.fn()
        renderHook(() =>
            useInfobarActiveSection({
                sectionIds: ['a', 'b', 'c'],
                onChange,
            }),
        )
        expect(onChange).toHaveBeenLastCalledWith('c')

        Object.defineProperty(container, 'scrollHeight', {
            value: 2500,
            writable: true,
            configurable: true,
        })
        for (const { id, top, height } of [
            { id: 'a', top: -1500, height: 1200 },
            { id: 'b', top: -300, height: 800 },
            { id: 'c', top: 500, height: 200 },
        ]) {
            const el = document.getElementById(id)!
            el.getBoundingClientRect = () =>
                ({
                    top,
                    left: 0,
                    right: 0,
                    bottom: top + height,
                    width: 0,
                    height,
                    x: 0,
                    y: top,
                    toJSON: () => '',
                }) as DOMRect
        }

        const observer = resizeObservers[0]
        observer.callback([], observer as unknown as ResizeObserver)
        flushRaf()

        expect(onChange).toHaveBeenLastCalledWith('b')
    })

    it('does not attach listeners when disabled', () => {
        const container = setupDom({
            scrollTop: 0,
            scrollHeight: 1000,
            clientHeight: 500,
            sections: [
                { id: 'a', top: 0, height: 500 },
                { id: 'b', top: 500, height: 500 },
            ],
        })
        const addSpy = vi.spyOn(container, 'addEventListener')
        const onChange = vi.fn()
        renderHook(() =>
            useInfobarActiveSection({
                sectionIds: ['a', 'b'],
                enabled: false,
                onChange,
            }),
        )

        expect(addSpy).not.toHaveBeenCalled()
        expect(resizeObservers).toHaveLength(0)
        expect(onChange).not.toHaveBeenCalled()
    })

    it('cleans up scroll listener and resize observer on unmount', () => {
        const container = setupDom({
            scrollTop: 0,
            scrollHeight: 1000,
            clientHeight: 500,
            sections: [
                { id: 'a', top: 0, height: 500 },
                { id: 'b', top: 500, height: 500 },
            ],
        })
        const removeSpy = vi.spyOn(container, 'removeEventListener')
        const { unmount } = renderHook(() =>
            useInfobarActiveSection({
                sectionIds: ['a', 'b'],
                onChange: vi.fn(),
            }),
        )

        const observer = resizeObservers[0]
        const disconnectSpy = vi.spyOn(observer, 'disconnect')

        unmount()

        expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
        expect(disconnectSpy).toHaveBeenCalledTimes(1)
    })
})
