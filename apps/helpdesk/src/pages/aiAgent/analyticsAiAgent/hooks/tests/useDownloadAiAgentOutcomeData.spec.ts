import { assumeMock, renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'

import { useDownloadAiAgentOutcomeData } from '../useDownloadAiAgentOutcomeData'

jest.mock('@repo/logging', () => ({ reportError: jest.fn() }))

jest.mock('../useAiAgentOutcomeMetrics', () => ({
    fetchAiAgentOutcomeMetrics: jest.fn(),
}))

jest.mock('pages/aiAgent/hooks/useAiAgentStatsFilters')

const mockFetch = jest.requireMock('../useAiAgentOutcomeMetrics')
const mockReportError = jest.requireMock('@repo/logging').reportError
const mockUseAiAgentStatsFilters = assumeMock(useAiAgentStatsFilters)

const STATS_FILTERS = {
    period: {
        start_datetime: '2024-01-01T00:00:00Z',
        end_datetime: '2024-01-31T23:59:59Z',
    },
}
const MOCK_FILE_NAME = 'ai_agent_outcome_table.csv'
const MOCK_CSV = 'AI Agent outcome,All AI Agents\r\nClosed with a message,140'

describe('useDownloadAiAgentOutcomeData', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAiAgentStatsFilters.mockReturnValue({
            statsFilters: STATS_FILTERS,
            userTimezone: 'UTC',
            granularity: ReportingGranularity.Day,
        })
        mockFetch.fetchAiAgentOutcomeMetrics.mockResolvedValue({
            fileName: MOCK_FILE_NAME,
            files: { [MOCK_FILE_NAME]: MOCK_CSV },
        })
    })

    it('starts with isLoading true and empty files/fileName', () => {
        const { result } = renderHook(() => useDownloadAiAgentOutcomeData())

        expect(result.current.isLoading).toBe(true)
        expect(result.current.files).toEqual({})
        expect(result.current.fileName).toBe('')
    })

    it('returns CSV data and sets isLoading false after fetch completes', async () => {
        const { result } = renderHook(() => useDownloadAiAgentOutcomeData())

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.fileName).toBe(MOCK_FILE_NAME)
        expect(result.current.files[MOCK_FILE_NAME]).toBe(MOCK_CSV)
    })

    it('calls fetchAiAgentOutcomeMetrics with stats filters and timezone', async () => {
        renderHook(() => useDownloadAiAgentOutcomeData())

        await waitFor(() =>
            expect(mockFetch.fetchAiAgentOutcomeMetrics).toHaveBeenCalledWith(
                STATS_FILTERS,
                'UTC',
            ),
        )
    })

    it('sets isLoading false and reports to Sentry when fetch fails', async () => {
        const error = new Error('Network error')
        mockFetch.fetchAiAgentOutcomeMetrics.mockRejectedValue(error)

        const { result } = renderHook(() => useDownloadAiAgentOutcomeData())

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(mockReportError).toHaveBeenCalledWith(error, {
            tags: { team: SentryTeam.CPLT_ANALYTICS_FRONTEND },
        })
    })
})
