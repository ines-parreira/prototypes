import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { HorizontalBarChartTooltip } from './HorizontalBarChartTooltip'

describe('HorizontalBarChartTooltip', () => {
    const defaultProps = {
        name: 'Order::Status',
        value: 150,
        color: '#7e55f6',
    }

    it('should render with name and value', () => {
        render(<HorizontalBarChartTooltip {...defaultProps} />)

        expect(screen.getByText('Order::Status')).toBeInTheDocument()
        expect(screen.getByText('150')).toBeInTheDocument()
    })

    it('should render with custom color', () => {
        const { container } = render(
            <HorizontalBarChartTooltip {...defaultProps} color="#ff0000" />,
        )

        const legendDot = container.querySelector(
            '[style*="background-color: rgb(255, 0, 0)"]',
        )
        expect(legendDot).toBeInTheDocument()
    })

    it('should apply valueFormatter when provided', () => {
        const valueFormatter = (value: number) => `$${value.toLocaleString()}`

        render(
            <HorizontalBarChartTooltip
                {...defaultProps}
                valueFormatter={valueFormatter}
            />,
        )

        expect(screen.getByText('$150')).toBeInTheDocument()
    })

    it('should render period when provided', () => {
        const period = {
            start_datetime: '2024-01-01',
            end_datetime: '2024-01-31',
        }

        render(<HorizontalBarChartTooltip {...defaultProps} period={period} />)

        expect(screen.getByText(/2024-01-01/)).toBeInTheDocument()
        expect(screen.getByText(/2024-01-31/)).toBeInTheDocument()
    })

    it('should render empty period text when period is not provided', () => {
        render(<HorizontalBarChartTooltip {...defaultProps} />)

        expect(screen.getByText('-')).toBeInTheDocument()
    })

    it('should format large values correctly without formatter', () => {
        render(<HorizontalBarChartTooltip {...defaultProps} value={1000000} />)

        expect(screen.getByText('1000000')).toBeInTheDocument()
    })

    it('should format large values correctly with formatter', () => {
        const valueFormatter = (value: number) => value.toLocaleString()

        render(
            <HorizontalBarChartTooltip
                {...defaultProps}
                value={1000000}
                valueFormatter={valueFormatter}
            />,
        )

        expect(screen.getByText('1,000,000')).toBeInTheDocument()
    })

    it('should render with zero value', () => {
        render(<HorizontalBarChartTooltip {...defaultProps} value={0} />)

        expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('should render with negative value', () => {
        render(<HorizontalBarChartTooltip {...defaultProps} value={-100} />)

        expect(screen.getByText('-100')).toBeInTheDocument()
    })

    it('should render with decimal value', () => {
        const valueFormatter = (value: number) => value.toFixed(2)

        render(
            <HorizontalBarChartTooltip
                {...defaultProps}
                value={123.456}
                valueFormatter={valueFormatter}
            />,
        )

        expect(screen.getByText('123.46')).toBeInTheDocument()
    })

    it('should render with special characters in name', () => {
        render(
            <HorizontalBarChartTooltip
                {...defaultProps}
                name="Order & Return (Special)"
            />,
        )

        expect(screen.getByText('Order & Return (Special)')).toBeInTheDocument()
    })

    it('should render with long name', () => {
        const longName =
            'This is a very long intent name that should still render correctly'

        render(<HorizontalBarChartTooltip {...defaultProps} name={longName} />)

        expect(screen.getByText(longName)).toBeInTheDocument()
    })

    it('should render legend dot with correct background color', () => {
        const { container } = render(
            <HorizontalBarChartTooltip {...defaultProps} />,
        )

        const legendDot = container.querySelector(
            '[style*="background-color: rgb(126, 85, 246)"]',
        )
        expect(legendDot).toBeInTheDocument()
    })
})
