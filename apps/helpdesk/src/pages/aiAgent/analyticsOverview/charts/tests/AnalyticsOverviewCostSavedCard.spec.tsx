import type { MigrationStage } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getNewStatsFeatureFlagMigration } from 'domains/reporting/utils/getNewStatsFeatureFlagMigration'
import { metricExecutionHandler } from 'domains/reporting/utils/metricExecutionHandler'
import { useGetNewStatsFeatureFlagMigration } from 'domains/reporting/utils/useGetNewStatsFeatureFlagMigration'
import { useMoneySavedPerInteractionWithAutomate } from 'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

import { AnalyticsOverviewCostSavedCard } from '../AnalyticsOverviewCostSavedCard'

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

jest.mock('pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate')
const mockUseMoneySavedPerInteractionWithAutomate = assumeMock(
    useMoneySavedPerInteractionWithAutomate,
)

describe('AnalyticsOverviewCostSavedCard', () => {
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

        mockUseMoneySavedPerInteractionWithAutomate.mockReturnValue(0.5)

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
        renderWithQueryClientProvider(<AnalyticsOverviewCostSavedCard />)

        expect(screen.getAllByLabelText('Loading')).toHaveLength(2)
    })

    it('should render the card with formatted currency', async () => {
        renderWithQueryClientProvider(<AnalyticsOverviewCostSavedCard />)

        await waitFor(() => {
            expect(screen.getByText('Cost saved')).toBeInTheDocument()
            expect(screen.getByText('$2,400')).toBeInTheDocument()
        })
    })

    it('should format tooltip period correctly', async () => {
        renderWithQueryClientProvider(<AnalyticsOverviewCostSavedCard />)

        await waitFor(() => {
            expect(screen.queryAllByLabelText('Loading')).toHaveLength(0)
        })

        expect(mockUseStatsFilters).toHaveBeenCalled()
    })

    it('should call metricExecutionHandler with correct queries', async () => {
        renderWithQueryClientProvider(<AnalyticsOverviewCostSavedCard />)

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
            <AnalyticsOverviewCostSavedCard />,
        )

        await waitFor(() => {
            expect(screen.getByText('Cost saved')).toBeInTheDocument()
            expect(screen.getByText('$2,400')).toBeInTheDocument()
        })

        await waitFor(() => {
            expect(screen.getByText('4%')).toBeInTheDocument()
        })

        const trendingIcon = container.querySelector('[aria-label*="trending"]')
        expect(trendingIcon).toBeInTheDocument()
    })
})
