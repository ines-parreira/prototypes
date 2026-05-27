import type { ReactNode } from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { useSkillPerformanceTrendFromContext } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/hooks/useSkillPerformanceTrendFromContext'

import { SkillPerformanceChart } from './SkillPerformanceChart'

const mockComposedMetricTimeSeriesChart = jest.fn((__props: unknown) => (
    <div data-testid="skill-performance-chart">Skill performance chart</div>
))
const mockChartCard = jest.fn(
    ({ title, children }: { title: ReactNode; children: ReactNode }) => (
        <div data-testid="skill-performance-chart-card">
            <div>{title}</div>
            {children}
        </div>
    ),
)

jest.mock(
    'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/hooks/useSkillPerformanceTrendFromContext',
    () => ({
        useSkillPerformanceTrendFromContext: jest.fn(),
    }),
)

jest.mock('@repo/reporting', () => ({
    ChartCard: (props: { title: ReactNode; children: ReactNode }) =>
        mockChartCard(props),
    ComposedMetricTimeSeriesChart: (props: unknown) =>
        mockComposedMetricTimeSeriesChart(props),
    NoDataPlaceholder: () => <div>No data found</div>,
}))

const mockUseSkillPerformanceTrendFromContext =
    useSkillPerformanceTrendFromContext as jest.Mock

type ChartProps = {
    data: { date: string; ticketVolume: number; csat: number | null }[]
    barMetric: {
        valueFormatter: (value: number) => string
        yAxisFormatter: (value: number) => string
        yAxisDomain?: [number, number]
    }
    lineMetric: {
        valueFormatter: (value: number) => string
        yAxisFormatter: (value: number) => string
        yAxisDomain?: [number, number]
    }
    dateFormatter: (date: string) => string
    markers?: unknown[]
    markerLegendLabel?: string
    isLoading?: boolean
}

const getChartProps = (): ChartProps =>
    mockComposedMetricTimeSeriesChart.mock.calls.at(-1)?.[0] as ChartProps

const mockDateRange = {
    start_datetime: '2026-04-01',
    end_datetime: '2026-04-28',
}

const renderChart = () => render(<SkillPerformanceChart />)

