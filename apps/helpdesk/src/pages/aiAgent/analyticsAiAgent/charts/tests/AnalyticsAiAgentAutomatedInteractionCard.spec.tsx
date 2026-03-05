import { assumeMock } from '@repo/testing'
import type { UseQueryResult } from '@tanstack/react-query'
import { screen, waitFor } from '@testing-library/react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { usePostReportingV2 } from 'domains/reporting/models/queries'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { useGetNewStatsFeatureFlagMigration } from 'domains/reporting/utils/useGetNewStatsFeatureFlagMigration'
import { AnalyticsAiAgentAutomatedInteractionsCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentAutomatedInteractionCard'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

jest.mock('domains/reporting/models/queries')
const mockUsePostReportingV2 = assumeMock(usePostReportingV2)

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
const mockUseStatsFilters = assumeMock(useStatsFilters)

jest.mock('domains/reporting/utils/useGetNewStatsFeatureFlagMigration')
const mockUseGetNewStatsFeatureFlagMigration = assumeMock(
    useGetNewStatsFeatureFlagMigration,
)

describe('AnalyticsAiAgentAutomatedInteractionsCard', () => {
    const mockFilters: StatsFilters = {
        period: {
            start_datetime: '2024-06-25T00:00:00.000Z',
            end_datetime: '2024-07-01T23:59:59.999Z',
        },
    }

    const defaultReporting = {
        isFetching: false,
        isError: false,
    } as UseQueryResult

    beforeEach(() => {
        jest.resetAllMocks()

        mockUseStatsFilters.mockReturnValue({
            cleanStatsFilters: mockFilters,
            granularity: 'day',
            userTimezone: 'UTC',
        } as any)

        mockUseGetNewStatsFeatureFlagMigration.mockReturnValue('complete')

        mockUsePostReportingV2.mockReturnValue({
            ...defaultReporting,
            data: { automatedInteractions: '6200' },
        } as UseQueryResult)
    })

    it('should render loading state initially', () => {
        mockUsePostReportingV2.mockReturnValue({
            isFetching: true,
            isError: false,
            data: undefined,
        } as UseQueryResult)

        renderWithQueryClientProvider(
            <AnalyticsAiAgentAutomatedInteractionsCard />,
        )

        expect(screen.getAllByLabelText('Loading')).toHaveLength(2)
    })

    it('should render the card with formatted number', async () => {
        renderWithQueryClientProvider(
            <AnalyticsAiAgentAutomatedInteractionsCard />,
        )

        await waitFor(() => {
            expect(
                screen.getByText('Automated interactions'),
            ).toBeInTheDocument()
            expect(screen.getByText('6,200')).toBeInTheDocument()
        })
    })

    it('should format tooltip period correctly', async () => {
        renderWithQueryClientProvider(
            <AnalyticsAiAgentAutomatedInteractionsCard />,
        )

        await waitFor(() => {
            expect(screen.queryAllByLabelText('Loading')).toHaveLength(0)
        })

        expect(mockUseStatsFilters).toHaveBeenCalled()
    })

    it('should display trend badge with previous value', async () => {
        mockUsePostReportingV2
            .mockReturnValueOnce({
                ...defaultReporting,
                data: { automatedInteractions: '6200' },
            } as UseQueryResult)
            .mockReturnValueOnce({
                ...defaultReporting,
                data: { automatedInteractions: '6000' },
            } as UseQueryResult)

        const { container } = renderWithQueryClientProvider(
            <AnalyticsAiAgentAutomatedInteractionsCard />,
        )

        await waitFor(() => {
            expect(
                screen.getByText('Automated interactions'),
            ).toBeInTheDocument()
            expect(screen.getByText('6,200')).toBeInTheDocument()
        })

        await waitFor(() => {
            expect(screen.getByText('200')).toBeInTheDocument()
        })

        const trendingIcon = container.querySelector('[aria-label*="trending"]')
        expect(trendingIcon).toBeInTheDocument()
    })

    it('should render without action menu when chartId is not provided', async () => {
        renderWithQueryClientProvider(
            <AnalyticsAiAgentAutomatedInteractionsCard />,
        )

        await waitFor(() => {
            expect(
                screen.getByText('Automated interactions'),
            ).toBeInTheDocument()
            expect(screen.getByText('6,200')).toBeInTheDocument()
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
            <AnalyticsAiAgentAutomatedInteractionsCard />,
        )

        await waitFor(() => {
            expect(
                screen.getByText('Automated interactions'),
            ).toBeInTheDocument()
        })
    })

    it('should render with chartId and dashboard props', async () => {
        renderWithQueryClientProvider(
            <AnalyticsAiAgentAutomatedInteractionsCard
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
                screen.getByText('Automated interactions'),
            ).toBeInTheDocument()
            expect(screen.getByText('6,200')).toBeInTheDocument()
        })
    })
})
