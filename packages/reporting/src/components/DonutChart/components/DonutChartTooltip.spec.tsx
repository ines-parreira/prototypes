import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { DonutChartTooltip } from './DonutChartTooltip'

describe('DonutChartTooltip', () => {
    it('should render tooltip with name', () => {
        render(
            <DonutChartTooltip name="AI Agent" value={100} color="#ff0000" />,
        )

        expect(screen.getByText('AI Agent')).toBeInTheDocument()
    })

    it('should render tooltip with value', () => {
        render(
            <DonutChartTooltip name="AI Agent" value={100} color="#ff0000" />,
        )

        expect(screen.getByText('100')).toBeInTheDocument()
    })

    it('should render color dot with correct color', () => {
        const { container } = render(
            <DonutChartTooltip name="AI Agent" value={100} color="#ff0000" />,
        )

        const dot = container.querySelector('[style*="background-color"]')
        expect(dot).toHaveStyle({ backgroundColor: '#ff0000' })
    })

    it('should render with different colors', () => {
        const { container } = render(
            <DonutChartTooltip name="Flows" value={50} color="#00ff00" />,
        )

        const dot = container.querySelector('[style*="background-color"]')
        expect(dot).toHaveStyle({ backgroundColor: '#00ff00' })
    })

    it('should render with different values', () => {
        render(
            <DonutChartTooltip
                name="Article Recommendation"
                value={25}
                color="#0000ff"
            />,
        )

        expect(screen.getByText('25')).toBeInTheDocument()
    })

    it('should render value as number', () => {
        render(<DonutChartTooltip name="Test" value={123.45} color="#000000" />)

        expect(screen.getByText('123.45')).toBeInTheDocument()
    })

    it('should render zero value', () => {
        render(<DonutChartTooltip name="Test" value={0} color="#000000" />)

        expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('should render negative value', () => {
        render(<DonutChartTooltip name="Test" value={-10} color="#000000" />)

        expect(screen.getByText('-10')).toBeInTheDocument()
    })

    it('should have correct structure with nested divs and spans', () => {
        const { container } = render(
            <DonutChartTooltip name="Test" value={100} color="#000000" />,
        )

        const tooltipDiv = container.querySelector('div')
        expect(tooltipDiv).toBeInTheDocument()

        const spans = container.querySelectorAll('span')
        expect(spans.length).toBeGreaterThan(0)
    })

    it('should render with long name', () => {
        render(
            <DonutChartTooltip
                name="Very Long Segment Name That Should Still Display"
                value={50}
                color="#ff00ff"
            />,
        )

        expect(
            screen.getByText(
                'Very Long Segment Name That Should Still Display',
            ),
        ).toBeInTheDocument()
    })

    it('should render with large value', () => {
        render(<DonutChartTooltip name="Test" value={999999} color="#000000" />)

        expect(screen.getByText('999999')).toBeInTheDocument()
    })
})
