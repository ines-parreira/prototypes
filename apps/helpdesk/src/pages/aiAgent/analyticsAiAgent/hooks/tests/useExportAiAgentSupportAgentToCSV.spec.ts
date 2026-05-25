import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import { useGetManagedDashboardsLayoutConfig } from '@repo/reporting'
import { useDashboardData } from 'domains/reporting/hooks/dashboards/useDashboardData'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { AnalyticsAiAgentSupportAgentReportConfig } from 'pages/aiAgent/analyticsAiAgent/AnalyticsAiAgentSupportAgentReportConfig'
import { useExportAiAgentSupportAgentToCSV } from 'pages/aiAgent/analyticsAiAgent/hooks/useExportAiAgentSupportAgentToCSV'
import { buildCustomDashboard } from 'pages/aiAgent/analyticsOverview/utils/buildCustomDashboard'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'
import { useMoneySavedPerInteractionWithAutomate } from 'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate'
import * as fileUtils from 'utils/file'

jest.mock('@repo/feature-flags')
jest.mock('pages/aiAgent/hooks/useAiAgentStatsFilters')
jest.mock('domains/reporting/hooks/dashboards/useDashboardData')
jest.mock('@repo/reporting', () => ({
    ...jest.requireActual('@repo/reporting'),
    useGetManagedDashboardsLayoutConfig: jest.fn(),
}))
jest.mock('pages/aiAgent/analyticsOverview/utils/buildCustomDashboard')
jest.mock('pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate')
jest.mock('utils/file', () => ({
    ...jest.requireActual('utils/file'),
    saveZippedFiles: jest.fn(),
}))

const mockUseFlagWithLoading = jest.mocked(useFlagWithLoading)
const mockedUseAiAgentStatsFilters = jest.mocked(useAiAgentStatsFilters)
const mockedUseDashboardData = jest.mocked(useDashboardData)
const mockedUseGetManagedDashboardsLayoutConfig = jest.mocked(
    useGetManagedDashboardsLayoutConfig,
)
const mockedBuildCustomDashboard = jest.mocked(buildCustomDashboard)
const mockedUseMoneySavedPerInteractionWithAutomate = jest.mocked(
    useMoneySavedPerInteractionWithAutomate,
)
const mockedSaveZippedFiles = jest.mocked(fileUtils.saveZippedFiles)

const mockPeriod = {
    start_datetime: '2024-01-01T00:00:00Z',
    end_datetime: '2024-01-31T23:59:59Z',
}

describe('useExportAiAgentSupportAgentToCSV', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockUseFlagWithLoading.mockReturnValue({
            value: false,
            isLoading: false,
        })

        mockedUseGetManagedDashboardsLayoutConfig.mockReturnValue({
            layoutConfig: { sections: [] } as any,
            isLoading: false,
        })

        mockedBuildCustomDashboard.mockReturnValue({
            id: 0,
            name: 'ai-agent-support-agent',
            analytics_filter_id: 0,
            children: [],
            emoji: null,
        } as any)

        mockedUseAiAgentStatsFilters.mockReturnValue({
            statsFilters: {
                period: mockPeriod,
            },
            userTimezone: 'UTC',
            granularity: ReportingGranularity.Day,
        })

        mockedUseMoneySavedPerInteractionWithAutomate.mockReturnValue(3.1)

        mockedUseDashboardData.mockReturnValue({
            files: {
                'ai-agent-support-agent - trends.csv': 'trends content',
                'support-agents-channel-performance.csv':
                    'channel,interactions\nChat,900',
            },
            fileName: 'ai-agent-support-agent - trends.csv',
            isLoading: false,
        })

        mockedUseMoneySavedPerInteractionWithAutomate.mockReturnValue(1)
    })

    it('should return isLoading as false when all data is loaded', () => {
        const { result } = renderHook(() => useExportAiAgentSupportAgentToCSV())

        expect(result.current.isLoading).toBe(false)
    })

    it('should return isLoading as true when trend cards flag is loading', () => {
        mockUseFlagWithLoading.mockImplementation((key) => {
            if (key === FeatureFlagKey.AiAgentAnalyticsDashboardsTrendCards)
                return { value: false, isLoading: true }
            return { value: false, isLoading: false }
        })

        const { result } = renderHook(() => useExportAiAgentSupportAgentToCSV())

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as true when KPI data is loading', () => {
        mockedUseDashboardData.mockReturnValue({
            files: {},
            fileName: '',
            isLoading: true,
        })

        const { result } = renderHook(() => useExportAiAgentSupportAgentToCSV())

        expect(result.current.isLoading).toBe(true)
    })

    it('should call saveZippedFiles when triggerDownload is called', async () => {
        const { result } = renderHook(() => useExportAiAgentSupportAgentToCSV())

        await act(async () => {
            await result.current.triggerDownload()
        })

        expect(mockedSaveZippedFiles).toHaveBeenCalled()
        expect(mockedSaveZippedFiles).toHaveBeenCalledWith(
            expect.any(Object),
            expect.stringContaining('ai-agent-support-agent'),
        )
    })

    it('should call buildCustomDashboard with the layout and feature flag values', () => {
        mockUseFlagWithLoading.mockReturnValue({
            value: true,
            isLoading: false,
        })
        renderHook(() => useExportAiAgentSupportAgentToCSV())
        expect(mockedBuildCustomDashboard).toHaveBeenCalledWith(
            'ai-agent-support-agent',
            expect.any(Object),
            true,
        )
    })

    it('should call useDashboardData with the SupportAgent report config charts and extraData', () => {
        renderHook(() => useExportAiAgentSupportAgentToCSV())

        expect(mockedUseDashboardData).toHaveBeenCalledWith(
            expect.any(Object),
            true,
            AnalyticsAiAgentSupportAgentReportConfig.charts,
            expect.objectContaining({
                costSavedPerInteraction: expect.any(Number),
            }),
        )
    })
})
