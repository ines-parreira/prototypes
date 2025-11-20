import { render, screen } from '@testing-library/react'

import { MetricCard } from './MetricCard'

vi.mock('@gorgias/axiom', () => ({
    Skeleton: () => <div>Loading</div>,
}))

vi.mock('@gorgias/analytics-ui-kit', () => ({
    Card: ({ children }: { children: React.ReactNode }) => (
        <>
            Card <>{children}</>
        </>
    ),
}))

const defaultProps = {
    children: <div>Children</div>,
    tip: <div>Tip</div>,
}

describe('MetricCard', () => {
    it('should render with children and tip', () => {
        const { container } = render(<MetricCard {...defaultProps} />)

        expect(screen.getByText('Children')).toBeInTheDocument()
        expect(screen.getByText('Tip')).toBeInTheDocument()
        expect(
            container.querySelector('[data-candu-id]'),
        ).not.toBeInTheDocument()
    })

    it('should render with data-candu-id attribute', () => {
        const { container } = render(
            <MetricCard {...defaultProps} data-candu-id="123" />,
        )

        expect(screen.getByText('Children')).toBeInTheDocument()
        expect(screen.getByText('Tip')).toBeInTheDocument()
        expect(container.querySelector('[data-candu-id]')).toHaveAttribute(
            'data-candu-id',
            '123',
        )
    })

    it('should not render tip when not provided', () => {
        render(<MetricCard>{defaultProps.children}</MetricCard>)

        expect(screen.getByText('Children')).toBeInTheDocument()
        expect(screen.queryByText('Tip')).not.toBeInTheDocument()
    })
})
