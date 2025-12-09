import { screen, waitFor } from '@testing-library/react'

import type { MigrationStage } from 'core/flags/utils/readMigration'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { postReportingV2 } from 'domains/reporting/models/resources'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getNewStatsFeatureFlagMigration } from 'domains/reporting/utils/getNewStatsFeatureFlagMigration'
import { useGetNewStatsFeatureFlagMigration } from 'domains/reporting/utils/useGetNewStatsFeatureFlagMigration'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

import { AnalyticsOverviewAutomatedInteractionsCard } from './AnalyticsOverviewAutomatedInteractionsCard'

jest.mock('domains/reporting/models/resources')
const mockPostReporting = jest.mocked(postReportingV2)

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
const mockUseStatsFilters = jest.mocked(useStatsFilters)

jest.mock('domains/reporting/utils/getNewStatsFeatureFlagMigration')
const mockGetNewStatsFeatureFlagMigration = jest.mocked(
    getNewStatsFeatureFlagMigration,
)

jest.mock('domains/reporting/utils/useGetNewStatsFeatureFlagMigration')
const mockUseGetNewStatsFeatureFlagMigration = jest.mocked(
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

        mockPostReporting.mockResolvedValue({
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

    it('should call postReporting with correct queries', async () => {
        renderWithQueryClientProvider(
            <AnalyticsOverviewAutomatedInteractionsCard />,
        )

        await waitFor(() => {
            expect(mockPostReporting).toHaveBeenCalled()
        })

        expect(mockPostReporting).toHaveBeenCalledWith(
            expect.objectContaining({
                metricName: 'automate-automation-dataset',
                measures: expect.arrayContaining([
                    'automatedInteractions',
                    'automatedInteractionsByAutoResponders',
                ]),
            }),
        )
    })

    it('should display trend badge with previous value', async () => {
        mockPostReporting
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
            expect(screen.getByText('4%')).toBeInTheDocument()
        })

        const trendingIcon = container.querySelector('[aria-label*="trending"]')
        expect(trendingIcon).toBeInTheDocument()
    })
})
