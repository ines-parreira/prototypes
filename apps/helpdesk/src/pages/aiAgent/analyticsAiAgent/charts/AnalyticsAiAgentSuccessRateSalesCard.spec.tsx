import { screen, waitFor } from '@testing-library/react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { useSuccessRateTrend } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useSuccessRateTrend'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

import { AnalyticsAiAgentSuccessRateSalesCard } from './AnalyticsAiAgentSuccessRateSalesCard'

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
const mockUseStatsFilters = jest.mocked(useStatsFilters)

jest.mock(
    'domains/reporting/pages/automate/aiSalesAgent/metrics/useSuccessRateTrend',
)
const mockUseSuccessRateTrend = jest.mocked(useSuccessRateTrend)

const mockChartConfig = {
    label: 'Success rate',
    description:
        'The percentage of interactions handled by the AI Agent that are fully resolved without any human escalation.',
    metricFormat: 'decimal-to-percent',
    interpretAs: 'more-is-better',
} as any

describe('AnalyticsAiAgentSuccessRateSalesCard', () => {
    const mockFilters: StatsFilters = {
        period: {
            start_datetime: '2024-06-25T00:00:00.000Z',
            end_datetime: '2024-07-01T23:59:59.999Z',
        },
    }

    beforeEach(() => {
        jest.resetAllMocks()

        mockUseStatsFilters.mockReturnValue({
            cleanStatsFilters: mockFilters,
            granularity: 'day',
            userTimezone: 'UTC',
        } as any)

        mockUseSuccessRateTrend.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                value: 0.6,
                prevValue: 0.4,
            },
        })
    })

    it('should render loading state initially', () => {
        mockUseSuccessRateTrend.mockReturnValue({
            isFetching: true,
            isError: false,
            data: undefined,
        })

        renderWithQueryClientProvider(
            <AnalyticsAiAgentSuccessRateSalesCard
                chartConfig={mockChartConfig}
            />,
        )

        expect(screen.getAllByLabelText('Loading')).toHaveLength(2)
    })

    it('should render the card with formatted percentage', async () => {
        renderWithQueryClientProvider(
            <AnalyticsAiAgentSuccessRateSalesCard
                chartConfig={mockChartConfig}
            />,
        )

        await waitFor(() => {
            expect(screen.getByText('Success rate')).toBeInTheDocument()
            expect(screen.getByText('60%')).toBeInTheDocument()
        })
    })

    it('should format tooltip period correctly', async () => {
        renderWithQueryClientProvider(
            <AnalyticsAiAgentSuccessRateSalesCard
                chartConfig={mockChartConfig}
            />,
        )

        await waitFor(() => {
            expect(screen.queryAllByLabelText('Loading')).toHaveLength(0)
        })

        expect(mockUseStatsFilters).toHaveBeenCalled()
    })

    it('should render hint tooltip icon', () => {
        renderWithQueryClientProvider(
            <AnalyticsAiAgentSuccessRateSalesCard
                chartConfig={mockChartConfig}
            />,
        )

        const infoIcon = screen.getByRole('img', {
            hidden: true,
            name: 'info',
        })
        expect(infoIcon).toBeInTheDocument()
    })

    it('should render without action menu when chartId is not provided', async () => {
        renderWithQueryClientProvider(
            <AnalyticsAiAgentSuccessRateSalesCard
                chartConfig={mockChartConfig}
            />,
        )

        await waitFor(() => {
            expect(screen.getByText('Success rate')).toBeInTheDocument()
            expect(screen.getByText('60%')).toBeInTheDocument()
        })
    })

    it('should handle different period for tooltip', async () => {
        mockUseStatsFilters.mockReturnValue({
            cleanStatsFilters: {
                ...mockFilters,
                period: {
                    start_datetime: '2024-01-01T00:00:00.000Z',
                    end_datetime: '2024-01-01T23:59:59.999Z',
                },
            },
            granularity: 'day',
            userTimezone: 'UTC',
        } as any)

        renderWithQueryClientProvider(
            <AnalyticsAiAgentSuccessRateSalesCard
                chartConfig={mockChartConfig}
            />,
        )

        await waitFor(() => {
            expect(screen.getByText('Success rate')).toBeInTheDocument()
        })
    })

    it('should render with chartId and dashboard props', async () => {
        renderWithQueryClientProvider(
            <AnalyticsAiAgentSuccessRateSalesCard
                chartId="test-chart-id"
                chartConfig={mockChartConfig}
                dashboard={{
                    id: 1,
                    name: 'Test Dashboard',
                    analytics_filter_id: 1,
                    children: [],
                    emoji: '🚀',
                }}
            />,
        )

        await waitFor(() => {
            expect(screen.getByText('Success rate')).toBeInTheDocument()
            expect(screen.getByText('60%')).toBeInTheDocument()
        })
    })

    it('should display trend badge with previous value', async () => {
        const { container } = renderWithQueryClientProvider(
            <AnalyticsAiAgentSuccessRateSalesCard
                chartConfig={mockChartConfig}
            />,
        )

        await waitFor(() => {
            expect(screen.getByText('Success rate')).toBeInTheDocument()
            expect(screen.getByText('60%')).toBeInTheDocument()
        })

        await waitFor(() => {
            expect(screen.getByText('50%')).toBeInTheDocument()
        })

        const trendingIcon = container.querySelector('[aria-label*="trending"]')
        expect(trendingIcon).toBeInTheDocument()
    })
})
