import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { DonutChartLegend } from './DonutChartLegend'

describe('DonutChartLegend', () => {
    const mockItems = [
        { name: 'Item 1', color: '#ff0000', percentage: '50%' },
        { name: 'Item 2', color: '#00ff00', percentage: '30%' },
        { name: 'Item 3', color: '#0000ff', percentage: '20%' },
    ]

    it('should render all legend items', () => {
        const mockOnToggle = vi.fn()
        render(
            <DonutChartLegend
                items={mockItems}
                hiddenSegments={new Set()}
                onToggleSegment={mockOnToggle}
            />,
        )

        expect(screen.getByText('Item 1')).toBeInTheDocument()
        expect(screen.getByText('Item 2')).toBeInTheDocument()
        expect(screen.getByText('Item 3')).toBeInTheDocument()
    })

    it('should render percentages for each item', () => {
        const mockOnToggle = vi.fn()
        render(
            <DonutChartLegend
                items={mockItems}
                hiddenSegments={new Set()}
                onToggleSegment={mockOnToggle}
            />,
        )

        expect(screen.getByText('50%')).toBeInTheDocument()
        expect(screen.getByText('30%')).toBeInTheDocument()
        expect(screen.getByText('20%')).toBeInTheDocument()
    })

    it('should render color dots with correct colors', () => {
        const mockOnToggle = vi.fn()
        const { container } = render(
            <DonutChartLegend
                items={mockItems}
                hiddenSegments={new Set()}
                onToggleSegment={mockOnToggle}
            />,
        )

        const dots = container.querySelectorAll('[style*="background-color"]')
        expect(dots).toHaveLength(3)
        expect(dots[0]).toHaveStyle({ backgroundColor: '#ff0000' })
        expect(dots[1]).toHaveStyle({ backgroundColor: '#00ff00' })
        expect(dots[2]).toHaveStyle({ backgroundColor: '#0000ff' })
    })

    it('should call onToggleSegment when item is clicked', async () => {
        const user = userEvent.setup()
        const mockOnToggle = vi.fn()
        render(
            <DonutChartLegend
                items={mockItems}
                hiddenSegments={new Set()}
                onToggleSegment={mockOnToggle}
            />,
        )

        const item1Button = screen.getByRole('button', { name: /item 1 50%/i })
        await user.click(item1Button)

        expect(mockOnToggle).toHaveBeenCalledWith('Item 1')
    })

    it('should apply reduced opacity to hidden segments', () => {
        const mockOnToggle = vi.fn()
        const hiddenSegments = new Set(['Item 2'])

        const { container } = render(
            <DonutChartLegend
                items={mockItems}
                hiddenSegments={hiddenSegments}
                onToggleSegment={mockOnToggle}
            />,
        )

        const dots = container.querySelectorAll('[style*="background-color"]')
        expect(dots[1]).toHaveStyle({ opacity: '0.3' })
    })

    it('should keep full opacity for visible segments', () => {
        const mockOnToggle = vi.fn()
        const hiddenSegments = new Set(['Item 2'])

        const { container } = render(
            <DonutChartLegend
                items={mockItems}
                hiddenSegments={hiddenSegments}
                onToggleSegment={mockOnToggle}
            />,
        )

        const dots = container.querySelectorAll('[style*="background-color"]')
        expect(dots[0]).toHaveStyle({ opacity: '1' })
        expect(dots[2]).toHaveStyle({ opacity: '1' })
    })

    it('should render buttons with type="button"', () => {
        const mockOnToggle = vi.fn()
        render(
            <DonutChartLegend
                items={mockItems}
                hiddenSegments={new Set()}
                onToggleSegment={mockOnToggle}
            />,
        )

        const buttons = screen.getAllByRole('button')
        buttons.forEach((button) => {
            expect(button).toHaveAttribute('type', 'button')
        })
    })

    it('should handle multiple hidden segments', () => {
        const mockOnToggle = vi.fn()
        const hiddenSegments = new Set(['Item 1', 'Item 3'])

        const { container } = render(
            <DonutChartLegend
                items={mockItems}
                hiddenSegments={hiddenSegments}
                onToggleSegment={mockOnToggle}
            />,
        )

        const dots = container.querySelectorAll('[style*="background-color"]')
        expect(dots[0]).toHaveStyle({ opacity: '0.3' })
        expect(dots[1]).toHaveStyle({ opacity: '1' })
        expect(dots[2]).toHaveStyle({ opacity: '0.3' })
    })

    it('should handle empty items array', () => {
        const mockOnToggle = vi.fn()
        render(
            <DonutChartLegend
                items={[]}
                hiddenSegments={new Set()}
                onToggleSegment={mockOnToggle}
            />,
        )

        const buttons = screen.queryAllByRole('button')
        expect(buttons).toHaveLength(0)
    })

    it('should be keyboard accessible', async () => {
        const mockOnToggle = vi.fn()
        render(
            <DonutChartLegend
                items={mockItems}
                hiddenSegments={new Set()}
                onToggleSegment={mockOnToggle}
            />,
        )

        const firstButton = screen.getByRole('button', {
            name: /item 1 50%/i,
        })
        firstButton.focus()

        expect(firstButton).toHaveFocus()
    })
})
