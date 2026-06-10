import { afterAll, afterEach, beforeAll, vi } from 'vitest'

import { server } from './server'

global.ResizeObserver = vi.fn().mockImplementation(function ResizeObserver() {
    return {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
    }
})

global.IntersectionObserver = vi
    .fn()
    .mockImplementation(function IntersectionObserver() {
        return {
            observe: vi.fn(),
            unobserve: vi.fn(),
            disconnect: vi.fn(),
            takeRecords: vi.fn(() => []),
        }
    })

if (typeof Element.prototype.getAnimations !== 'function') {
    Element.prototype.getAnimations = () => []
}

// jsdom never fires `load`/`error` on images, so Axiom's <Image> stays in its
// loading state forever and never renders the underlying <img>. Simulate a
// successful decode synchronously so the real component renders the image.
Object.defineProperty(window.HTMLImageElement.prototype, 'src', {
    configurable: true,
    set(value: string) {
        this.setAttribute('src', value)
        Object.defineProperty(this, 'complete', {
            configurable: true,
            value: true,
        })
        Object.defineProperty(this, 'naturalWidth', {
            configurable: true,
            value: 100,
        })
        this.dispatchEvent(new Event('load'))
    },
    get(): string {
        return this.getAttribute('src') ?? ''
    },
})

Object.defineProperty(document, 'execCommand', {
    configurable: true,
    writable: true,
    value: vi.fn(() => true),
})

Object.defineProperty(window, 'prompt', {
    configurable: true,
    writable: true,
    value: vi.fn(() => null),
})

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(async () => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})