describe('SkillPerformanceChart', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseSkillPerformanceTrendFromContext.mockReturnValue({
            chartData: [
                { date: '2026-04-20', ticketVolume: 34, csat: 4.2 },
                { date: '2026-04-21', ticketVolume: 99, csat: 4.55 },
            ],
            chartMarkers: [],
            dateRange: mockDateRange,
            isLoading: false,
        })
    })

    it('renders the chart card titled with the line metric label when there is data', () => {
        renderChart()

        expect(
            screen.getByTestId('skill-performance-chart-card'),
        ).toHaveTextContent('CSAT')
        expect(
            screen.getByTestId('skill-performance-chart'),
        ).toBeInTheDocument()
        expect(screen.queryByText('No data found')).not.toBeInTheDocument()
    })

    it('renders the no-data placeholder when trend data is empty', () => {
        mockUseSkillPerformanceTrendFromContext.mockReturnValue({
            chartData: [],
            chartMarkers: undefined,
            dateRange: mockDateRange,
            isLoading: false,
        })

        renderChart()

        expect(screen.getByText('No data found')).toBeInTheDocument()
        expect(mockComposedMetricTimeSeriesChart).not.toHaveBeenCalled()
    })

    it('keeps the chart visible while loading rather than swapping in the no-data placeholder', () => {
        mockUseSkillPerformanceTrendFromContext.mockReturnValue({
            chartData: [],
            chartMarkers: undefined,
            dateRange: mockDateRange,
            isLoading: true,
        })

        renderChart()

        expect(screen.queryByText('No data found')).not.toBeInTheDocument()
        expect(mockComposedMetricTimeSeriesChart).toHaveBeenCalledWith(
            expect.objectContaining({ isLoading: true }),
        )
    })

    it('forwards the marker legend label and markers to the chart', () => {
        const markers = [
            {
                id: 'm1',
                date: '2026-04-25',
                label: 'Changes published',
            },
        ]

        mockUseSkillPerformanceTrendFromContext.mockReturnValue({
            chartData: [{ date: '2026-04-20', ticketVolume: 10, csat: 4.3 }],
            chartMarkers: markers,
            dateRange: mockDateRange,
            isLoading: false,
        })

        renderChart()

        expect(getChartProps().markerLegendLabel).toBe(
            'Changes published in skill',
        )
        expect(getChartProps().markers).toBe(markers)
    })

    describe('ticket volume Y axis domain', () => {
        const renderWithMaxTicketVolume = (maxTicketVolume: number) => {
            mockUseSkillPerformanceTrendFromContext.mockReturnValue({
                chartData: [
                    {
                        date: '2026-04-20',
                        ticketVolume: maxTicketVolume,
                        csat: 4.3,
                    },
                ],
                chartMarkers: [],
                dateRange: mockDateRange,
                isLoading: false,
            })

            renderChart()
        }

        it('omits the domain when there are no tickets so recharts can use defaults', () => {
            renderWithMaxTicketVolume(0)

            expect(getChartProps().barMetric.yAxisDomain).toBeUndefined()
        })

        it('uses Math.ceil for small values up to 10', () => {
            renderWithMaxTicketVolume(3)

            expect(getChartProps().barMetric.yAxisDomain).toEqual([0, 6])
        })

        it('rounds up scaled values to the nearest 1·10ⁿ, 2·10ⁿ, 5·10ⁿ, or 10·10ⁿ', () => {
            renderWithMaxTicketVolume(12)
            expect(getChartProps().barMetric.yAxisDomain).toEqual([0, 50])

            jest.clearAllMocks()
            renderWithMaxTicketVolume(60)
            expect(getChartProps().barMetric.yAxisDomain).toEqual([0, 200])

            jest.clearAllMocks()
            renderWithMaxTicketVolume(120)
            expect(getChartProps().barMetric.yAxisDomain).toEqual([0, 500])

            jest.clearAllMocks()
            renderWithMaxTicketVolume(300)
            expect(getChartProps().barMetric.yAxisDomain).toEqual([0, 1000])
        })

        it('uses the maximum ticket volume across the dataset', () => {
            mockUseSkillPerformanceTrendFromContext.mockReturnValue({
                chartData: [
                    { date: '2026-04-20', ticketVolume: 5, csat: 4.3 },
                    { date: '2026-04-21', ticketVolume: 80, csat: 4.3 },
                    { date: '2026-04-22', ticketVolume: 12, csat: 4.3 },
                ],
                chartMarkers: [],
                dateRange: mockDateRange,
                isLoading: false,
            })

            renderChart()

            expect(getChartProps().barMetric.yAxisDomain).toEqual([0, 200])
        })
    })

    describe('value formatters passed to the chart', () => {
        it('formats integer CSAT scores without decimals', () => {
            renderChart()

            expect(getChartProps().lineMetric.valueFormatter(4)).toBe('4')
            expect(getChartProps().lineMetric.yAxisFormatter(0)).toBe('0')
        })

        it('formats non-integer CSAT scores with a single decimal', () => {
            renderChart()

            expect(getChartProps().lineMetric.valueFormatter(3.14)).toBe('3.1')
        })

        it('locale-formats ticket counts', () => {
            renderChart()

            const expected = new Intl.NumberFormat().format(1234)

            expect(getChartProps().barMetric.valueFormatter(1234)).toBe(
                expected,
            )
            expect(getChartProps().barMetric.yAxisFormatter(1234)).toBe(
                expected,
            )
        })

        it('locks the CSAT line metric to a 0–5 domain', () => {
            renderChart()

            expect(getChartProps().lineMetric.yAxisDomain).toEqual([0, 5])
        })
    })

    describe('dateFormatter', () => {
        it('formats YYYY-MM-DD inputs as short EN-US dates without time-zone drift', () => {
            renderChart()

            expect(getChartProps().dateFormatter('2026-04-20')).toBe('Apr 20')
        })

        it('formats full ISO datetime strings as short EN-US dates', () => {
            renderChart()

            expect(getChartProps().dateFormatter('2026-04-20T15:30:00Z')).toBe(
                'Apr 20',
            )
        })
    })
})
