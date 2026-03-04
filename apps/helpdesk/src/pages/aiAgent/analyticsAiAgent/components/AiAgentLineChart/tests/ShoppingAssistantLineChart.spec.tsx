import { render, screen } from '@testing-library/react'

import type { MetricTrendWithCurrency } from 'domains/reporting/hooks/useMetricTrend'
import type { TimeSeriesDataItem } from 'domains/reporting/hooks/useTimeSeries'
import { AiSalesAgentOrdersDimension } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { renderTickLabelAsNumber } from 'domains/reporting/pages/utils'

import { ShoppingAssistantLineChart } from '../ShoppingAssistantLineChart'

jest.mock('pages/aiAgent/Overview/hooks/useCurrency', () => ({
    useCurrency: () => ({ currency: 'USD' }),
}))

jest.mock('pages/aiAgent/analyticsOverview/utils/formatPreviousPeriod', () => ({
    formatPreviousPeriod: () => 'Jun 1 - Jun 7',
}))

jest.mock('@repo/reporting', () => ({
    formatCurrency: (value: number, currency: string) =>
        value.toLocaleString('en-US', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 2,
            minimumFractionDigits: 0,
        }),
    ChartCard: ({
        children,
        title,
        value,
        prevValue,
        metricFormat,
        currency,
        isLoading,
        metrics,
        onMetricChange,
    }: any) => (
        <div data-testid="chart-card">
            <div data-testid="chart-title">{title}</div>
            <div data-testid="chart-value">{value}</div>
            <div data-testid="chart-prev-value">{prevValue}</div>
            <div data-testid="chart-metric-format">{metricFormat}</div>
            <div data-testid="chart-currency">{currency}</div>
            <div data-testid="chart-loading">
                {isLoading ? 'loading' : 'loaded'}
            </div>
            {metrics && (
                <select
                    data-testid="metric-selector"
                    onChange={(e) => onMetricChange?.(e.target.value)}
                >
                    {metrics.map((m: any) => (
                        <option key={m.id} value={m.id}>
                            {m.label}
                        </option>
                    ))}
                </select>
            )}
            {children}
        </div>
    ),
    TimeSeriesChart: ({ data, isLoading, color, chartHeight }: any) => (
        <div data-testid="time-series-chart">
            <div data-testid="chart-data-length">{data?.length || 0}</div>
            <div data-testid="chart-is-loading">
                {isLoading ? 'loading' : 'loaded'}
            </div>
            <div data-testid="chart-color">{color}</div>
            <div data-testid="chart-height">{chartHeight}</div>
        </div>
    ),
}))

const mockGmvTrend: MetricTrendWithCurrency = {
    isFetching: false,
    isError: false,
    data: {
        value: 3800,
        prevValue: 3725,
        currency: 'USD',
    },
}

const mockGmvTimeSeries: {
    data: TimeSeriesDataItem[][]
    isError: boolean
    isFetching: boolean
} = {
    isFetching: false,
    isError: false,
    data: [
        [
            { dateTime: '2024-06-01', value: 2000 },
            { dateTime: '2024-06-02', value: 3500 },
            { dateTime: '2024-06-03', value: 3000 },
            { dateTime: '2024-06-04', value: 4000 },
            { dateTime: '2024-06-05', value: 3000 },
            { dateTime: '2024-06-06', value: 4500 },
            { dateTime: '2024-06-07', value: 2500 },
        ],
    ],
}

const mockFilters: StatsFilters = {
    period: {
        start_datetime: '2024-06-01T00:00:00.000Z',
        end_datetime: '2024-06-07T23:59:59.999Z',
    },
}

const renderComponent = (
    gmvTrend: MetricTrendWithCurrency = mockGmvTrend,
    gmvTimeSeries = mockGmvTimeSeries,
    granularity: ReportingGranularity = ReportingGranularity.Day,
    filters: StatsFilters = mockFilters,
) => {
    return render(
        <ShoppingAssistantLineChart
            gmvTrend={gmvTrend}
            gmvTimeSeries={gmvTimeSeries}
            granularity={granularity}
            filters={filters}
        />,
    )
}

