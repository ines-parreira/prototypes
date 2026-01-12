import React from 'react'

import { renderHook } from '@repo/testing'
import { render, waitFor } from '@testing-library/react'

import useInjectStyleToCandu from '../useInjectStyleToCandu'

describe('useInjectStyleToCandu', () => {
    let originalCSSStyleSheet: typeof CSSStyleSheet

    beforeAll(() => {
        originalCSSStyleSheet = globalThis.CSSStyleSheet
    })

    afterEach(() => {
        globalThis.CSSStyleSheet = originalCSSStyleSheet
    })

    it('should inject style into existing shadow root', () => {
        const DummyComponent = <div>Shadow root host</div>

        const { container } = render(DummyComponent)

        const child = document.createElement('div')
        const shadow = child.attachShadow({ mode: 'open' })
        container.appendChild(child)

        renderHook(() => useInjectStyleToCandu(container))
        expect(shadow.adoptedStyleSheets[0]).toBeInstanceOf(CSSStyleSheet)
    })

    it('should inject style into appended shadow root', async () => {
        const DummyComponent = <div>Shadow root host</div>

        const { container } = render(DummyComponent)
        renderHook(() => useInjectStyleToCandu(container))

        const child = document.createElement('div')
        const shadow = child.attachShadow({ mode: 'open' })
        container.appendChild(child)
        await waitFor(() =>
            expect(shadow.adoptedStyleSheets[0]).toBeInstanceOf(CSSStyleSheet),
        )
    })

    it('should not inject styles when element has no shadow root', () => {
        const DummyComponent = <div>No shadow root</div>

        const { container } = render(DummyComponent)

        const child = document.createElement('div')
        container.appendChild(child)

        renderHook(() => useInjectStyleToCandu(container))
        expect(child.shadowRoot).toBeNull()
    })

    it('should fallback to style tag when CSSStyleSheet is undefined', () => {
        globalThis.CSSStyleSheet = undefined as unknown as typeof CSSStyleSheet

        const DummyComponent = <div>Shadow root host</div>

        const { container } = render(DummyComponent)

        const child = document.createElement('div')
        const shadow = child.attachShadow({ mode: 'open' })
        container.appendChild(child)

        renderHook(() => useInjectStyleToCandu(container))

        const styleTag = shadow.querySelector('style[data-candu-injected]')
        expect(styleTag).not.toBeNull()
        expect(styleTag?.textContent).toContain('.candu-typography')
    })

    it('should fallback to style tag when CSSStyleSheet.prototype.replaceSync is undefined', () => {
        const mockCSSStyleSheet =
            function () {} as unknown as typeof CSSStyleSheet
        mockCSSStyleSheet.prototype = {} as CSSStyleSheet
        globalThis.CSSStyleSheet = mockCSSStyleSheet

        const DummyComponent = <div>Shadow root host</div>

        const { container } = render(DummyComponent)

        const child = document.createElement('div')
        const shadow = child.attachShadow({ mode: 'open' })
        container.appendChild(child)

        renderHook(() => useInjectStyleToCandu(container))

        const styleTag = shadow.querySelector('style[data-candu-injected]')
        expect(styleTag).not.toBeNull()
        expect(styleTag?.textContent).toContain('.candu-card')
    })

    it('should fallback to style tag when CSSStyleSheet constructor throws', () => {
        const mockCSSStyleSheet = function () {
            throw new Error('CSSStyleSheet not supported')
        } as unknown as typeof CSSStyleSheet
        mockCSSStyleSheet.prototype = {
            replaceSync: jest.fn(),
        } as unknown as CSSStyleSheet
        globalThis.CSSStyleSheet = mockCSSStyleSheet

        const DummyComponent = <div>Shadow root host</div>

        const { container } = render(DummyComponent)

        const child = document.createElement('div')
        const shadow = child.attachShadow({ mode: 'open' })
        container.appendChild(child)

        renderHook(() => useInjectStyleToCandu(container))

        expect(shadow.adoptedStyleSheets).toHaveLength(0)

        const styleTag = shadow.querySelector('style[data-candu-injected]')
        expect(styleTag).not.toBeNull()
        expect(styleTag?.textContent).toContain('.candu-link')
    })

    it('should not inject duplicate style tags on multiple calls', () => {
        globalThis.CSSStyleSheet = undefined as unknown as typeof CSSStyleSheet

        const DummyComponent = <div>Shadow root host</div>

        const { container } = render(DummyComponent)

        const child = document.createElement('div')
        const shadow = child.attachShadow({ mode: 'open' })
        container.appendChild(child)

        const { rerender } = renderHook(() => useInjectStyleToCandu(container))
        rerender()

        const styleTags = shadow.querySelectorAll('style[data-candu-injected]')
        expect(styleTags).toHaveLength(1)
    })
})
