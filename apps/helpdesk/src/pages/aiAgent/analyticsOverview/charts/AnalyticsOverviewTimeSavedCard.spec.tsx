import { screen, waitFor } from '@testing-library/react'

import type { MigrationStage } from 'core/flags/utils/readMigration'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { postReportingV2 } from 'domains/reporting/models/resources'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getNewStatsFeatureFlagMigration } from 'domains/reporting/utils/getNewStatsFeatureFlagMigration'
import { useGetNewStatsFeatureFlagMigration } from 'domains/reporting/utils/useGetNewStatsFeatureFlagMigration'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

import { AnalyticsOverviewTimeSavedCard } from './AnalyticsOverviewTimeSavedCard'

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

describe('AnalyticsOverviewTimeSavedCard', () => {
    const mockFilters: StatsFilters = {
        period: {
            start_datetime: '2024-06-25T00:00:00.000Z',
            end_datetime: '2024-07-01T23:59:59.999Z',
        },
    }

    const setupApiMocks = () => {
        mockPostReporting.mockImplementation((params: any) => {
            const startDateFilter = params.filters?.find(
                (f: any) => f.member === 'periodStart',
            )
            const isCurrentPeriod =
                startDateFilter?.values?.[0] === '2024-06-25T00:00:00.000'

            if (params.metricName === 'automate-automation-dataset') {
                return Promise.resolve({
                    data: {
                        data: [
                            {
                                automatedInteractions: isCurrentPeriod
                                    ? '19800'
                                    : '19400',
                                automatedInteractionsByAutoResponders: '0',
                            },
                        ],
                    },
                } as any)
            } else if (
                params.metricName === 'agentxp-ticket-average-handle-time'
            ) {
                return Promise.resolve({
                    data: {
                        data: [
                            {
                                averageHandleTime: '1',
                            },
                        ],
                    },
                } as any)
            }

            return Promise.reject(new Error('Unexpected metric'))
        })
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
    })

    it('should render loading state initially', () => {
        renderWithQueryClientProvider(<AnalyticsOverviewTimeSavedCard />)

        expect(screen.getAllByLabelText('Loading')).toHaveLength(2)
    })

    it('should render the card with formatted number', async () => {
        setupApiMocks()
        renderWithQueryClientProvider(<AnalyticsOverviewTimeSavedCard />)

        await waitFor(() => {
            expect(screen.getByText('Time saved by agents')).toBeInTheDocument()
            expect(screen.getByText('5h 30m')).toBeInTheDocument()
        })
    })

    it('should format tooltip period correctly', async () => {
        setupApiMocks()
        renderWithQueryClientProvider(<AnalyticsOverviewTimeSavedCard />)

        await waitFor(() => {
            expect(screen.queryAllByLabelText('Loading')).toHaveLength(0)
        })

        expect(mockUseStatsFilters).toHaveBeenCalled()
    })

    it('should call postReporting with correct queries', async () => {
        setupApiMocks()
        renderWithQueryClientProvider(<AnalyticsOverviewTimeSavedCard />)

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

        expect(mockPostReporting).toHaveBeenCalledWith(
            expect.objectContaining({
                metricName: 'agentxp-ticket-average-handle-time',
                measures: expect.arrayContaining(['averageHandleTime']),
            }),
        )
    })

    it('should display trend badge with previous value', async () => {
        setupApiMocks()
        renderWithQueryClientProvider(<AnalyticsOverviewTimeSavedCard />)

        await waitFor(() => {
            expect(screen.getByText('Time saved by agents')).toBeInTheDocument()
            expect(screen.getByText('5h 30m')).toBeInTheDocument()
        })

        await waitFor(() => {
            expect(screen.getByText('2%')).toBeInTheDocument()
        })
    })
})
