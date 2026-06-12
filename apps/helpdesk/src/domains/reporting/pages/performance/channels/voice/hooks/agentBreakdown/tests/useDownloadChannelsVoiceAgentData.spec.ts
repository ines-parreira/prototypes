import { reportError } from '@repo/logging'
import { assumeMock, renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'

import { SentryTeam } from 'common/const/sentryTeamNames'
import type { User } from 'config/types/user'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { fetchChannelsVoiceAgentMetrics } from 'domains/reporting/pages/performance/channels/voice/hooks/agentBreakdown/useChannelsVoiceAgentMetrics'
import { useDownloadChannelsVoiceAgentData } from 'domains/reporting/pages/performance/channels/voice/hooks/agentBreakdown/useDownloadChannelsVoiceAgentData'
import { getFilteredAgents } from 'domains/reporting/state/ui/stats/agentPerformanceSlice'

jest.mock(
    'domains/reporting/pages/performance/channels/voice/hooks/agentBreakdown/useChannelsVoiceAgentMetrics',
    () => ({
        fetchChannelsVoiceAgentMetrics: jest.fn(),
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

const mockFetch = assumeMock(fetchChannelsVoiceAgentMetrics)
const mockUseStatsFilters = assumeMock(useStatsFilters)
const mockGetFilteredAgents = assumeMock(getFilteredAgents)
const mockReportError = assumeMock(reportError)

const MOCK_FILE_NAME =
    '2024-01-01_2024-01-31-performance-channels-voice_by-agent.csv'
const MOCK_CSV = '"Agent","Total calls"\r\n"Alice","120"'
const MOCK_STATS_FILTERS = {
    period: {
        start_datetime: '2024-01-01T00:00:00Z',
        end_datetime: '2024-01-31T23:59:59Z',
    },
}
const MOCK_AGENTS: User[] = [{ id: 1, name: 'Alice' } as unknown as User]

describe('useDownloadChannelsVoiceAgentData', () => {
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
        const { result } = renderHook(() => useDownloadChannelsVoiceAgentData())

        expect(result.current.isLoading).toBe(true)
        expect(result.current.files).toEqual({})
        expect(result.current.fileName).toBe('')
    })

    it('returns CSV data and sets isLoading false after fetch completes', async () => {
        const { result } = renderHook(() => useDownloadChannelsVoiceAgentData())

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.fileName).toBe(MOCK_FILE_NAME)
        expect(result.current.files[MOCK_FILE_NAME]).toBe(MOCK_CSV)
    })

    it('calls fetchChannelsVoiceAgentMetrics with filters, timezone, and agents', async () => {
        renderHook(() => useDownloadChannelsVoiceAgentData())

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

        const { result } = renderHook(() => useDownloadChannelsVoiceAgentData())

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(mockReportError).toHaveBeenCalledWith(error, {
            tags: { team: SentryTeam.CPLT_ANALYTICS_FRONTEND },
        })
        expect(result.current.files).toEqual({})
        expect(result.current.fileName).toBe('')
    })
})
