import { screen, waitFor } from '@testing-library/react'

import type { MigrationStage } from 'core/flags/utils/readMigration'
import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { postReportingV2 } from 'domains/reporting/models/resources'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getNewStatsFeatureFlagMigration } from 'domains/reporting/utils/getNewStatsFeatureFlagMigration'
import { useGetNewStatsFeatureFlagMigration } from 'domains/reporting/utils/useGetNewStatsFeatureFlagMigration'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

import { AnalyticsAiAgentAutomationRateCard } from './AnalyticsAiAgentAutomationRateCard'

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

jest.mock('domains/reporting/hooks/automate/useAIAgentUserId')
const mockUseAIAgentUserId = jest.mocked(useAIAgentUserId)

describe('AnalyticsAiAgentAutomationRateCard', () => {
    const mockFilters: StatsFilters = {
        period: {
            start_datetime: '2024-06-25T00:00:00.000Z',
            end_datetime: '2024-07-01T23:59:59.999Z',
        },
    }

    beforeEach(() => {
        jest.resetAllMocks()

        mockUseAIAgentUserId.mockReturnValue(123)

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
                        aiAgentAutomationRate: '0.28',
                    },
                ],
            },
        } as any)
    })

    it('should render loading state initially', () => {
        renderWithQueryClientProvider(<AnalyticsAiAgentAutomationRateCard />)

        expect(screen.getAllByLabelText('Loading')).toHaveLength(2)
    })

    it('should render the card with formatted percentage', async () => {
        renderWithQueryClientProvider(<AnalyticsAiAgentAutomationRateCard />)

        await waitFor(() => {
            expect(screen.getByText('Automation rate')).toBeInTheDocument()
            expect(screen.getByText('28%')).toBeInTheDocument()
        })
    })

    it('should format tooltip period correctly', async () => {
        renderWithQueryClientProvider(<AnalyticsAiAgentAutomationRateCard />)

        await waitFor(() => {
            expect(screen.queryAllByLabelText('Loading')).toHaveLength(0)
        })

        expect(mockUseStatsFilters).toHaveBeenCalled()
    })

    it('should render hint tooltip icon', () => {
        renderWithQueryClientProvider(<AnalyticsAiAgentAutomationRateCard />)

        const infoIcon = screen.getByRole('img', {
            hidden: true,
            name: 'info',
        })
        expect(infoIcon).toBeInTheDocument()
    })

    it('should render without action menu when chartId is not provided', async () => {
        renderWithQueryClientProvider(<AnalyticsAiAgentAutomationRateCard />)

        await waitFor(() => {
            expect(screen.getByText('Automation rate')).toBeInTheDocument()
            expect(screen.getByText('28%')).toBeInTheDocument()
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

        renderWithQueryClientProvider(<AnalyticsAiAgentAutomationRateCard />)

        await waitFor(() => {
            expect(screen.getByText('Automation rate')).toBeInTheDocument()
        })
    })

    it('should render with chartId and dashboard props', async () => {
        renderWithQueryClientProvider(
            <AnalyticsAiAgentAutomationRateCard
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
            expect(screen.getByText('Automation rate')).toBeInTheDocument()
            expect(screen.getByText('28%')).toBeInTheDocument()
        })
    })
})
