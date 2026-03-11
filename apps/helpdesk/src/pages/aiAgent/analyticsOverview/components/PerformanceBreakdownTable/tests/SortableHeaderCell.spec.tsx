import { render, screen } from '@testing-library/react'

import { SortableHeaderCell } from 'pages/aiAgent/analyticsOverview/components/PerformanceBreakdownTable/SortableHeaderCell'

const renderComponent = (
    props: Partial<Parameters<typeof SortableHeaderCell>[0]> = {},
) =>
    render(
        <SortableHeaderCell
            label="Overall automation rate"
            sortDirection={false}
            {...props}
        />,
    )

describe('SortableHeaderCell', () => {
    it('should render the label', () => {
        renderComponent()

        expect(screen.getByText('Overall automation rate')).toBeInTheDocument()
    })

    it('should render a tooltip when tooltipTitle is provided', () => {
        const { container } = renderComponent({
            tooltipTitle: 'Tooltip title',
        })

        expect(
            container.querySelector('[aria-label="info"]'),
        ).toBeInTheDocument()
    })

    it('should not render a tooltip when tooltipTitle is not provided', () => {
        const { container } = renderComponent({ tooltipTitle: undefined })

        expect(
            container.querySelector('[aria-label="info"]'),
        ).not.toBeInTheDocument()
    })

    describe('sortDirection', () => {
        it('should hide the sort icon when sortDirection is false', () => {
            const { container } = renderComponent({ sortDirection: false })

            const sortIconWrapper = container.querySelector(
                'span[style*="visibility: hidden"]',
            )
            expect(sortIconWrapper).toBeInTheDocument()
        })

        it('should show arrow-down icon when sortDirection is "asc"', () => {
            const { container } = renderComponent({ sortDirection: 'asc' })

            const sortIconWrapper = container.querySelector(
                'span[style*="visibility: visible"]',
            )
            expect(sortIconWrapper).toBeInTheDocument()
            expect(
                sortIconWrapper?.querySelector('[aria-label="arrow-down"]'),
            ).toBeInTheDocument()
        })

        it('should show arrow-up icon when sortDirection is "desc"', () => {
            const { container } = renderComponent({ sortDirection: 'desc' })

            const sortIconWrapper = container.querySelector(
                'span[style*="visibility: visible"]',
            )
            expect(sortIconWrapper).toBeInTheDocument()
            expect(
                sortIconWrapper?.querySelector('[aria-label="arrow-up"]'),
            ).toBeInTheDocument()
        })
    })
})
