import { screen, waitFor } from '@testing-library/react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { useTotalSalePerInteractionTrend } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useTotalSalePerInteractionTrend'
import { AnalyticsAiAgentRevenuePerInteractionCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentRevenuePerInteractionCard'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
const mockUseStatsFilters = jest.mocked(useStatsFilters)

jest.mock(
    'domains/reporting/pages/automate/aiSalesAgent/metrics/useTotalSalePerInteractionTrend',
)
const mockUseTotalSalePerInteractionTrend = jest.mocked(
    useTotalSalePerInteractionTrend,
)

describe('AnalyticsAiAgentRevenuePerInteractionCard', () => {
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

        mockUseTotalSalePerInteractionTrend.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                value: 93,
                prevValue: 90,
            },
        })
    })

    it('should render loading state initially', () => {
        mockUseTotalSalePerInteractionTrend.mockReturnValue({
            isFetching: true,
            isError: false,
            data: undefined,
        })

        renderWithQueryClientProvider(
            <AnalyticsAiAgentRevenuePerInteractionCard />,
        )

        expect(screen.getAllByLabelText('Loading')).toHaveLength(2)
    })

    it('should render the card with formatted currency', async () => {
        renderWithQueryClientProvider(
            <AnalyticsAiAgentRevenuePerInteractionCard />,
        )

        await waitFor(() => {
            expect(
                screen.getByText('Revenue per interaction'),
            ).toBeInTheDocument()
            expect(screen.getByText('$93')).toBeInTheDocument()
        })
    })

    it('should format tooltip period correctly', async () => {
        renderWithQueryClientProvider(
            <AnalyticsAiAgentRevenuePerInteractionCard />,
        )

        await waitFor(() => {
            expect(screen.queryAllByLabelText('Loading')).toHaveLength(0)
        })

        expect(mockUseStatsFilters).toHaveBeenCalled()
    })

    it('should render hint tooltip icon', () => {
        renderWithQueryClientProvider(
            <AnalyticsAiAgentRevenuePerInteractionCard />,
        )

        const infoIcon = screen.getByRole('img', {
            hidden: true,
            name: 'info',
        })
        expect(infoIcon).toBeInTheDocument()
    })

    it('should render without action menu when chartId is not provided', async () => {
        renderWithQueryClientProvider(
            <AnalyticsAiAgentRevenuePerInteractionCard />,
        )

        await waitFor(() => {
            expect(
                screen.getByText('Revenue per interaction'),
            ).toBeInTheDocument()
            expect(screen.getByText('$93')).toBeInTheDocument()
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
            <AnalyticsAiAgentRevenuePerInteractionCard />,
        )

        await waitFor(() => {
            expect(
                screen.getByText('Revenue per interaction'),
            ).toBeInTheDocument()
        })
    })

    it('should render with chartId and dashboard props', async () => {
        renderWithQueryClientProvider(
            <AnalyticsAiAgentRevenuePerInteractionCard
                chartId="test-chart-id"
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
            expect(
                screen.getByText('Revenue per interaction'),
            ).toBeInTheDocument()
            expect(screen.getByText('$93')).toBeInTheDocument()
        })
    })

    it('should display trend badge with previous value', async () => {
        const { container } = renderWithQueryClientProvider(
            <AnalyticsAiAgentRevenuePerInteractionCard />,
        )

        await waitFor(() => {
            expect(
                screen.getByText('Revenue per interaction'),
            ).toBeInTheDocument()
            expect(screen.getByText('$93')).toBeInTheDocument()
        })

        await waitFor(() => {
            expect(screen.getByText('3%')).toBeInTheDocument()
        })

        const trendingIcon = container.querySelector('[aria-label*="trending"]')
        expect(trendingIcon).toBeInTheDocument()
    })
})
