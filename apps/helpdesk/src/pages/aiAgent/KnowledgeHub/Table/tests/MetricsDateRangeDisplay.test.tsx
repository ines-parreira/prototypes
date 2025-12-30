import '@testing-library/jest-dom'

import { render, screen } from '@testing-library/react'

import { MetricsDateRangeDisplay } from '../MetricsDateRangeDisplay'

describe('MetricsDateRangeDisplay', () => {
    it('should display correct day difference for 28 days', () => {
        const startDate = new Date('2025-01-01T00:00:00Z')
        const endDate = new Date('2025-01-29T00:00:00Z')

        const dateRange = {
            start_datetime: startDate.toISOString(),
            end_datetime: endDate.toISOString(),
        }

        render(<MetricsDateRangeDisplay dateRange={dateRange} />)

        expect(
            screen.getByText('Metrics from last 28 days'),
        ).toBeInTheDocument()
    })

    it('should display correct day difference for 7 days', () => {
        const startDate = new Date('2025-01-01T00:00:00Z')
        const endDate = new Date('2025-01-08T00:00:00Z')

        const dateRange = {
            start_datetime: startDate.toISOString(),
            end_datetime: endDate.toISOString(),
        }

        render(<MetricsDateRangeDisplay dateRange={dateRange} />)

        expect(screen.getByText('Metrics from last 7 days')).toBeInTheDocument()
    })

    it('should display correct day difference for 1 day', () => {
        const startDate = new Date('2025-01-01T00:00:00Z')
        const endDate = new Date('2025-01-02T00:00:00Z')

        const dateRange = {
            start_datetime: startDate.toISOString(),
            end_datetime: endDate.toISOString(),
        }

        render(<MetricsDateRangeDisplay dateRange={dateRange} />)

        expect(screen.getByText('Metrics from last 1 days')).toBeInTheDocument()
    })

    it('should round fractional days correctly', () => {
        // 27.5 days should round to 28
        const startDate = new Date('2025-01-01T00:00:00Z')
        const endDate = new Date('2025-01-28T12:00:00Z')

        const dateRange = {
            start_datetime: startDate.toISOString(),
            end_datetime: endDate.toISOString(),
        }

        render(<MetricsDateRangeDisplay dateRange={dateRange} />)

        expect(
            screen.getByText('Metrics from last 28 days'),
        ).toBeInTheDocument()
    })

    it('should handle same day range (0 days)', () => {
        const startDate = new Date('2025-01-01T00:00:00Z')
        const endDate = new Date('2025-01-01T23:59:59Z')

        const dateRange = {
            start_datetime: startDate.toISOString(),
            end_datetime: endDate.toISOString(),
        }

        render(<MetricsDateRangeDisplay dateRange={dateRange} />)

        expect(screen.getByText('Metrics from last 1 days')).toBeInTheDocument()
    })

    it('should handle large day ranges', () => {
        const startDate = new Date('2024-01-01T00:00:00Z')
        const endDate = new Date('2025-01-01T00:00:00Z')

        const dateRange = {
            start_datetime: startDate.toISOString(),
            end_datetime: endDate.toISOString(),
        }

        render(<MetricsDateRangeDisplay dateRange={dateRange} />)

        // 366 days (2024 was a leap year)
        expect(
            screen.getByText(/Metrics from last \d+ days/),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Metrics from last 366 days'),
        ).toBeInTheDocument()
    })

    it('should render with correct text content', () => {
        const dateRange = {
            start_datetime: '2025-01-01T00:00:00Z',
            end_datetime: '2025-01-29T00:00:00Z',
        }

        render(<MetricsDateRangeDisplay dateRange={dateRange} />)

        // Check that the text is rendered with correct content
        const textElement = screen.getByText('Metrics from last 28 days')
        expect(textElement).toBeInTheDocument()
    })

    it('should format dates consistently regardless of time zones', () => {
        // Using UTC timestamps
        const dateRange = {
            start_datetime: '2025-01-01T00:00:00.000Z',
            end_datetime: '2025-01-15T00:00:00.000Z',
        }

        render(<MetricsDateRangeDisplay dateRange={dateRange} />)

        expect(
            screen.getByText('Metrics from last 14 days'),
        ).toBeInTheDocument()
    })

    it('should handle dates with milliseconds', () => {
        const dateRange = {
            start_datetime: '2025-01-01T00:00:00.123Z',
            end_datetime: '2025-01-08T00:00:00.789Z',
        }

        render(<MetricsDateRangeDisplay dateRange={dateRange} />)

        expect(screen.getByText('Metrics from last 7 days')).toBeInTheDocument()
    })
})
