import { screen, waitFor } from '@testing-library/react'

import { useAiAgentTimeSavedByAgentsTrend } from 'domains/reporting/hooks/automate/useAiAgentTimeSavedByAgentsTrend'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { AnalyticsAiAgentTimeSavedCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentTimeSavedCard'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
const mockUseStatsFilters = jest.mocked(useStatsFilters)

jest.mock('domains/reporting/hooks/automate/useAiAgentTimeSavedByAgentsTrend')
const mockUseAiAgentTimeSavedByAgentsTrend = jest.mocked(
    useAiAgentTimeSavedByAgentsTrend,
)

describe('AnalyticsAiAgentTimeSavedCard', () => {
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

        mockUseAiAgentTimeSavedByAgentsTrend.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                value: 20700,
                prevValue: 19800,
            },
        })
    })

    it('should render loading state initially', () => {
        mockUseAiAgentTimeSavedByAgentsTrend.mockReturnValue({
            isFetching: true,
            isError: false,
            data: {
                value: 0,
                prevValue: 0,
            },
        })

        renderWithQueryClientProvider(<AnalyticsAiAgentTimeSavedCard />)

        expect(screen.getAllByLabelText('Loading')).toHaveLength(2)
    })

    it('should render the card with formatted duration', async () => {
        renderWithQueryClientProvider(<AnalyticsAiAgentTimeSavedCard />)

        await waitFor(() => {
            expect(screen.getByText('Time saved by agents')).toBeInTheDocument()
            expect(screen.getByText('5h 45m')).toBeInTheDocument()
        })
    })

    it('should format tooltip period correctly', async () => {
        renderWithQueryClientProvider(<AnalyticsAiAgentTimeSavedCard />)

        await waitFor(() => {
            expect(screen.queryAllByLabelText('Loading')).toHaveLength(0)
        })

        expect(mockUseStatsFilters).toHaveBeenCalled()
    })

    it('should render hint tooltip icon', () => {
        renderWithQueryClientProvider(<AnalyticsAiAgentTimeSavedCard />)

        const infoIcon = screen.getByRole('img', {
            hidden: true,
            name: 'info',
        })
        expect(infoIcon).toBeInTheDocument()
    })

    it('should render without action menu when chartId is not provided', async () => {
        renderWithQueryClientProvider(<AnalyticsAiAgentTimeSavedCard />)

        await waitFor(() => {
            expect(screen.getByText('Time saved by agents')).toBeInTheDocument()
            expect(screen.getByText('5h 45m')).toBeInTheDocument()
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

        renderWithQueryClientProvider(<AnalyticsAiAgentTimeSavedCard />)

        await waitFor(() => {
            expect(screen.getByText('Time saved by agents')).toBeInTheDocument()
        })
    })

    it('should render with chartId and dashboard props', async () => {
        renderWithQueryClientProvider(
            <AnalyticsAiAgentTimeSavedCard
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
            expect(screen.getByText('Time saved by agents')).toBeInTheDocument()
            expect(screen.getByText('5h 45m')).toBeInTheDocument()
        })
    })

    it('should display trend badge with previous value', async () => {
        const { container } = renderWithQueryClientProvider(
            <AnalyticsAiAgentTimeSavedCard />,
        )

        await waitFor(() => {
            expect(screen.getByText('Time saved by agents')).toBeInTheDocument()
            expect(screen.getByText('5h 45m')).toBeInTheDocument()
        })

        await waitFor(() => {
            expect(screen.getByText('15m')).toBeInTheDocument()
        })

        const trendingIcon = container.querySelector('[aria-label*="trending"]')
        expect(trendingIcon).toBeInTheDocument()
    })
})
