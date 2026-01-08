import type { MigrationStage } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getNewStatsFeatureFlagMigration } from 'domains/reporting/utils/getNewStatsFeatureFlagMigration'
import { metricExecutionHandler } from 'domains/reporting/utils/metricExecutionHandler'
import { useGetNewStatsFeatureFlagMigration } from 'domains/reporting/utils/useGetNewStatsFeatureFlagMigration'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

import { AnalyticsOverviewAutomatedInteractionsCard } from './AnalyticsOverviewAutomatedInteractionsCard'

jest.mock('domains/reporting/utils/metricExecutionHandler')
const mockMetricExecutionHandler = assumeMock(metricExecutionHandler)

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
const mockUseStatsFilters = assumeMock(useStatsFilters)

jest.mock('domains/reporting/utils/getNewStatsFeatureFlagMigration')
const mockGetNewStatsFeatureFlagMigration = assumeMock(
    getNewStatsFeatureFlagMigration,
)

jest.mock('domains/reporting/utils/useGetNewStatsFeatureFlagMigration')
const mockUseGetNewStatsFeatureFlagMigration = assumeMock(
    useGetNewStatsFeatureFlagMigration,
)

describe('AnalyticsOverviewAutomatedInteractionsCard', () => {
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

        mockGetNewStatsFeatureFlagMigration.mockResolvedValue(
            'complete' as MigrationStage,
        )

        mockUseGetNewStatsFeatureFlagMigration.mockReturnValue(
            'complete' as MigrationStage,
        )

        mockMetricExecutionHandler.mockResolvedValue({
            data: {
                data: [
                    {
                        automatedInteractions: '4800',
                        automatedInteractionsByAutoResponders: '0',
                    },
                ],
            },
        } as any)
    })

    it('should render loading state initially', () => {
        renderWithQueryClientProvider(
            <AnalyticsOverviewAutomatedInteractionsCard />,
        )

        expect(screen.getAllByLabelText('Loading')).toHaveLength(2)
    })

    it('should render the card with formatted number', async () => {
        renderWithQueryClientProvider(
            <AnalyticsOverviewAutomatedInteractionsCard />,
        )

        await waitFor(() => {
            expect(
                screen.getByText('Automated interactions'),
            ).toBeInTheDocument()
            expect(screen.getByText('4,800')).toBeInTheDocument()
        })
    })

    it('should format tooltip period correctly', async () => {
        renderWithQueryClientProvider(
            <AnalyticsOverviewAutomatedInteractionsCard />,
        )

        await waitFor(() => {
            expect(screen.queryAllByLabelText('Loading')).toHaveLength(0)
        })

        expect(mockUseStatsFilters).toHaveBeenCalled()
    })

    it('should call metricExecutionHandler with correct queries', async () => {
        renderWithQueryClientProvider(
            <AnalyticsOverviewAutomatedInteractionsCard />,
        )

        await waitFor(() => {
            expect(mockMetricExecutionHandler).toHaveBeenCalled()
        })

        expect(mockMetricExecutionHandler).toHaveBeenCalledWith(
            expect.objectContaining({
                metricName: 'automate-automation-dataset',
            }),
        )
    })

    it('should display trend badge with previous value', async () => {
        mockMetricExecutionHandler
            .mockResolvedValueOnce({
                data: {
                    data: [
                        {
                            automatedInteractions: '4800',
                            automatedInteractionsByAutoResponders: '0',
                        },
                    ],
                },
            } as any)
            .mockResolvedValueOnce({
                data: {
                    data: [
                        {
                            automatedInteractions: '4600',
                            automatedInteractionsByAutoResponders: '0',
                        },
                    ],
                },
            } as any)

        const { container } = renderWithQueryClientProvider(
            <AnalyticsOverviewAutomatedInteractionsCard />,
        )

        await waitFor(() => {
            expect(
                screen.getByText('Automated interactions'),
            ).toBeInTheDocument()
            expect(screen.getByText('4,800')).toBeInTheDocument()
        })

        await waitFor(() => {
            expect(screen.getByText('200')).toBeInTheDocument()
        })

        const trendingIcon = container.querySelector('[aria-label*="trending"]')
        expect(trendingIcon).toBeInTheDocument()
    })

    it('should render without action menu when chartId is not provided', async () => {
        renderWithQueryClientProvider(
            <AnalyticsOverviewAutomatedInteractionsCard />,
        )

        await waitFor(() => {
            expect(
                screen.getByText('Automated interactions'),
            ).toBeInTheDocument()
            expect(screen.getByText('4,800')).toBeInTheDocument()
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
            <AnalyticsOverviewAutomatedInteractionsCard />,
        )

        await waitFor(() => {
            expect(
                screen.getByText('Automated interactions'),
            ).toBeInTheDocument()
        })
    })

    it('should render with chartId and dashboard props', async () => {
        renderWithQueryClientProvider(
            <AnalyticsOverviewAutomatedInteractionsCard
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
            expect(screen.getByText('4,800')).toBeInTheDocument()
        })
    })
})
