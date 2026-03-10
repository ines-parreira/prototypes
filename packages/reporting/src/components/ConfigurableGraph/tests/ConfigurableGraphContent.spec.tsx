import { render, screen } from '@testing-library/react'

import { ConfigurableGraphContent } from '../components/ConfigurableGraphContent'

vi.mock('../../ChartCard', () => ({
    DonutChart: () => <div>DonutChart</div>,
    BarChart: () => <div>BarChart</div>,
}))

vi.mock('../../HorizontalBarChart', () => ({
    HorizontalBarChart: () => <div>HorizontalBarChart</div>,
}))

vi.mock('../../TimeSeriesChart/TimeSeriesChart', () => ({
    TimeSeriesChart: () => <div>TimeSeriesChart</div>,
}))

describe('ConfigurableGraphContent', () => {
    const chartData = [{ name: 'Support', value: 10 }]
    const timeSeriesData = [{ date: '2024-01-01', value: 10 }]

    describe('donut chart type', () => {
        it('renders DonutChart', () => {
            const groupingConfig = {
                id: 'by_feature',
                name: 'Feature',
                chartType: 'donut' as const,
                useChartData: () => ({ data: chartData, isLoading: false }),
            }

            render(<ConfigurableGraphContent groupingConfig={groupingConfig} />)

            expect(screen.getByText('DonutChart')).toBeInTheDocument()
        })
    })
    describe('line chart type', () => {
        it('renders BarChart when type is "bar"', () => {
            const groupingConfig = {
                id: 'by_feature',
                name: 'Feature',
                chartType: 'bar' as const,
                useChartData: () => ({ data: chartData, isLoading: false }),
            }

            render(<ConfigurableGraphContent groupingConfig={groupingConfig} />)

            expect(screen.getByText('BarChart')).toBeInTheDocument()
        })
    })

    describe('line chart type', () => {
        it('renders TimeSeriesChart', () => {
            const groupingConfig = {
                id: 'over_time',
                name: 'Over time',
                chartType: 'line' as const,
                useChartData: () => ({
                    data: timeSeriesData,
                    isLoading: false,
                }),
            }

            render(<ConfigurableGraphContent groupingConfig={groupingConfig} />)

            expect(screen.getByText('TimeSeriesChart')).toBeInTheDocument()
        })
    })

    describe('horizontal-bar chart type', () => {
        it('renders HorizontalBarChart', () => {
            const groupingConfig = {
                id: 'by_agent',
                name: 'By agent',
                chartType: 'horizontal-bar' as const,
                useChartData: () => ({ data: chartData, isLoading: false }),
            }

            render(<ConfigurableGraphContent groupingConfig={groupingConfig} />)

            expect(screen.getByText('HorizontalBarChart')).toBeInTheDocument()
        })
    })
})
