import { render, screen, waitFor } from '@testing-library/react'

import { useDecreaseInFirstResponseTimeTrend } from 'domains/reporting/hooks/automate/useDecreaseInFirstResponseTimeTrend'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { AnalyticsAiAgentDecreaseinFRTCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentDecreaseinFRTCard'

jest.mock(
    'domains/reporting/hooks/automate/useDecreaseInFirstResponseTimeTrend',
)
const mockUseDecreaseInFirstResponseTimeTrend = jest.mocked(
    useDecreaseInFirstResponseTimeTrend,
)

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
const mockUseStatsFilters = jest.mocked(useStatsFilters)

describe('AnalyticsAiAgentDecreaseinFRTCard', () => {
    const mockFilters: StatsFilters = {
        period: {
            start_datetime: '2024-06-25T00:00:00.000Z',
            end_datetime: '2024-07-01T23:59:59.999Z',
        },
    }

    beforeEach(() => {
        mockUseStatsFilters.mockReturnValue({
            cleanStatsFilters: mockFilters,
            granularity: 'day',
            userTimezone: 'UTC',
        } as any)

        mockUseDecreaseInFirstResponseTimeTrend.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                value: 88770,
                prevValue: 88200,
            },
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should render loading state initially', () => {
        mockUseDecreaseInFirstResponseTimeTrend.mockReturnValue({
            isFetching: true,
            isError: false,
            data: {
                value: 0,
                prevValue: 0,
            },
        })

        render(<AnalyticsAiAgentDecreaseinFRTCard />)

        expect(screen.getAllByLabelText('Loading')).toHaveLength(2)
    })

    it('should render the card with formatted number', async () => {
        render(<AnalyticsAiAgentDecreaseinFRTCard />)

        await waitFor(() => {
            expect(
                screen.getByText('Decrease in first response time'),
            ).toBeInTheDocument()
            expect(screen.getByText('1d 39m')).toBeInTheDocument()
        })
    })

    it('should call useStatsFilters', async () => {
        render(<AnalyticsAiAgentDecreaseinFRTCard />)

        await waitFor(() => {
            expect(screen.queryAllByLabelText('Loading')).toHaveLength(0)
        })

        expect(mockUseStatsFilters).toHaveBeenCalled()
    })

    it('should display trend badge with previous value', async () => {
        const { container } = render(<AnalyticsAiAgentDecreaseinFRTCard />)

        await waitFor(() => {
            expect(
                screen.getByText('Decrease in first response time'),
            ).toBeInTheDocument()
            expect(screen.getByText('1d 39m')).toBeInTheDocument()
        })

        await waitFor(() => {
            expect(screen.getByText('9m')).toBeInTheDocument()
        })

        const trendingIcon = container.querySelector('[aria-label*="trending"]')
        expect(trendingIcon).toBeInTheDocument()
    })

    it('should render without action menu when chartId is not provided', async () => {
        render(<AnalyticsAiAgentDecreaseinFRTCard />)

        await waitFor(() => {
            expect(
                screen.getByText('Decrease in first response time'),
            ).toBeInTheDocument()
            expect(screen.getByText('1d 39m')).toBeInTheDocument()
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

        render(<AnalyticsAiAgentDecreaseinFRTCard />)

        await waitFor(() => {
            expect(
                screen.getByText('Decrease in first response time'),
            ).toBeInTheDocument()
        })
    })

    it('should render with chartId and dashboard props', async () => {
        render(
            <AnalyticsAiAgentDecreaseinFRTCard
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
                screen.getByText('Decrease in first response time'),
            ).toBeInTheDocument()
            expect(screen.getByText('1d 39m')).toBeInTheDocument()
        })
    })
})