describe('ShoppingAssistantLineChart', () => {
    it('should render the default metric title', () => {
        renderComponent()

        expect(screen.getByTestId('chart-title')).toHaveTextContent(
            'Total sales',
        )
    })

    it('should pass the correct value to ChartCard', () => {
        renderComponent()

        expect(screen.getByTestId('chart-value')).toHaveTextContent('3800')
    })

    it('should pass the correct prevValue to ChartCard', () => {
        renderComponent()

        expect(screen.getByTestId('chart-prev-value')).toHaveTextContent('3725')
    })

    it('should pass currency to ChartCard', () => {
        renderComponent()

        expect(screen.getByTestId('chart-currency')).toHaveTextContent('USD')
    })

    it('should pass metricFormat as currency-precision-1', () => {
        renderComponent()

        expect(screen.getByTestId('chart-metric-format')).toHaveTextContent(
            'currency-precision-1',
        )
    })

    it('should render TimeSeriesChart component', () => {
        renderComponent()

        expect(screen.getByTestId('time-series-chart')).toBeInTheDocument()
    })

    it('should format Y-axis values >= 1000 with compact notation', () => {
        expect(renderTickLabelAsNumber(1000)).toBe('1K')
        expect(renderTickLabelAsNumber(1500)).toBe('1.5K')
        expect(renderTickLabelAsNumber(2000)).toBe('2K')
    })

    it('should format Y-axis values < 1000 as plain numbers', () => {
        expect(renderTickLabelAsNumber(0)).toBe('0')
        expect(renderTickLabelAsNumber(500)).toBe('500')
        expect(renderTickLabelAsNumber(999)).toBe('999')
    })

    it('should format Y-axis values >= 1000000 with M suffix', () => {
        expect(renderTickLabelAsNumber(1000000)).toBe('1M')
        expect(renderTickLabelAsNumber(1500000)).toBe('1.5M')
        expect(renderTickLabelAsNumber(2000000)).toBe('2M')
    })

    it('should handle string values by returning them unchanged', () => {
        expect(renderTickLabelAsNumber('test')).toBe('test')
    })

    it('should pass custom value to ChartCard', () => {
        const customValueTrend: MetricTrendWithCurrency = {
            ...mockGmvTrend,
            data: {
                value: 5000,
                prevValue: 4000,
                currency: 'USD',
            },
        }
        renderComponent(customValueTrend)

        expect(screen.getByTestId('chart-value')).toHaveTextContent('5000')
    })

    it('should pass custom prevValue to ChartCard', () => {
        const customTrend: MetricTrendWithCurrency = {
            ...mockGmvTrend,
            data: {
                value: 4200,
                prevValue: 4000,
                currency: 'USD',
            },
        }
        renderComponent(customTrend)

        expect(screen.getByTestId('chart-prev-value')).toHaveTextContent('4000')
    })

    it('should use currency from time series raw data when trend currency is not available', () => {
        const trendWithoutCurrency: MetricTrendWithCurrency = {
            isFetching: false,
            isError: false,
            data: {
                value: 3800,
                prevValue: 3725,
                currency: undefined as any,
            },
        }

        const timeSeriesWithCurrency = {
            isFetching: false,
            isError: false,
            data: [
                [
                    {
                        dateTime: '2024-06-01',
                        value: 2000,
                        rawData: {
                            [AiSalesAgentOrdersDimension.Currency]: 'EUR',
                        },
                    },
                ],
            ],
        }

        renderComponent(trendWithoutCurrency, timeSeriesWithCurrency)

        expect(screen.getByTestId('chart-currency')).toHaveTextContent('EUR')
    })

    it('should use fallback currency when neither trend nor time series have currency', () => {
        const trendWithoutCurrency: MetricTrendWithCurrency = {
            isFetching: false,
            isError: false,
            data: {
                value: 3800,
                prevValue: 3725,
                currency: undefined as any,
            },
        }

        const timeSeriesWithoutCurrency = {
            isFetching: false,
            isError: false,
            data: [
                [
                    {
                        dateTime: '2024-06-01',
                        value: 2000,
                        rawData: {},
                    },
                ],
            ],
        }

        renderComponent(trendWithoutCurrency, timeSeriesWithoutCurrency)

        expect(screen.getByTestId('chart-currency')).toHaveTextContent('USD')
    })

    it('should render TimeSeriesChart with correct configuration', () => {
        renderComponent()

        expect(screen.getByTestId('time-series-chart')).toBeInTheDocument()
        expect(screen.getByTestId('chart-color')).toHaveTextContent('#A084E1')
        expect(screen.getByTestId('chart-height')).toHaveTextContent('280')
    })

    it('should display loading state when gmvTrend is fetching', () => {
        const loadingTrend: MetricTrendWithCurrency = {
            isFetching: true,
            isError: false,
            data: undefined,
        }

        renderComponent(loadingTrend)

        expect(screen.getByTestId('chart-loading')).toHaveTextContent('loading')
    })

    it('should display loading state when gmvTimeSeries is fetching', () => {
        const loadingTimeSeries = {
            isFetching: true,
            isError: false,
            data: [],
        }

        renderComponent(undefined, loadingTimeSeries)

        expect(screen.getByTestId('chart-loading')).toHaveTextContent('loading')
    })

    it('should pass undefined value to ChartCard when gmvTrend value is undefined', () => {
        const trendWithUndefinedData: MetricTrendWithCurrency = {
            isFetching: false,
            isError: false,
            data: undefined,
        }

        renderComponent(trendWithUndefinedData)

        expect(screen.getByTestId('chart-value')).toHaveTextContent('')
    })

    it('should pass 0 value to ChartCard when gmvTrend value is 0', () => {
        const trendWithZeroValue: MetricTrendWithCurrency = {
            isFetching: false,
            isError: false,
            data: {
                value: 0,
                prevValue: 3725,
                currency: 'USD',
            },
        }

        renderComponent(trendWithZeroValue)

        expect(screen.getByTestId('chart-value')).toHaveTextContent('0')
    })

    it('should handle empty time series data', () => {
        const emptyTimeSeries = {
            isFetching: false,
            isError: false,
            data: [],
        }

        renderComponent(undefined, emptyTimeSeries)

        expect(screen.getByTestId('time-series-chart')).toBeInTheDocument()
        expect(screen.getByTestId('chart-data-length')).toHaveTextContent('0')
    })

    it('should handle undefined time series data', () => {
        const undefinedTimeSeries = {
            isFetching: false,
            isError: false,
            data: undefined as any,
        }

        renderComponent(undefined, undefinedTimeSeries)

        expect(screen.getByTestId('time-series-chart')).toBeInTheDocument()
        expect(screen.getByTestId('chart-data-length')).toHaveTextContent('0')
    })

    it('should provide metric options to ChartCard', () => {
        renderComponent()

        const metricSelector = screen.getByTestId('metric-selector')
        expect(metricSelector).toBeInTheDocument()

        const options = Array.from(metricSelector.querySelectorAll('option'))
        expect(options).toHaveLength(1)
        expect(options[0]).toHaveTextContent('Total sales')
    })
})
