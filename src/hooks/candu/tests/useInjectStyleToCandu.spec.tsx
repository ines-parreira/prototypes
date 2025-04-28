import React from 'react'

import { render, waitFor } from '@testing-library/react'

import { renderHook } from 'utils/testing/renderHook'

import useInjectStyleToCandu from '../useInjectStyleToCandu'

describe('useInjectStyleToCandu', () => {
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
})
