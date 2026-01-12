import { render, screen } from '@testing-library/react'
import moment from 'moment-timezone'

import { LastUpdatedDateFilter } from '../LastUpdatedDateFilter'

describe('LastUpdatedDateFilter', () => {
    const mockOnChange = jest.fn()
    const mockOnClear = jest.fn()

    beforeEach(() => {
        mockOnChange.mockClear()
        mockOnClear.mockClear()
    })

    it('renders FilterButton with default label when no dates selected', () => {
        render(
            <LastUpdatedDateFilter
                startDate={null}
                endDate={null}
                onChange={mockOnChange}
                onClear={mockOnClear}
            />,
        )

        expect(screen.getByText('Last updated date')).toBeInTheDocument()
        expect(screen.getByText('Select date')).toBeInTheDocument()
    })

    it('renders FilterButton with date range when dates are selected', () => {
        const startDate = moment('2025-01-01').toISOString()
        const endDate = moment('2025-01-31').toISOString()

        render(
            <LastUpdatedDateFilter
                startDate={startDate}
                endDate={endDate}
                onChange={mockOnChange}
                onClear={mockOnClear}
            />,
        )

        expect(screen.getByText('Last updated date')).toBeInTheDocument()
        expect(
            screen.getByText(/jan 1, 2025 - jan 31, 2025/i),
        ).toBeInTheDocument()
    })

    it('opens DateRangePicker automatically when no dates selected', async () => {
        render(
            <LastUpdatedDateFilter
                startDate={null}
                endDate={null}
                onChange={mockOnChange}
                onClear={mockOnClear}
            />,
        )

        // Verify picker is open by checking for preset menu
        expect(await screen.findByRole('menu')).toBeInTheDocument()
        expect(screen.getByText('Today')).toBeInTheDocument()
    })

    it('shows clear button when dates are selected', () => {
        const startDate = moment('2025-01-01').toISOString()
        const endDate = moment('2025-01-31').toISOString()

        render(
            <LastUpdatedDateFilter
                startDate={startDate}
                endDate={endDate}
                onChange={mockOnChange}
                onClear={mockOnClear}
            />,
        )

        // Verify clear button is present
        const clearButton = screen.getByLabelText(/close/i)
        expect(clearButton).toBeInTheDocument()
    })

    it('formats date range correctly', () => {
        const startDate = moment('2025-06-15').toISOString()
        const endDate = moment('2025-11-26').toISOString()

        render(
            <LastUpdatedDateFilter
                startDate={startDate}
                endDate={endDate}
                onChange={mockOnChange}
                onClear={mockOnClear}
            />,
        )

        expect(screen.getByText('Last updated date')).toBeInTheDocument()
        expect(
            screen.getByText(/jun 15, 2025 - nov 26, 2025/i),
        ).toBeInTheDocument()
    })

    it('displays preset label when "Today" preset is selected', () => {
        const now = moment().startOf('day')
        const startDate = now.clone().toISOString()
        const endDate = now.clone().toISOString()

        render(
            <LastUpdatedDateFilter
                startDate={startDate}
                endDate={endDate}
                onChange={mockOnChange}
                onClear={mockOnClear}
            />,
        )

        expect(screen.getByText('Last updated date')).toBeInTheDocument()

        // Check for the "Today" text in the FilterValue (there will be multiple "Today" texts)
        const todayElements = screen.getAllByText('Today')
        // At least one should exist (in the filter value)
        expect(todayElements.length).toBeGreaterThan(0)
    })

    it('displays preset label when "Last 7 days" preset is selected', () => {
        const now = moment().startOf('day')
        const startDate = now.clone().subtract(7, 'days').toISOString()
        const endDate = now.clone().toISOString()

        render(
            <LastUpdatedDateFilter
                startDate={startDate}
                endDate={endDate}
                onChange={mockOnChange}
                onClear={mockOnClear}
            />,
        )

        expect(screen.getByText('Last updated date')).toBeInTheDocument()

        // Check for the "Last 7 days" text in the FilterValue
        const last7DaysElements = screen.getAllByText('Last 7 days')
        expect(last7DaysElements.length).toBeGreaterThan(0)
    })

    it('displays preset label when "Last 30 days" preset is selected', () => {
        const now = moment().startOf('day')
        const startDate = now.clone().subtract(30, 'days').toISOString()
        const endDate = now.clone().toISOString()

        render(
            <LastUpdatedDateFilter
                startDate={startDate}
                endDate={endDate}
                onChange={mockOnChange}
                onClear={mockOnClear}
            />,
        )

        expect(screen.getByText('Last updated date')).toBeInTheDocument()

        // Check for the "Last 30 days" text in the FilterValue
        const last30DaysElements = screen.getAllByText('Last 30 days')
        expect(last30DaysElements.length).toBeGreaterThan(0)
    })
})
