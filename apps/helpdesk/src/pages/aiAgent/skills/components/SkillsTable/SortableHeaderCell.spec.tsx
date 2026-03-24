import { render, screen } from '@testing-library/react'

import { ThemeProvider } from 'core/theme'

import { SortableHeaderCell } from './SortableHeaderCell'

describe('SortableHeaderCell', () => {
    const renderComponent = (
        props: Partial<React.ComponentProps<typeof SortableHeaderCell>> = {},
    ) => {
        const defaultProps = {
            label: 'Test Label',
            sortDirection: false as const,
        }

        return render(
            <ThemeProvider>
                <SortableHeaderCell {...defaultProps} {...props} />
            </ThemeProvider>,
        )
    }

    it('should render the label', () => {
        renderComponent({ label: 'Name' })

        expect(screen.getByText('Name')).toBeInTheDocument()
    })

    it('should hide sort arrow when sortDirection is false', () => {
        const { container } = renderComponent({ sortDirection: false })

        const sortIndicator = container.querySelector(
            '[class*="sortIndicator"]',
        )
        expect(sortIndicator).toBeInTheDocument()
    })

    it('should show sort arrow when sortDirection is asc or desc', () => {
        const { container, rerender } = render(
            <ThemeProvider>
                <SortableHeaderCell label="Test" sortDirection="asc" />
            </ThemeProvider>,
        )

        let sortIndicator = container.querySelector(
            '[class*="sortIndicatorVisible"]',
        )
        expect(sortIndicator).toBeInTheDocument()

        rerender(
            <ThemeProvider>
                <SortableHeaderCell label="Test" sortDirection="desc" />
            </ThemeProvider>,
        )

        sortIndicator = container.querySelector(
            '[class*="sortIndicatorVisible"]',
        )
        expect(sortIndicator).toBeInTheDocument()
    })

    it('should render tooltip when tooltipTitle is provided', () => {
        renderComponent({
            label: 'Ticket volume',
            tooltipTitle: 'Number of tickets using this skill',
        })

        expect(screen.getByLabelText('info')).toBeInTheDocument()
    })

    it('should not render tooltip when tooltipTitle is not provided', () => {
        renderComponent({ label: 'Name' })

        expect(screen.queryByLabelText('info')).not.toBeInTheDocument()
    })
})
