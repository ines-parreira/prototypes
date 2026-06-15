import { reportError } from '@repo/logging'
import { assumeMock, renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { useDownloadStoreIntegrationData } from 'pages/aiAgent/analyticsOverview/hooks/useDownloadStoreIntegrationData'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'
import { useMoneySavedPerInteractionWithAutomate } from 'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate'
import { useStoreIntegrations } from 'pages/automate/common/hooks/useStoreIntegrations'
import { fetchStoreIntegrationMetrics } from '../useStoreIntegrationMetrics'

jest.mock('@repo/logging')
jest.mock('../useStoreIntegrationMetrics')
jest.mock('pages/aiAgent/hooks/useAiAgentStatsFilters')
jest.mock('pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate')
jest.mock('pages/automate/common/hooks/useStoreIntegrations')

const mockReportError = assumeMock(reportError)
const mockFetchStoreIntegrationMetrics = assumeMock(
    fetchStoreIntegrationMetrics,
)
const mockUseAiAgentStatsFilters = assumeMock(useAiAgentStatsFilters)
const mockUseMoneySavedPerInteractionWithAutomate = assumeMock(
    useMoneySavedPerInteractionWithAutomate,
)
const mockUseStoreIntegrations = assumeMock(useStoreIntegrations)

const stableStoreIntegrations = [
    { id: 1, name: 'My Shopify Store' },
    { id: 2, name: 'My BigCommerce Store' },
] as any

const MOCK_FILE_NAME = 'store-table-2024-01-01_2024-01-31.csv'
const MOCK_CSV =
    'Store,Overall automation rate,Automated interactions\r\nMy Shopify Store,75%,1200'

describe('useDownloadStoreIntegrationData', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAiAgentStatsFilters.mockReturnValue({
            statsFilters: {
                period: {
                    start_datetime: '2024-01-01T00:00:00Z',
                    end_datetime: '2024-01-31T23:59:59Z',
                },
            },
            userTimezone: 'UTC',
            granularity: ReportingGranularity.Month,
        })
        mockUseMoneySavedPerInteractionWithAutomate.mockReturnValue(3.1)
        mockUseStoreIntegrations.mockReturnValue(stableStoreIntegrations)
        mockFetchStoreIntegrationMetrics.mockResolvedValue({
            fileName: MOCK_FILE_NAME,
            files: { [MOCK_FILE_NAME]: MOCK_CSV },
        })
    })

    it('starts with isLoading true', () => {
        const { result } = renderHook(() => useDownloadStoreIntegrationData())

        expect(result.current.isLoading).toBe(true)
    })

    it('returns empty files and fileName while loading', () => {
        const { result } = renderHook(() => useDownloadStoreIntegrationData())

        expect(result.current.files).toEqual({})
        expect(result.current.fileName).toBe('')
    })

    it('returns CSV data and sets isLoading false after fetch completes', async () => {
        const { result } = renderHook(() => useDownloadStoreIntegrationData())

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.fileName).toBe(MOCK_FILE_NAME)
        expect(result.current.files[MOCK_FILE_NAME]).toBe(MOCK_CSV)
    })

    it('sets isLoading to false and reports to Sentry when fetch fails', async () => {
        const error = new Error('Network error')
        mockFetchStoreIntegrationMetrics.mockRejectedValue(error)

        const { result } = renderHook(() => useDownloadStoreIntegrationData())

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(mockReportError).toHaveBeenCalledWith(error, {
            tags: { team: SentryTeam.CPLT_ANALYTICS_FRONTEND },
        })
    })

    it('calls fetchStoreIntegrationMetrics with statsFilters, timezone, costSavedPerInteraction, and displayNames from store integrations', async () => {
        renderHook(() => useDownloadStoreIntegrationData())

        await waitFor(() =>
            expect(mockFetchStoreIntegrationMetrics).toHaveBeenCalledWith(
                {
                    period: {
                        start_datetime: '2024-01-01T00:00:00Z',
                        end_datetime: '2024-01-31T23:59:59Z',
                    },
                },
                'UTC',
                3.1,
                { '1': 'My Shopify Store', '2': 'My BigCommerce Store' },
            ),
        )
    })
})
