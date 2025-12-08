import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ChartMetricSelect } from './ChartMetricSelect'

describe('DonutChartMetricSelect', () => {
    const mockMetrics = [
        { id: '1', label: 'Metric 1' },
        { id: '2', label: 'Metric 2' },
        { id: '3', label: 'Metric 3' },
    ]

    it('should render with selected metric', () => {
        const mockOnMetricChange = vi.fn()
        render(
            <ChartMetricSelect
                metrics={mockMetrics}
                selectedMetric="Metric 1"
                onMetricChange={mockOnMetricChange}
            />,
        )

        const trigger = screen.getByRole('button', { name: /metric 1/i })
        expect(trigger).toBeInTheDocument()
    })

    it('should render chevron icon in closed state by default', () => {
        const mockOnMetricChange = vi.fn()
        const { container } = render(
            <ChartMetricSelect
                metrics={mockMetrics}
                selectedMetric="Metric 1"
                onMetricChange={mockOnMetricChange}
            />,
        )

        const chevron = container.querySelector('[data-state="closed"]')
        expect(chevron).toBeInTheDocument()
    })

    it('should open dropdown when clicked', async () => {
        const user = userEvent.setup()
        const mockOnMetricChange = vi.fn()
        render(
            <ChartMetricSelect
                metrics={mockMetrics}
                selectedMetric="Metric 1"
                onMetricChange={mockOnMetricChange}
            />,
        )

        const trigger = screen.getByRole('button', { name: /metric 1/i })

        await user.click(trigger)

        const allMetric2s = screen.getAllByText('Metric 2')
        const allMetric3s = screen.getAllByText('Metric 3')
        expect(allMetric2s.length).toBeGreaterThan(0)
        expect(allMetric3s.length).toBeGreaterThan(0)
    })

    it('should call onMetricChange when a metric is selected', async () => {
        const user = userEvent.setup()
        const mockOnMetricChange = vi.fn()
        render(
            <ChartMetricSelect
                metrics={mockMetrics}
                selectedMetric="Metric 1"
                onMetricChange={mockOnMetricChange}
            />,
        )

        const trigger = screen.getByRole('button', { name: /metric 1/i })
        await user.click(trigger)

        const options = screen.getAllByRole('option')
        await user.click(options[1])

        expect(mockOnMetricChange).toHaveBeenCalled()
    })

    it('should show chevron in open state when dropdown is open', async () => {
        const user = userEvent.setup()
        const mockOnMetricChange = vi.fn()
        const { container } = render(
            <ChartMetricSelect
                metrics={mockMetrics}
                selectedMetric="Metric 1"
                onMetricChange={mockOnMetricChange}
            />,
        )

        const trigger = screen.getByRole('button', { name: /metric 1/i })
        await user.click(trigger)

        const chevron = container.querySelector('[data-state="open"]')
        expect(chevron).toBeInTheDocument()
    })

    it('should render all metrics in dropdown', async () => {
        const user = userEvent.setup()
        const mockOnMetricChange = vi.fn()
        render(
            <ChartMetricSelect
                metrics={mockMetrics}
                selectedMetric="Metric 1"
                onMetricChange={mockOnMetricChange}
            />,
        )

        const trigger = screen.getByRole('button', { name: /metric 1/i })
        await user.click(trigger)

        mockMetrics.forEach((metric) => {
            expect(screen.getAllByText(metric.label).length).toBeGreaterThan(0)
        })
    })
})
