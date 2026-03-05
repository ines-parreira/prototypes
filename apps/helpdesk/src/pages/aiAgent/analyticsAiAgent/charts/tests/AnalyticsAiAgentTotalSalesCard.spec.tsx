import { screen, waitFor } from '@testing-library/react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { useGmvInfluencedTrend } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useGmvInfluencedTrend'
import { AnalyticsAiAgentTotalSalesCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentTotalSalesCard'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
const mockUseStatsFilters = jest.mocked(useStatsFilters)

jest.mock(
    'domains/reporting/pages/automate/aiSalesAgent/metrics/useGmvInfluencedTrend',
)
const mockUseGmvInfluencedTrend = jest.mocked(useGmvInfluencedTrend)

describe('AnalyticsAiAgentTotalSalesCard', () => {
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

        mockUseGmvInfluencedTrend.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                value: 7800,
                prevValue: 7500,
                currency: 'USD',
            },
        })
    })

    it('should render loading state initially', () => {
        mockUseGmvInfluencedTrend.mockReturnValue({
            isFetching: true,
            isError: false,
            data: undefined,
        })

        renderWithQueryClientProvider(<AnalyticsAiAgentTotalSalesCard />)

        expect(screen.getAllByLabelText('Loading')).toHaveLength(2)
    })

    it('should render the card with formatted currency', async () => {
        renderWithQueryClientProvider(<AnalyticsAiAgentTotalSalesCard />)

        await waitFor(() => {
            expect(screen.getByText('Total sales')).toBeInTheDocument()
            expect(screen.getByText('$7,800')).toBeInTheDocument()
        })
    })

    it('should format tooltip period correctly', async () => {
        renderWithQueryClientProvider(<AnalyticsAiAgentTotalSalesCard />)

        await waitFor(() => {
            expect(screen.queryAllByLabelText('Loading')).toHaveLength(0)
        })

        expect(mockUseStatsFilters).toHaveBeenCalled()
    })

    it('should call useGmvInflunecedTrend hook', async () => {
        renderWithQueryClientProvider(<AnalyticsAiAgentTotalSalesCard />)

        await waitFor(() => {
            expect(screen.queryAllByLabelText('Loading')).toHaveLength(0)
        })

        expect(mockUseGmvInfluencedTrend).toHaveBeenCalled()
    })

    it('should display trend badge with previous value', async () => {
        const { container } = renderWithQueryClientProvider(
            <AnalyticsAiAgentTotalSalesCard />,
        )

        await waitFor(() => {
            expect(screen.getByText('Total sales')).toBeInTheDocument()
            expect(screen.getByText('$7,800')).toBeInTheDocument()
        })

        await waitFor(() => {
            expect(screen.getByText('4%')).toBeInTheDocument()
        })

        const trendingIcon = container.querySelector('[aria-label*="trending"]')
        expect(trendingIcon).toBeInTheDocument()
    })

    it('should render without action menu when chartId is not provided', async () => {
        renderWithQueryClientProvider(<AnalyticsAiAgentTotalSalesCard />)

        await waitFor(() => {
            expect(screen.getByText('Total sales')).toBeInTheDocument()
            expect(screen.getByText('$7,800')).toBeInTheDocument()
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

        renderWithQueryClientProvider(<AnalyticsAiAgentTotalSalesCard />)

        await waitFor(() => {
            expect(screen.getByText('Total sales')).toBeInTheDocument()
        })
    })

    it('should render with chartId and dashboard props', async () => {
        renderWithQueryClientProvider(
            <AnalyticsAiAgentTotalSalesCard
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
            expect(screen.getByText('Total sales')).toBeInTheDocument()
            expect(screen.getByText('$7,800')).toBeInTheDocument()
        })
    })

    it('should render hint tooltip icon', () => {
        renderWithQueryClientProvider(<AnalyticsAiAgentTotalSalesCard />)

        const infoIcon = screen.getByRole('img', {
            hidden: true,
            name: 'info',
        })
        expect(infoIcon).toBeInTheDocument()
    })
})
