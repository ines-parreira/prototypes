import { render, screen } from '@testing-library/react'

import type { MetricTrendWithCurrency } from 'domains/reporting/hooks/useMetricTrend'
import { ReportingGranularity } from 'domains/reporting/models/types'

import { AnalyticsShoppingAssistantLineChart } from '../AnalyticsShoppingAssistantLineChart'

jest.mock(
    'domains/reporting/hooks/support-performance/useStatsFilters',
    () => ({
        useStatsFilters: () => ({
            cleanStatsFilters: {
                period: {
                    startDatetime: '2024-06-01',
                    endDatetime: '2024-06-07',
                },
            },
            userTimezone: 'UTC',
            granularity: ReportingGranularity.Day,
        }),
    }),
)

jest.mock(
    'domains/reporting/pages/automate/aiSalesAgent/metrics/useGmvInfluencedTrend',
    () => ({
        useGmvInfluencedTrend: (): MetricTrendWithCurrency => ({
            isFetching: false,
            isError: false,
            data: {
                value: 3800,
                prevValue: 3725,
                currency: 'USD',
            },
        }),
    }),
)

jest.mock(
    'domains/reporting/pages/automate/aiSalesAgent/metrics/useGmvInfluenceOverTimeSeries',
    () => ({
        useGmvInfluenceOverTimeSeries: () => ({
            isFetching: false,
            isError: false,
            data: [
                [
                    { dateTime: '2024-06-01', value: 2000 },
                    { dateTime: '2024-06-02', value: 3500 },
                ],
            ],
        }),
    }),
)

jest.mock(
    '../../../components/AiAgentLineChart/ShoppingAssistantLineChart',
    () => ({
        ShoppingAssistantLineChart: ({
            filters,
        }: {
            __gmvTrend?: any
            __gmvTimeSeries?: any
            __granularity?: any
            filters?: any
        }) => (
            <div>
                ShoppingAssistantLineChart
                <div data-testid="filters-passed">
                    {filters ? 'filters-present' : 'no-filters'}
                </div>
            </div>
        ),
    }),
)

describe('AnalyticsShoppingAssistantLineChart', () => {
    it('should render ShoppingAssistantLineChart component', () => {
        render(<AnalyticsShoppingAssistantLineChart />)

        expect(
            screen.getByText('ShoppingAssistantLineChart'),
        ).toBeInTheDocument()
    })

    it('should pass filters to ShoppingAssistantLineChart', () => {
        render(<AnalyticsShoppingAssistantLineChart />)

        expect(screen.getByTestId('filters-passed')).toHaveTextContent(
            'filters-present',
        )
    })
})
