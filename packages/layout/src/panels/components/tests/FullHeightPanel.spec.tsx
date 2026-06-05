import { render, screen } from '@testing-library/react'
import { afterAll, beforeAll, vi } from 'vitest'

import { FullHeightPanel } from '../FullHeightPanel'

const originalGetComputedStyle = window.getComputedStyle

describe('FullHeightPanel', () => {
    beforeAll(() => {
        vi.spyOn(window, 'getComputedStyle').mockImplementation((element) =>
            originalGetComputedStyle(element),
        )
    })

    afterAll(() => {
        vi.restoreAllMocks()
    })

    it('renders children inside a panel sized to fill its parent', () => {
        const { container } = render(
            <FullHeightPanel aria-label="settings panel">boop</FullHeightPanel>,
        )

        const panel = screen.getByLabelText('settings panel')
        expect(panel).toContainElement(screen.getByText('boop'))
        // Width/height pinned to 100% with min-height: 0 keeps the panel
        // sized to its parent and lets overflowing children scroll instead
        // of pushing the panel past the available space.
        expect(panel).toHaveStyle({
            width: '100%',
            height: '100%',
            'min-height': '0',
            'flex-direction': 'column',
        })
        // Exactly one panel wrapper around the children — doubling the
        // wrapper would silently break the full-height contract.
        expect(
            container.querySelectorAll('[aria-label="settings panel"]'),
        ).toHaveLength(1)
    })

    it('forwards extra Panel props to the underlying panel', () => {
        render(
            <FullHeightPanel aria-label="custom panel" data-testid="fhp">
                boop
            </FullHeightPanel>,
        )

        const panel = screen.getByLabelText('custom panel')
        expect(panel).toHaveAttribute('data-testid', 'fhp')
        expect(panel).toContainElement(screen.getByText('boop'))
    })
})
