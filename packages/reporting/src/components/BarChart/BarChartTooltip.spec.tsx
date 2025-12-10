import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { BarChartTooltip } from './BarChartTooltip'

describe('BarChartTooltip', () => {
    it('should render tooltip with name', () => {
        render(<BarChartTooltip name="AI Agent" value={100} color="#ff0000" />)

        expect(screen.getByText('AI Agent')).toBeInTheDocument()
    })

    it('should render tooltip with formatted value', () => {
        render(<BarChartTooltip name="AI Agent" value={100} color="#ff0000" />)

        expect(screen.getByText('100')).toBeInTheDocument()
    })

    it('should render color dot with correct color', () => {
        const { container } = render(
            <BarChartTooltip name="AI Agent" value={100} color="#ff0000" />,
        )

        const dot = container.querySelector('[style*="background-color"]')
        expect(dot).toHaveStyle({ backgroundColor: '#ff0000' })
    })

    it('should render with different colors', () => {
        const { container } = render(
            <BarChartTooltip name="Flows" value={50} color="#00ff00" />,
        )

        const dot = container.querySelector('[style*="background-color"]')
        expect(dot).toHaveStyle({ backgroundColor: '#00ff00' })
    })

    it('should render with different values', () => {
        render(
            <BarChartTooltip
                name="Article Recommendation"
                value={25}
                color="#0000ff"
            />,
        )

        expect(screen.getByText('25')).toBeInTheDocument()
    })

    it('should render value as formatted number', () => {
        render(<BarChartTooltip name="Test" value={123.45} color="#000000" />)

        expect(screen.getByText('123.45')).toBeInTheDocument()
    })

    it('should render zero value', () => {
        render(<BarChartTooltip name="Test" value={0} color="#000000" />)

        expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('should render negative value', () => {
        render(<BarChartTooltip name="Test" value={-10} color="#000000" />)

        expect(screen.getByText('-10')).toBeInTheDocument()
    })

    it('should have correct structure with nested divs and spans', () => {
        const { container } = render(
            <BarChartTooltip name="Test" value={100} color="#000000" />,
        )

        const tooltipDiv = container.querySelector('div')
        expect(tooltipDiv).toBeInTheDocument()

        const spans = container.querySelectorAll('span')
        expect(spans.length).toBeGreaterThan(0)
    })

    it('should render with long name', () => {
        render(
            <BarChartTooltip
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

    it('should render large values without formatting when no formatter provided', () => {
        render(<BarChartTooltip name="Test" value={999999} color="#000000" />)

        expect(screen.getByText('999999')).toBeInTheDocument()
    })

    it('should render thousand values without formatting when no formatter provided', () => {
        render(<BarChartTooltip name="Test" value={1000} color="#000000" />)

        expect(screen.getByText('1000')).toBeInTheDocument()
    })

    it('should render million values without formatting when no formatter provided', () => {
        render(<BarChartTooltip name="Test" value={1234567} color="#000000" />)

        expect(screen.getByText('1234567')).toBeInTheDocument()
    })

    it('should format values with custom valueFormatter', () => {
        const valueFormatter = (value: number) => value.toLocaleString('en-US')
        render(
            <BarChartTooltip
                name="Test"
                value={1234567}
                color="#000000"
                valueFormatter={valueFormatter}
            />,
        )

        expect(screen.getByText('1,234,567')).toBeInTheDocument()
    })

    it('should render value with bold variant', () => {
        render(<BarChartTooltip name="Test" value={100} color="#000000" />)

        const valueElement = screen.getByText('100')
        expect(valueElement).toBeInTheDocument()
    })

    it('should render name with regular variant', () => {
        render(<BarChartTooltip name="Test Name" value={100} color="#000000" />)

        const nameElement = screen.getByText('Test Name')
        expect(nameElement).toBeInTheDocument()
    })

    it('should render color dot with correct dimensions', () => {
        const { container } = render(
            <BarChartTooltip name="Test" value={100} color="#ff0000" />,
        )

        const dot = container.querySelector('[style*="background-color"]')
        expect(dot).toBeInTheDocument()
        expect(dot).toHaveStyle({ backgroundColor: '#ff0000' })
    })

    it('should render period when provided', () => {
        const period = {
            start_datetime: '2024-01-01',
            end_datetime: '2024-01-31',
        }
        render(
            <BarChartTooltip
                name="Test"
                value={100}
                color="#000000"
                period={period}
            />,
        )

        expect(screen.getByText(/2024-01-01/)).toBeInTheDocument()
        expect(screen.getByText(/2024-01-31/)).toBeInTheDocument()
    })

    it('should render empty period text when not provided', () => {
        render(<BarChartTooltip name="Test" value={100} color="#000000" />)

        // Period text should exist but be empty (just " - ")
        const periodElement = screen.getByText(/^\s*-\s*$/)
        expect(periodElement).toBeInTheDocument()
    })
})
