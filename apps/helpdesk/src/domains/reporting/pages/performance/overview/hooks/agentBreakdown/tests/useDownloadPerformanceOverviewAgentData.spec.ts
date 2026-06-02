import { reportError } from '@repo/logging'
import { assumeMock, renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'

import { SentryTeam } from 'common/const/sentryTeamNames'
import type { User } from 'config/types/user'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { useDownloadPerformanceOverviewAgentData } from 'domains/reporting/pages/performance/overview/hooks/agentBreakdown/useDownloadPerformanceOverviewAgentData'
import { fetchPerformanceOverviewAgentMetrics } from 'domains/reporting/pages/performance/overview/hooks/agentBreakdown/usePerformanceOverviewAgentMetrics'
import { getFilteredAgents } from 'domains/reporting/state/ui/stats/agentPerformanceSlice'

jest.mock(
    'domains/reporting/pages/performance/overview/hooks/agentBreakdown/usePerformanceOverviewAgentMetrics',
    () => ({
        fetchPerformanceOverviewAgentMetrics: jest.fn(),
    }),
)

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')

jest.mock('@repo/logging', () => ({
    ...jest.requireActual('@repo/logging'),
    reportError: jest.fn(),
}))

jest.mock('domains/reporting/state/ui/stats/agentPerformanceSlice', () => ({
    ...jest.requireActual(
        'domains/reporting/state/ui/stats/agentPerformanceSlice',
    ),
    getFilteredAgents: jest.fn(() => []),
}))

const mockFetch = assumeMock(fetchPerformanceOverviewAgentMetrics)
const mockUseStatsFilters = assumeMock(useStatsFilters)
const mockGetFilteredAgents = assumeMock(getFilteredAgents)
const mockReportError = assumeMock(reportError)

const MOCK_FILE_NAME = '2024-01-01_2024-01-31-performance-overview_by-agent.csv'
const MOCK_CSV = '"Performance by agent","Average CSAT"\r\n"Alice","4.5"'
const MOCK_STATS_FILTERS = {
    period: {
        start_datetime: '2024-01-01T00:00:00Z',
        end_datetime: '2024-01-31T23:59:59Z',
    },
}
const MOCK_AGENTS: User[] = [{ id: 1, name: 'Alice' } as unknown as User]

describe('useDownloadPerformanceOverviewAgentData', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseStatsFilters.mockReturnValue({
            cleanStatsFilters: MOCK_STATS_FILTERS,
            userTimezone: 'UTC',
            granularity: ReportingGranularity.Day,
        })
        mockGetFilteredAgents.mockReturnValue(MOCK_AGENTS)
        mockFetch.mockResolvedValue({
            fileName: MOCK_FILE_NAME,
            files: { [MOCK_FILE_NAME]: MOCK_CSV },
        })
    })

    it('starts with isLoading true and empty result', () => {
        const { result } = renderHook(() =>
            useDownloadPerformanceOverviewAgentData(),
        )

        expect(result.current.isLoading).toBe(true)
        expect(result.current.files).toEqual({})
        expect(result.current.fileName).toBe('')
    })

    it('returns CSV data and sets isLoading false after fetch completes', async () => {
        const { result } = renderHook(() =>
            useDownloadPerformanceOverviewAgentData(),
        )

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.fileName).toBe(MOCK_FILE_NAME)
        expect(result.current.files[MOCK_FILE_NAME]).toBe(MOCK_CSV)
    })

    it('calls fetchPerformanceOverviewAgentMetrics with filters, timezone, and agents', async () => {
        renderHook(() => useDownloadPerformanceOverviewAgentData())

        await waitFor(() =>
            expect(mockFetch).toHaveBeenCalledWith(
                MOCK_STATS_FILTERS,
                'UTC',
                MOCK_AGENTS,
            ),
        )
    })

    it('reports the error and stops loading when the fetch rejects', async () => {
        const error = new Error('fetch failed')
        mockFetch.mockRejectedValue(error)

        const { result } = renderHook(() =>
            useDownloadPerformanceOverviewAgentData(),
        )

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(mockReportError).toHaveBeenCalledWith(error, {
            tags: { team: SentryTeam.CPLT_ANALYTICS_FRONTEND },
        })
        expect(result.current.files).toEqual({})
        expect(result.current.fileName).toBe('')
    })
})
