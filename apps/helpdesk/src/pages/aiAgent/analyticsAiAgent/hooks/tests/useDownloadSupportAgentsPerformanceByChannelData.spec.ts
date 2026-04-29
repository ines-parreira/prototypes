import { assumeMock, renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'

import { useDownloadSupportAgentsPerformanceByChannelData } from '../useDownloadSupportAgentsPerformanceByChannelData'

jest.mock('@repo/logging', () => ({ reportError: jest.fn() }))

jest.mock('../useSupportAgentsPerformanceByChannelMetrics', () => ({
    fetchSupportAgentsPerformanceByChannelMetrics: jest.fn(),
}))

jest.mock('pages/aiAgent/hooks/useAiAgentStatsFilters')

jest.mock(
    'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate',
    () => ({ useMoneySavedPerInteractionWithAutomate: jest.fn(() => 3.1) }),
)

const mockFetch = jest.requireMock(
    '../useSupportAgentsPerformanceByChannelMetrics',
)
const mockReportError = jest.requireMock('@repo/logging').reportError
const mockUseAiAgentStatsFilters = assumeMock(useAiAgentStatsFilters)

const MOCK_FILE_NAME =
    'support-agents-channel-performance-2024-01-01_2024-01-31.csv'
const MOCK_CSV =
    'Channel,Automated interactions,Handover interactions\r\nEmail,1200,45'

describe('useDownloadSupportAgentsPerformanceByChannelData', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAiAgentStatsFilters.mockReturnValue({
            statsFilters: {
                period: {
                    start_datetime: '2024-01-01T00:00:00Z',
                    end_datetime: '2024-01-31T23:59:59Z',
                },
                stores: { operator: LogicalOperatorEnum.ONE_OF, values: [1] },
            },
            userTimezone: 'UTC',
            granularity: ReportingGranularity.Day,
        })
        mockFetch.fetchSupportAgentsPerformanceByChannelMetrics.mockResolvedValue(
            {
                fileName: MOCK_FILE_NAME,
                files: { [MOCK_FILE_NAME]: MOCK_CSV },
            },
        )
    })

    it('starts with isLoading true', () => {
        const { result } = renderHook(() =>
            useDownloadSupportAgentsPerformanceByChannelData(),
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('returns empty files and fileName while loading', () => {
        const { result } = renderHook(() =>
            useDownloadSupportAgentsPerformanceByChannelData(),
        )

        expect(result.current.files).toEqual({})
        expect(result.current.fileName).toBe('')
    })

    it('returns CSV data and sets isLoading false after fetch completes', async () => {
        const { result } = renderHook(() =>
            useDownloadSupportAgentsPerformanceByChannelData(),
        )

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.fileName).toBe(MOCK_FILE_NAME)
        expect(result.current.files[MOCK_FILE_NAME]).toBe(MOCK_CSV)
    })

    it('sets isLoading to false and reports to Sentry when fetch fails', async () => {
        const error = new Error('Network error')
        mockFetch.fetchSupportAgentsPerformanceByChannelMetrics.mockRejectedValue(
            error,
        )

        const { result } = renderHook(() =>
            useDownloadSupportAgentsPerformanceByChannelData(),
        )

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(mockReportError).toHaveBeenCalledWith(error, {
            tags: { team: SentryTeam.CPLT_ANALYTICS_FRONTEND },
        })
    })

    it('calls fetchSupportAgentsPerformanceByChannelMetrics with all statsFilters, timezone, and costSavedPerInteraction', async () => {
        renderHook(() => useDownloadSupportAgentsPerformanceByChannelData())

        await waitFor(() =>
            expect(
                mockFetch.fetchSupportAgentsPerformanceByChannelMetrics,
            ).toHaveBeenCalledWith(
                {
                    period: {
                        start_datetime: '2024-01-01T00:00:00Z',
                        end_datetime: '2024-01-31T23:59:59Z',
                    },
                    stores: {
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: [1],
                    },
                },
                'UTC',
                3.1,
            ),
        )
    })
})
