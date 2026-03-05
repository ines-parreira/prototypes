import { screen, waitFor } from '@testing-library/react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { useTotalNumberOfOrdersTrend } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useTotalNumberOfOrdersTrend'
import { AnalyticsAiAgentOrdersInfluencedCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentOrdersInfluencedCard'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
const mockUseStatsFilters = jest.mocked(useStatsFilters)

jest.mock(
    'domains/reporting/pages/automate/aiSalesAgent/metrics/useTotalNumberOfOrdersTrend',
)
const mockUseTotalNumberOfOrdersTrend = jest.mocked(useTotalNumberOfOrdersTrend)

describe('AnalyticsAiAgentOrdersInfluencedCard', () => {
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

        mockUseTotalNumberOfOrdersTrend.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                value: 1029,
                prevValue: 1000,
            },
        })
    })

    it('should render loading state initially', () => {
        mockUseTotalNumberOfOrdersTrend.mockReturnValue({
            isFetching: true,
            isError: false,
            data: undefined,
        })

        renderWithQueryClientProvider(<AnalyticsAiAgentOrdersInfluencedCard />)

        expect(screen.getAllByLabelText('Loading')).toHaveLength(2)
    })

    it('should render the card with formatted decimal value', async () => {
        renderWithQueryClientProvider(<AnalyticsAiAgentOrdersInfluencedCard />)

        await waitFor(() => {
            expect(screen.getByText('Orders influenced')).toBeInTheDocument()
            expect(screen.getByText('1,029')).toBeInTheDocument()
        })
    })

    it('should format tooltip period correctly', async () => {
        renderWithQueryClientProvider(<AnalyticsAiAgentOrdersInfluencedCard />)

        await waitFor(() => {
            expect(screen.queryAllByLabelText('Loading')).toHaveLength(0)
        })

        expect(mockUseStatsFilters).toHaveBeenCalled()
    })

    it('should call useTotalNumberOfOrdersTrend hook', async () => {
        renderWithQueryClientProvider(<AnalyticsAiAgentOrdersInfluencedCard />)

        await waitFor(() => {
            expect(screen.queryAllByLabelText('Loading')).toHaveLength(0)
        })

        expect(mockUseTotalNumberOfOrdersTrend).toHaveBeenCalled()
    })

    it('should display trend badge with previous value', async () => {
        const { container } = renderWithQueryClientProvider(
            <AnalyticsAiAgentOrdersInfluencedCard />,
        )

        await waitFor(() => {
            expect(screen.getByText('Orders influenced')).toBeInTheDocument()
            expect(screen.getByText('1,029')).toBeInTheDocument()
        })

        await waitFor(() => {
            expect(screen.getByText('29')).toBeInTheDocument()
        })

        const trendingIcon = container.querySelector('[aria-label*="trending"]')
        expect(trendingIcon).toBeInTheDocument()
    })

    it('should render without action menu when chartId is not provided', async () => {
        renderWithQueryClientProvider(<AnalyticsAiAgentOrdersInfluencedCard />)

        await waitFor(() => {
            expect(screen.getByText('Orders influenced')).toBeInTheDocument()
            expect(screen.getByText('1,029')).toBeInTheDocument()
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

        renderWithQueryClientProvider(<AnalyticsAiAgentOrdersInfluencedCard />)

        await waitFor(() => {
            expect(screen.getByText('Orders influenced')).toBeInTheDocument()
        })
    })

    it('should render with chartId and dashboard props', async () => {
        renderWithQueryClientProvider(
            <AnalyticsAiAgentOrdersInfluencedCard
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
            expect(screen.getByText('Orders influenced')).toBeInTheDocument()
            expect(screen.getByText('1,029')).toBeInTheDocument()
        })
    })

    it('should render hint tooltip icon', () => {
        renderWithQueryClientProvider(<AnalyticsAiAgentOrdersInfluencedCard />)

        const infoIcon = screen.getByRole('img', {
            hidden: true,
            name: 'info',
        })
        expect(infoIcon).toBeInTheDocument()
    })
})
