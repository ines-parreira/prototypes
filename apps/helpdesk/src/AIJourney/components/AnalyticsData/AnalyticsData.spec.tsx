import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'

import { MetricProps } from 'AIJourney/hooks/useAIJourneyKpis/useAIJourneyKpis'
import { appQueryClient } from 'api/queryClient'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { getCleanStatsFiltersWithTimezone } from 'domains/reporting/state/ui/stats/selectors'
import { mockStore } from 'utils/testing'

import { AnalyticsData } from './AnalyticsData'

jest.mock('../AnalyticsBarChart/AnalyticsBarChart', () => ({
    AnalyticsBarChart: () => <div data-testid="analytics-bar-chart" />,
}))

jest.mock('domains/reporting/state/ui/stats/selectors')
const getCleanStatsFiltersWithTimezoneMock = assumeMock(
    getCleanStatsFiltersWithTimezone,
)

const period = {
    start: '1970-01-01T00:00:00+00:00',
    end: '1970-01-01T00:00:00+00:00',
}
const data = [
    {
        label: 'Total Revenue',
        value: 18844.569990999997,
        prevValue: 29886.970051,
        interpretAs: 'more-is-better',
        metricFormat: 'currency',
        currency: 'CAD',
        isLoading: false,
    },
    {
        label: 'Total Orders',
        value: 3,
        prevValue: 0,
        interpretAs: 'more-is-better',
        metricFormat: 'decimal-precision-1',
        isLoading: false,
    },
    {
        label: 'Conversion Rate',
        value: 789,
        prevValue: 0,
        interpretAs: 'more-is-better',
        metricFormat: 'percent',
        isLoading: false,
    },
    {
        label: 'Click Through Rate',
        value: 0,
        prevValue: 0,
        interpretAs: 'more-is-better',
        metricFormat: 'percent',
        currency: 'CAD',
        isLoading: false,
    },
] as MetricProps[]

const cleanStatsFilters = {
    period: {
        start_datetime: '1970-01-01T00:00:00+00:00',
        end_datetime: '1970-01-01T00:00:00+00:00',
    },
}

describe('<AnalyticsData />', () => {
    beforeEach(() => {
        getCleanStatsFiltersWithTimezoneMock.mockReturnValue({
            userTimezone: 'someTimezone',
            cleanStatsFilters,
            granularity: ReportingGranularity.Day,
        })
    })
    it('renders all digest metrics', () => {
        render(
            <QueryClientProvider client={appQueryClient}>
                <Provider store={mockStore({})}>
                    <AnalyticsData data={data} period={period} />{' '}
                </Provider>
            </QueryClientProvider>,
        )
        expect(screen.getByText('Total Revenue')).toBeInTheDocument()
        expect(screen.getByText('Total Orders')).toBeInTheDocument()
        expect(screen.getByText('Conversion Rate')).toBeInTheDocument()
        expect(screen.getByText('Click Through Rate')).toBeInTheDocument()
    })

    it('renders metric values', () => {
        render(
            <QueryClientProvider client={appQueryClient}>
                <Provider store={mockStore({})}>
                    <AnalyticsData data={data} period={period} />
                </Provider>
            </QueryClientProvider>,
        )
        expect(screen.getByText('CA$18,844.57')).toBeInTheDocument()
        expect(screen.getByText('3')).toBeInTheDocument()
        expect(screen.getByText('789%')).toBeInTheDocument()
    })

    it.skip('renders a bar chart for each metric', () => {
        render(
            <QueryClientProvider client={appQueryClient}>
                <Provider store={mockStore({})}>
                    <AnalyticsData data={data} period={period} />
                </Provider>
            </QueryClientProvider>,
        )
        expect(screen.getAllByTestId('analytics-bar-chart').length).toBe(4)
    })

    it('displays loading spinner when metric is loading', () => {
        // Data with one metric in loading state
        const loadingData = [
            {
                label: 'Loading Metric',
                value: null,
                prevValue: null,
                interpretAs: 'more-is-better',
                metricFormat: 'decimal-precision-1',
                isLoading: true,
            },
            ...data.slice(1), // Include other metrics from original data
        ] as MetricProps[]

        render(
            <QueryClientProvider client={appQueryClient}>
                <Provider store={mockStore({})}>
                    <AnalyticsData data={loadingData} period={period} />
                </Provider>
            </QueryClientProvider>,
        )

        expect(screen.getByText('Loading Metric')).toBeInTheDocument()
        expect(screen.getAllByText('Loading...')).toHaveLength(1)

        expect(screen.getByText('Total Orders')).toBeInTheDocument()
        expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('no data available', () => {
        render(
            <QueryClientProvider client={appQueryClient}>
                <Provider store={mockStore({})}>
                    <AnalyticsData data={[]} period={period} />
                </Provider>
            </QueryClientProvider>,
        )

        expect(screen.queryByText('Total Revenue')).not.toBeInTheDocument()
        expect(screen.queryByText('Total Orders')).not.toBeInTheDocument()
        expect(screen.queryByText('Conversion Rate')).not.toBeInTheDocument()
        expect(screen.queryByText('Click Through Rate')).not.toBeInTheDocument()
    })
})
