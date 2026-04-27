import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import { useDashboardData } from 'domains/reporting/hooks/dashboards/useDashboardData'
import { useGetManagedDashboardsLayoutConfig } from 'domains/reporting/hooks/managed-dashboards/useGetManagedDashboardsLayoutConfig'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { AnalyticsAiAgentSupportAgentReportConfig } from 'pages/aiAgent/analyticsAiAgent/AnalyticsAiAgentSupportAgentReportConfig'
import { useDownloadIntentPerformanceData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadIntentPerformanceData'
import { useDownloadSupportAgentChannelPerformanceData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadSupportAgentChannelPerformanceData'
import { useDownloadSupportInteractionsByIntentData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadSupportInteractionsByIntentData'
import { useDownloadSupportInteractionsTimeSeriesData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadSupportInteractionsTimeSeriesData'
import { useExportAiAgentSupportAgentToCSV } from 'pages/aiAgent/analyticsAiAgent/hooks/useExportAiAgentSupportAgentToCSV'
import { buildCustomDashboard } from 'pages/aiAgent/analyticsOverview/utils/buildCustomDashboard'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'
import { useMoneySavedPerInteractionWithAutomate } from 'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate'
import * as fileUtils from 'utils/file'

jest.mock('@repo/feature-flags')
jest.mock('pages/aiAgent/hooks/useAiAgentStatsFilters')
jest.mock('domains/reporting/hooks/dashboards/useDashboardData')
jest.mock(
    'domains/reporting/hooks/managed-dashboards/useGetManagedDashboardsLayoutConfig',
)
jest.mock('pages/aiAgent/analyticsOverview/utils/buildCustomDashboard')
jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useDownloadSupportInteractionsByIntentData',
)
jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useDownloadSupportInteractionsTimeSeriesData',
)
jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useDownloadSupportAgentChannelPerformanceData',
)
jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useDownloadIntentPerformanceData',
)
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
const mockedUseDownloadSupportInteractionsByIntentData = jest.mocked(
    useDownloadSupportInteractionsByIntentData,
)
const mockedUseDownloadSupportInteractionsTimeSeriesData = jest.mocked(
    useDownloadSupportInteractionsTimeSeriesData,
)
const mockedUseDownloadSupportAgentChannelPerformanceData = jest.mocked(
    useDownloadSupportAgentChannelPerformanceData,
)
const mockedUseDownloadIntentPerformanceData = jest.mocked(
    useDownloadIntentPerformanceData,
)
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

        // When tables flag is enabled, channel data flows through useDashboardData
        mockedUseDashboardData.mockReturnValue({
            files: {
                'ai-agent-support-agent - trends.csv': 'trends content',
                'support-agents-channel-performance.csv':
                    'channel,interactions\nChat,900',
            },
            fileName: 'ai-agent-support-agent - trends.csv',
            isLoading: false,
        })

        mockedUseDownloadSupportInteractionsByIntentData.mockReturnValue({
            files: {
                'support-interactions-by-intent.csv':
                    'intent,interactions\nIntent A,100',
            },
            isLoading: false,
        })

        mockedUseDownloadSupportInteractionsTimeSeriesData.mockReturnValue({
            files: {
                'support-interactions-timeseries.csv':
                    'date,interactions\n2024-01-01,500',
            },
            isLoading: false,
        })

        mockedUseDownloadSupportAgentChannelPerformanceData.mockReturnValue({
            files: {
                'support-agent-channel-performance.csv':
                    'channel,automation_rate\nChat,85%',
            },
            fileName: 'support-agent-channel-performance.csv',
            isLoading: false,
        })

        mockedUseDownloadIntentPerformanceData.mockReturnValue({
            files: {
                'intent-performance.csv':
                    'intent,automation_rate\nIntent A,90%',
            },
            fileName: 'intent-performance.csv',
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

    it('should return isLoading as true when charts flag is loading', () => {
        mockUseFlagWithLoading.mockImplementation((key) => {
            if (
                key ===
                FeatureFlagKey.AiAgentAnalyticsDashboardsChartsAndDropdowns
            )
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

    it('should return isLoading as true when support interactions by intent data is loading and graphs flag is disabled', () => {
        mockUseFlagWithLoading.mockImplementation((flag) => ({
            value:
                flag !==
                FeatureFlagKey.AiAgentAnalyticsDashboardsChartsAndDropdowns,
            isLoading: false,
        }))
        mockedUseDownloadSupportInteractionsByIntentData.mockReturnValue({
            files: {},
            isLoading: true,
        })

        const { result } = renderHook(() => useExportAiAgentSupportAgentToCSV())

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as true when support interactions time series data is loading and graphs flag is disabled', () => {
        mockUseFlagWithLoading.mockImplementation((flag) => ({
            value:
                flag !==
                FeatureFlagKey.AiAgentAnalyticsDashboardsChartsAndDropdowns,
            isLoading: false,
        }))
        mockedUseDownloadSupportInteractionsTimeSeriesData.mockReturnValue({
            files: {},
            isLoading: true,
        })

        const { result } = renderHook(() => useExportAiAgentSupportAgentToCSV())

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as true when legacy channel data is loading and tables flag is disabled', () => {
        mockUseFlagWithLoading.mockImplementation((flag) => ({
            value: flag !== FeatureFlagKey.AiAgentAnalyticsDashboardsTables,
            isLoading: false,
        }))
        mockedUseDownloadSupportAgentChannelPerformanceData.mockReturnValue({
            files: {},
            fileName: '',
            isLoading: true,
        })

        const { result } = renderHook(() => useExportAiAgentSupportAgentToCSV())

        expect(result.current.isLoading).toBe(true)
    })

    it('should not reflect legacy channel isLoading when tables flag is enabled', () => {
        mockUseFlagWithLoading.mockReturnValue({
            value: true,
            isLoading: false,
        })
        mockedUseDownloadSupportAgentChannelPerformanceData.mockReturnValue({
            files: {},
            fileName: '',
            isLoading: true,
        })

        const { result } = renderHook(() => useExportAiAgentSupportAgentToCSV())

        expect(result.current.isLoading).toBe(false)
    })

    it('should return isLoading as true when legacy intent table is loading and tables flag is disabled', () => {
        mockUseFlagWithLoading.mockImplementation((flag) => ({
            value: flag !== FeatureFlagKey.AiAgentAnalyticsDashboardsTables,
            isLoading: false,
        }))
        mockedUseDownloadIntentPerformanceData.mockReturnValue({
            files: {},
            fileName: '',
            isLoading: true,
        })

        const { result } = renderHook(() => useExportAiAgentSupportAgentToCSV())

        expect(result.current.isLoading).toBe(true)
    })

    it('should not reflect legacy intent table isLoading when tables flag is enabled', () => {
        mockUseFlagWithLoading.mockReturnValue({
            value: true,
            isLoading: false,
        })
        mockedUseDownloadIntentPerformanceData.mockReturnValue({
            files: {},
            fileName: '',
            isLoading: true,
        })

        const { result } = renderHook(() => useExportAiAgentSupportAgentToCSV())

        expect(result.current.isLoading).toBe(false)
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

    it('should include all expected files in the ZIP when tables flag is enabled and graphs flag is disabled', async () => {
        mockUseFlagWithLoading.mockImplementation((flag) => ({
            value:
                flag !==
                FeatureFlagKey.AiAgentAnalyticsDashboardsChartsAndDropdowns,
            isLoading: false,
        }))

        const { result } = renderHook(() => useExportAiAgentSupportAgentToCSV())

        await act(async () => {
            await result.current.triggerDownload()
        })

        const [filesArg] = mockedSaveZippedFiles.mock.calls[0]
        const fileNames = Object.keys(filesArg)

        expect(fileNames.length).toBe(4)
        expect(fileNames.some((name) => name.includes('trends'))).toBe(true)
        expect(
            fileNames.some((name) =>
                name.includes('support-interactions-by-intent'),
            ),
        ).toBe(true)
        expect(
            fileNames.some((name) =>
                name.includes('support-interactions-timeseries'),
            ),
        ).toBe(true)
        expect(
            fileNames.some((name) =>
                name.includes('support-agents-channel-performance'),
            ),
        ).toBe(true)
        expect(
            fileNames.some((name) => name.includes('intent-performance')),
        ).toBe(false)
    })

    it('should call buildCustomDashboard with the layout and all feature flag values', () => {
        mockUseFlagWithLoading.mockReturnValue({
            value: true,
            isLoading: false,
        })
        renderHook(() => useExportAiAgentSupportAgentToCSV())
        expect(mockedBuildCustomDashboard).toHaveBeenCalledWith(
            'ai-agent-support-agent',
            expect.any(Object),
            true,
            true,
            true,
        )
    })

    it('should call buildCustomDashboard with false for graphs flag when it is disabled', () => {
        mockUseFlagWithLoading.mockImplementation((flag) => ({
            value:
                flag !==
                FeatureFlagKey.AiAgentAnalyticsDashboardsChartsAndDropdowns,
            isLoading: false,
        }))
        renderHook(() => useExportAiAgentSupportAgentToCSV())
        expect(mockedBuildCustomDashboard).toHaveBeenCalledWith(
            'ai-agent-support-agent',
            expect.any(Object),
            true,
            false,
            true,
        )
    })

    it('should call buildCustomDashboard with false for tables flag when it is disabled', () => {
        mockUseFlagWithLoading.mockImplementation((flag) => ({
            value: flag !== FeatureFlagKey.AiAgentAnalyticsDashboardsTables,
            isLoading: false,
        }))
        renderHook(() => useExportAiAgentSupportAgentToCSV())
        expect(mockedBuildCustomDashboard).toHaveBeenCalledWith(
            'ai-agent-support-agent',
            expect.any(Object),
            true,
            true,
            false,
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

    describe('channel data based on AiAgentAnalyticsDashboardsTables flag', () => {
        it('uses channel data from useDashboardData when the tables flag is enabled', async () => {
            mockUseFlagWithLoading.mockReturnValue({
                value: true,
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useExportAiAgentSupportAgentToCSV(),
            )

            await act(async () => {
                await result.current.triggerDownload()
            })

            const [filesArg] = mockedSaveZippedFiles.mock.calls[0]
            expect(
                Object.keys(filesArg).some((name) =>
                    name.includes('support-agents-channel-performance'),
                ),
            ).toBe(true)
            expect(
                Object.keys(filesArg).some(
                    (name) => name === 'support-agent-channel-performance.csv',
                ),
            ).toBe(false)
        })

        it('uses legacy channel performance data when the tables flag is disabled', async () => {
            mockUseFlagWithLoading.mockImplementation((flag) => ({
                value: flag !== FeatureFlagKey.AiAgentAnalyticsDashboardsTables,
                isLoading: false,
            }))

            mockedUseDashboardData.mockReturnValue({
                files: {
                    'ai-agent-support-agent - trends.csv': 'trends content',
                },
                fileName: 'ai-agent-support-agent - trends.csv',
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useExportAiAgentSupportAgentToCSV(),
            )

            await act(async () => {
                await result.current.triggerDownload()
            })

            const [filesArg] = mockedSaveZippedFiles.mock.calls[0]
            expect(
                Object.keys(filesArg).some(
                    (name) => name === 'support-agent-channel-performance.csv',
                ),
            ).toBe(true)
            expect(
                Object.keys(filesArg).some((name) =>
                    name.includes('support-agents-channel-performance'),
                ),
            ).toBe(false)
        })

        it('reflects isLoading from legacy channel data when the tables flag is disabled', () => {
            mockedUseDownloadSupportAgentChannelPerformanceData.mockReturnValue(
                {
                    files: {},
                    fileName: '',
                    isLoading: true,
                },
            )

            const { result } = renderHook(() =>
                useExportAiAgentSupportAgentToCSV(),
            )

            expect(result.current.isLoading).toBe(true)
        })

        it('uses legacy intent table data when the tables flag is disabled', async () => {
            mockUseFlagWithLoading.mockImplementation((flag) => ({
                value: flag !== FeatureFlagKey.AiAgentAnalyticsDashboardsTables,
                isLoading: false,
            }))

            mockedUseDashboardData.mockReturnValue({
                files: {
                    'ai-agent-support-agent - trends.csv': 'trends content',
                },
                fileName: 'ai-agent-support-agent - trends.csv',
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useExportAiAgentSupportAgentToCSV(),
            )

            await act(async () => {
                await result.current.triggerDownload()
            })

            const [filesArg] = mockedSaveZippedFiles.mock.calls[0]
            expect(
                Object.keys(filesArg).some((name) =>
                    name.includes('intent-performance'),
                ),
            ).toBe(true)
        })

        it('excludes legacy intent table data when the tables flag is enabled', async () => {
            mockUseFlagWithLoading.mockReturnValue({
                value: true,
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useExportAiAgentSupportAgentToCSV(),
            )

            await act(async () => {
                await result.current.triggerDownload()
            })

            const [filesArg] = mockedSaveZippedFiles.mock.calls[0]
            expect(
                Object.keys(filesArg).some((name) =>
                    name.includes('intent-performance'),
                ),
            ).toBe(false)
        })
    })
})
