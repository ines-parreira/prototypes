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
    actionMenu: <div>ActionMenu</div>,
    tip: <div>Tip</div>,
    isLoading: false,
}

describe('MetricCard', () => {
    it('should render with header, children and tip', () => {
        const { container } = render(<MetricCard {...defaultProps} />)

        expect(screen.getByText('Children')).toBeInTheDocument()
        expect(screen.getByText('Tip')).toBeInTheDocument()
        expect(
            container.querySelector('[data-candu-id]'),
        ).not.toBeInTheDocument()
        expect(screen.queryByText('Loading')).not.toBeInTheDocument()
    })

    it('should render with loading state', () => {
        const { container } = render(
            <MetricCard {...defaultProps} isLoading data-candu-id="123" />,
        )

        expect(screen.getByText('Card')).toBeTruthy()
        expect(container.querySelector('[data-candu-id]')).toHaveAttribute(
            'data-candu-id',
            '123',
        )
        expect(screen.queryByText('Tip')).not.toBeInTheDocument()
        expect(screen.getAllByText('Loading')).toHaveLength(2)
    })
})
