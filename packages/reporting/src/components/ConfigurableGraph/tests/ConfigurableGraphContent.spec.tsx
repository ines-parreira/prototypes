import { render, screen } from '@testing-library/react'

import { ConfigurableGraphContent } from '../components/ConfigurableGraphContent'

const { mockBarChart } = vi.hoisted(() => ({
    mockBarChart: vi.fn(),
}))

vi.mock('../../ChartCard', () => ({
    DonutChart: () => <div>DonutChart</div>,
    BarChart: (props: any) => {
        mockBarChart(props)
        return <div>BarChart</div>
    },
}))

vi.mock('../../HorizontalBarChart', () => ({
    HorizontalBarChart: () => <div>HorizontalBarChart</div>,
}))

vi.mock('../../TimeSeriesChart/TimeSeriesChart', () => ({
    TimeSeriesChart: () => <div>TimeSeriesChart</div>,
}))

vi.mock('../../TimeSeriesChart/MultipleTimeSeriesChart', () => ({
    MultipleTimeSeriesChart: () => <div>MultipleTimeSeriesChart</div>,
}))

vi.mock('../../SankeyChart/SankeyChart', () => ({
    SankeyChart: () => <div>SankeyChart</div>,
}))

describe('ConfigurableGraphContent', () => {
    const chartData = [{ name: 'Support', value: 10 }]
    const timeSeriesData = [{ date: '2024-01-01', value: 10 }]
    const multipleTimeSeriesData = [
        { label: 'Series A', values: [{ date: '2024-01-01', value: 10 }] },
    ]
    const sankeyData = {
        nodes: [{ name: 'A', color: '#A084E1' }],
        links: [{ source: 'A', target: 'B', value: 10 }],
    }

    describe('donut chart type', () => {
        it('renders DonutChart', () => {
            const groupingConfig = {
                id: 'by_feature',
                name: 'Feature',
                configurableGraphType: 'donut' as const,
                useChartData: () => ({ data: chartData, isLoading: false }),
            }

            render(<ConfigurableGraphContent groupingConfig={groupingConfig} />)

            expect(screen.getByText('DonutChart')).toBeInTheDocument()
        })

        it('renders NoDataPlaceholder when data is empty', () => {
            const groupingConfig = {
                id: 'by_feature',
                name: 'Feature',
                configurableGraphType: 'donut' as const,
                useChartData: () => ({ data: [], isLoading: false }),
            }

            render(<ConfigurableGraphContent groupingConfig={groupingConfig} />)

            expect(screen.getByText('No data found')).toBeInTheDocument()
        })

        it('does not render NoDataPlaceholder while loading', () => {
            const groupingConfig = {
                id: 'by_feature',
                name: 'Feature',
                configurableGraphType: 'donut' as const,
                useChartData: () => ({ data: [], isLoading: true }),
            }

            render(<ConfigurableGraphContent groupingConfig={groupingConfig} />)

            expect(screen.queryByText('No data found')).not.toBeInTheDocument()
        })
    })

    describe('line chart type', () => {
        beforeEach(() => {
            mockBarChart.mockClear()
        })

        it('renders BarChart when type is "bar"', () => {
            const groupingConfig = {
                id: 'by_feature',
                name: 'Feature',
                configurableGraphType: 'bar' as const,
                useChartData: () => ({ data: chartData, isLoading: false }),
            }

            render(<ConfigurableGraphContent groupingConfig={groupingConfig} />)

            expect(screen.getByText('BarChart')).toBeInTheDocument()
        })

        it('renders NoDataPlaceholder when data is empty', () => {
            const groupingConfig = {
                id: 'by_feature',
                name: 'Feature',
                configurableGraphType: 'bar' as const,
                useChartData: () => ({ data: [], isLoading: false }),
            }

            render(<ConfigurableGraphContent groupingConfig={groupingConfig} />)

            expect(screen.getByText('No data found')).toBeInTheDocument()
        })

        it('does not render NoDataPlaceholder while loading', () => {
            const groupingConfig = {
                id: 'by_feature',
                name: 'Feature',
                configurableGraphType: 'bar' as const,
                useChartData: () => ({ data: [], isLoading: true }),
            }

            render(<ConfigurableGraphContent groupingConfig={groupingConfig} />)

            expect(screen.queryByText('No data found')).not.toBeInTheDocument()
        })

        it('passes data sorted by value descending to BarChart', () => {
            const groupingConfig = {
                id: 'by_feature',
                name: 'Feature',
                configurableGraphType: 'bar' as const,
                useChartData: () => ({
                    data: [
                        { name: 'Low', value: 1 },
                        { name: 'High', value: 100 },
                        { name: 'Mid', value: 50 },
                    ],
                    isLoading: false,
                }),
            }

            render(<ConfigurableGraphContent groupingConfig={groupingConfig} />)

            expect(mockBarChart).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: [
                        { name: 'High', value: 100 },
                        { name: 'Mid', value: 50 },
                        { name: 'Low', value: 1 },
                    ],
                }),
            )
        })
    })

    describe('timeSeries chart type', () => {
        it('renders TimeSeriesChart', () => {
            const groupingConfig = {
                id: 'over_time',
                name: 'Over time',
                configurableGraphType: 'timeSeries' as const,
                useChartData: () => ({
                    data: timeSeriesData,
                    isLoading: false,
                }),
            }

            render(<ConfigurableGraphContent groupingConfig={groupingConfig} />)

            expect(screen.getByText('TimeSeriesChart')).toBeInTheDocument()
        })

        it('renders NoDataPlaceholder when data is empty', () => {
            const groupingConfig = {
                id: 'over_time',
                name: 'Over time',
                configurableGraphType: 'timeSeries' as const,
                useChartData: () => ({ data: [], isLoading: false }),
            }

            render(<ConfigurableGraphContent groupingConfig={groupingConfig} />)

            expect(screen.getByText('No data found')).toBeInTheDocument()
        })

        it('does not render NoDataPlaceholder while loading', () => {
            const groupingConfig = {
                id: 'over_time',
                name: 'Over time',
                configurableGraphType: 'timeSeries' as const,
                useChartData: () => ({ data: [], isLoading: true }),
            }

            render(<ConfigurableGraphContent groupingConfig={groupingConfig} />)

            expect(screen.queryByText('No data found')).not.toBeInTheDocument()
        })
    })

    describe('multipleTimeSeries chart type', () => {
        it('renders MultipleTimeSeriesChart', () => {
            const groupingConfig = {
                id: 'over_time_multiple',
                name: 'Over time',
                configurableGraphType: 'multipleTimeSeries' as const,
                useChartData: () => ({
                    data: multipleTimeSeriesData,
                    isLoading: false,
                }),
            }

            render(<ConfigurableGraphContent groupingConfig={groupingConfig} />)

            expect(
                screen.getByText('MultipleTimeSeriesChart'),
            ).toBeInTheDocument()
        })

        it('renders NoDataPlaceholder when data is empty', () => {
            const groupingConfig = {
                id: 'over_time_multiple',
                name: 'Over time',
                configurableGraphType: 'multipleTimeSeries' as const,
                useChartData: () => ({ data: [], isLoading: false }),
            }

            render(<ConfigurableGraphContent groupingConfig={groupingConfig} />)

            expect(screen.getByText('No data found')).toBeInTheDocument()
        })

        it('does not render NoDataPlaceholder while loading', () => {
            const groupingConfig = {
                id: 'over_time_multiple',
                name: 'Over time',
                configurableGraphType: 'multipleTimeSeries' as const,
                useChartData: () => ({ data: [], isLoading: true }),
            }

            render(<ConfigurableGraphContent groupingConfig={groupingConfig} />)

            expect(screen.queryByText('No data found')).not.toBeInTheDocument()
        })
    })

    describe('horizontal-bar chart type', () => {
        it('renders HorizontalBarChart', () => {
            const groupingConfig = {
                id: 'by_agent',
                name: 'By agent',
                configurableGraphType: 'horizontal-bar' as const,
                useChartData: () => ({ data: chartData, isLoading: false }),
            }

            render(<ConfigurableGraphContent groupingConfig={groupingConfig} />)

            expect(screen.getByText('HorizontalBarChart')).toBeInTheDocument()
        })

        it('renders NoDataPlaceholder when data is empty', () => {
            const groupingConfig = {
                id: 'by_agent',
                name: 'By agent',
                configurableGraphType: 'horizontal-bar' as const,
                useChartData: () => ({ data: [], isLoading: false }),
            }

            render(<ConfigurableGraphContent groupingConfig={groupingConfig} />)

            expect(screen.getByText('No data found')).toBeInTheDocument()
        })

        it('does not render NoDataPlaceholder while loading', () => {
            const groupingConfig = {
                id: 'by_agent',
                name: 'By agent',
                configurableGraphType: 'horizontal-bar' as const,
                useChartData: () => ({ data: [], isLoading: true }),
            }

            render(<ConfigurableGraphContent groupingConfig={groupingConfig} />)

            expect(screen.queryByText('No data found')).not.toBeInTheDocument()
        })
    })

    describe('sankey chart type', () => {
        it('renders SankeyChart', () => {
            const groupingConfig = {
                id: 'call_outcome',
                name: 'Call outcome',
                configurableGraphType: 'sankey' as const,
                useChartData: () => ({ data: sankeyData, isLoading: false }),
            }

            render(<ConfigurableGraphContent groupingConfig={groupingConfig} />)

            expect(screen.getByText('SankeyChart')).toBeInTheDocument()
        })

        it('renders NoDataPlaceholder when data is empty', () => {
            const groupingConfig = {
                id: 'call_outcome',
                name: 'Call outcome',
                configurableGraphType: 'sankey' as const,
                useChartData: () => ({
                    data: { nodes: [], links: [] },
                    isLoading: false,
                }),
            }

            render(<ConfigurableGraphContent groupingConfig={groupingConfig} />)

            expect(screen.getByText('No data found')).toBeInTheDocument()
        })

        it('does not render NoDataPlaceholder while loading', () => {
            const groupingConfig = {
                id: 'call_outcome',
                name: 'Call outcome',
                configurableGraphType: 'sankey' as const,
                useChartData: () => ({
                    data: { nodes: [], links: [] },
                    isLoading: true,
                }),
            }

            render(<ConfigurableGraphContent groupingConfig={groupingConfig} />)

            expect(screen.queryByText('No data found')).not.toBeInTheDocument()
        })
    })
})
