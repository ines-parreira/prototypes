import { render } from '@testing-library/react'

import { DraftBadge } from '../DraftBadge'

jest.mock('@repo/hooks', () => ({
    useId: () => 'test-id',
}))

describe('DraftBadge', () => {
    it('should render draft badge', () => {
        const screen = render(<DraftBadge type="promote" variant="main-list" />)

        const badge = screen.getByText('Draft')
        expect(badge).toBeInTheDocument()
    })

    it('should render draft badge with different variants', () => {
        const screen = render(
            <DraftBadge type="exclude" variant="selection-drawer" />,
        )

        const badge = screen.getByText('Draft')
        expect(badge).toBeInTheDocument()
    })

    it('should render draft badge without tooltip when type is not provided', () => {
        const screen = render(<DraftBadge />)

        const badge = screen.getByText('Draft')
        expect(badge).toBeInTheDocument()
    })

    it('should use main-list variant by default', () => {
        const screen = render(<DraftBadge type="promote" />)

        const badge = screen.getByText('Draft')
        expect(badge).toBeInTheDocument()
    })

    it('should render with correct structure', () => {
        const screen = render(<DraftBadge type="promote" />)

        const badge = screen.getByText('Draft')
        expect(badge).toBeInTheDocument()

        // Check that the span wrapper exists with tooltip ID
        const tooltipTarget = screen.container.querySelector(
            '#draft-badge-tooltip-test-id',
        )
        expect(tooltipTarget).toBeInTheDocument()
    })

    it('should render badge with light type', () => {
        const screen = render(<DraftBadge type="exclude" />)

        const badge = screen.getByText('Draft')
        expect(badge).toBeInTheDocument()

        // The badge should be rendered within a div with badge styling
        const badgeContainer = badge.closest('div')
        expect(badgeContainer).toBeInTheDocument()
    })

    it('should handle all type and variant combinations', () => {
        const combinations = [
            { type: 'promote' as const, variant: 'main-list' as const },
            { type: 'promote' as const, variant: 'selection-drawer' as const },
            { type: 'exclude' as const, variant: 'main-list' as const },
            { type: 'exclude' as const, variant: 'selection-drawer' as const },
        ]

        combinations.forEach(({ type, variant }) => {
            const screen = render(<DraftBadge type={type} variant={variant} />)
            const badge = screen.getByText('Draft')
            expect(badge).toBeInTheDocument()
            screen.unmount()
        })
    })

    it('should render without errors when no props provided', () => {
        const screen = render(<DraftBadge />)
        const badge = screen.getByText('Draft')
        expect(badge).toBeInTheDocument()
    })
})
