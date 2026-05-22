import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import { useDashboardData } from 'domains/reporting/hooks/dashboards/useDashboardData'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { AnalyticsAiAgentAllAgentsReportConfig } from 'pages/aiAgent/analyticsAiAgent/AnalyticsAiAgentAllAgentsReportConfig'
import { useDownloadChannelPerformanceData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadChannelPerformanceData'
import { useDownloadIntentPerformanceData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadIntentPerformanceData'
import { useExportAiAgentAllAgentsToCSV } from 'pages/aiAgent/analyticsAiAgent/hooks/useExportAiAgentAllAgentsToCSV'
import { buildCustomDashboard } from 'pages/aiAgent/analyticsOverview/utils/buildCustomDashboard'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'
import { useMoneySavedPerInteractionWithAutomate } from 'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate'
import * as fileUtils from 'utils/file'

import { useGetManagedDashboardsLayoutConfig } from '@repo/reporting'

jest.mock('@repo/feature-flags')
jest.mock('pages/aiAgent/hooks/useAiAgentStatsFilters')
jest.mock('domains/reporting/hooks/dashboards/useDashboardData')
jest.mock('pages/aiAgent/analyticsOverview/utils/buildCustomDashboard')
jest.mock('@repo/reporting', () => ({
    ...jest.requireActual('@repo/reporting'),
    useGetManagedDashboardsLayoutConfig: jest.fn(),
}))
jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useDownloadChannelPerformanceData',
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
const mockedBuildKpiDashboard = jest.mocked(buildCustomDashboard)
const mockedUseDownloadChannelPerformanceData = jest.mocked(
    useDownloadChannelPerformanceData,
)
const mockedUseDownloadIntentPerformanceData = jest.mocked(
    useDownloadIntentPerformanceData,
)
const mockedUseMoneySavedPerInteractionWithAutomate = jest.mocked(
    useMoneySavedPerInteractionWithAutomate,
)
const mockedSaveZippedFiles = jest.mocked(fileUtils.saveZippedFiles)

describe('useExportAiAgentAllAgentsToCSV', () => {
    const mockPeriod = {
        start_datetime: '2024-01-01T00:00:00Z',
        end_datetime: '2024-01-31T23:59:59Z',
    }

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseFlagWithLoading.mockReturnValue({
            value: true,
            isLoading: false,
        })

        mockedBuildKpiDashboard.mockReturnValue({
            id: 0,
            name: 'ai-agent-all-agents',
            analytics_filter_id: 0,
            children: [],
            emoji: null,
        } as any)

        mockedUseGetManagedDashboardsLayoutConfig.mockReturnValue({
            layoutConfig: { sections: [] } as any,
            isLoading: false,
        })

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
                'ai-agent-all-agents - trends.csv': 'trends content',
                'all-agents-channel-performance.csv': 'channel content',
                'all-agents-intent-performance.csv': 'intent content',
            },
            fileName: 'ai-agent-all-agents - trends.csv',
            isLoading: false,
        })

        mockedUseDownloadChannelPerformanceData.mockReturnValue({
            files: {
                'channel-performance.csv': 'channel,automation_rate\nChat,85%',
            },
            fileName: 'channel-performance.csv',
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
    })

    it('should return isLoading as false when all data is loaded', () => {
        const { result } = renderHook(() => useExportAiAgentAllAgentsToCSV())

        expect(result.current.isLoading).toBe(false)
    })

    it('should return isLoading as true when trend cards flag is loading', () => {
        mockUseFlagWithLoading.mockImplementation((key) => {
            if (key === FeatureFlagKey.AiAgentAnalyticsDashboardsTrendCards)
                return { value: true, isLoading: true }
            return { value: true, isLoading: false }
        })

        const { result } = renderHook(() => useExportAiAgentAllAgentsToCSV())

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as true when tables flag is loading', () => {
        mockUseFlagWithLoading.mockImplementation((key) => {
            if (key === FeatureFlagKey.AiAgentAnalyticsDashboardsTables)
                return { value: true, isLoading: true }
            return { value: true, isLoading: false }
        })

        const { result } = renderHook(() => useExportAiAgentAllAgentsToCSV())

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as true when KPI data is loading', () => {
        mockedUseDashboardData.mockReturnValue({
            files: {},
            fileName: '',
            isLoading: true,
        })

        const { result } = renderHook(() => useExportAiAgentAllAgentsToCSV())

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as true when legacy channel data is loading and tables flag is disabled', () => {
        mockUseFlagWithLoading.mockImplementation((flag) => ({
            value: flag !== FeatureFlagKey.AiAgentAnalyticsDashboardsTables,
            isLoading: false,
        }))
        mockedUseDownloadChannelPerformanceData.mockReturnValue({
            files: {},
            fileName: '',
            isLoading: true,
        })

        const { result } = renderHook(() => useExportAiAgentAllAgentsToCSV())

        expect(result.current.isLoading).toBe(true)
    })

    it('should not reflect legacy channel isLoading when tables flag is enabled', () => {
        mockUseFlagWithLoading.mockReturnValue({
            value: true,
            isLoading: false,
        })
        mockedUseDownloadChannelPerformanceData.mockReturnValue({
            files: {},
            fileName: '',
            isLoading: true,
        })

        const { result } = renderHook(() => useExportAiAgentAllAgentsToCSV())

        expect(result.current.isLoading).toBe(false)
    })

    it('should return isLoading as true when legacy intent data is loading and tables flag is disabled', () => {
        mockUseFlagWithLoading.mockImplementation((flag) => ({
            value: flag !== FeatureFlagKey.AiAgentAnalyticsDashboardsTables,
            isLoading: false,
        }))
        mockedUseDownloadIntentPerformanceData.mockReturnValue({
            files: {},
            fileName: '',
            isLoading: true,
        })

        const { result } = renderHook(() => useExportAiAgentAllAgentsToCSV())

        expect(result.current.isLoading).toBe(true)
    })

    it('should not reflect legacy intent isLoading when tables flag is enabled', () => {
        mockUseFlagWithLoading.mockReturnValue({
            value: true,
            isLoading: false,
        })
        mockedUseDownloadIntentPerformanceData.mockReturnValue({
            files: {},
            fileName: '',
            isLoading: true,
        })

        const { result } = renderHook(() => useExportAiAgentAllAgentsToCSV())

        expect(result.current.isLoading).toBe(false)
    })

    it('should call saveZippedFiles when triggerDownload is called', async () => {
        const { result } = renderHook(() => useExportAiAgentAllAgentsToCSV())

        await act(async () => {
            await result.current.triggerDownload()
        })

        expect(mockedSaveZippedFiles).toHaveBeenCalled()
        expect(mockedSaveZippedFiles).toHaveBeenCalledWith(
            expect.any(Object),
            expect.stringContaining('ai-agent-all-agents'),
        )
    })

    it('should include all expected files in the ZIP when tables flag is enabled', async () => {
        const { result } = renderHook(() => useExportAiAgentAllAgentsToCSV())

        await act(async () => {
            await result.current.triggerDownload()
        })

        const [filesArg] = mockedSaveZippedFiles.mock.calls[0]
        const fileNames = Object.keys(filesArg)

        expect(fileNames.length).toBe(3)
        expect(fileNames.some((name) => name.includes('trends'))).toBe(true)
        expect(
            fileNames.some((name) =>
                name.includes('all-agents-channel-performance'),
            ),
        ).toBe(true)
        expect(
            fileNames.some((name) =>
                name.includes('all-agents-intent-performance'),
            ),
        ).toBe(true)
    })

    it('should call buildCustomDashboard with the layout and feature flag values', () => {
        mockUseFlagWithLoading.mockReturnValue({
            value: true,
            isLoading: false,
        })
        renderHook(() => useExportAiAgentAllAgentsToCSV())
        expect(mockedBuildKpiDashboard).toHaveBeenCalledWith(
            'ai-agent-all-agents',
            expect.any(Object),
            true,
            true,
        )
    })

    it('should call buildCustomDashboard with false when tables flag is disabled', () => {
        mockUseFlagWithLoading.mockImplementation((key) => {
            if (key === FeatureFlagKey.AiAgentAnalyticsDashboardsTables)
                return { value: false, isLoading: false }
            return { value: true, isLoading: false }
        })
        renderHook(() => useExportAiAgentAllAgentsToCSV())
        expect(mockedBuildKpiDashboard).toHaveBeenCalledWith(
            'ai-agent-all-agents',
            expect.any(Object),
            true,
            false,
        )
    })

    it('should call useDashboardData with the AllAgents report config charts and extraData', () => {
        renderHook(() => useExportAiAgentAllAgentsToCSV())

        expect(mockedUseDashboardData).toHaveBeenCalledWith(
            expect.any(Object),
            true,
            AnalyticsAiAgentAllAgentsReportConfig.charts,
            expect.objectContaining({
                costSavedPerInteraction: expect.any(Number),
            }),
        )
    })

    it('should pass costSavedPerInteraction from useMoneySavedPerInteractionWithAutomate to useDashboardData', () => {
        mockedUseMoneySavedPerInteractionWithAutomate.mockReturnValue(5.5)

        renderHook(() => useExportAiAgentAllAgentsToCSV())

        expect(mockedUseDashboardData).toHaveBeenCalledWith(
            expect.any(Object),
            true,
            expect.any(Object),
            expect.objectContaining({ costSavedPerInteraction: 5.5 }),
        )
    })

    describe('channel data based on AiAgentAnalyticsDashboardsTables flag', () => {
        it('uses channel data from useDashboardData when the tables flag is enabled', async () => {
            mockUseFlagWithLoading.mockReturnValue({
                value: true,
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useExportAiAgentAllAgentsToCSV(),
            )

            await act(async () => {
                await result.current.triggerDownload()
            })

            const [filesArg] = mockedSaveZippedFiles.mock.calls[0]
            expect(
                Object.keys(filesArg).some((name) =>
                    name.includes('all-agents-channel-performance'),
                ),
            ).toBe(true)
        })

        it('uses legacy channel performance data when the tables flag is disabled', async () => {
            mockUseFlagWithLoading.mockImplementation((flag) => ({
                value: flag !== FeatureFlagKey.AiAgentAnalyticsDashboardsTables,
                isLoading: false,
            }))
            mockedUseDashboardData.mockReturnValue({
                files: {
                    'ai-agent-all-agents - trends.csv': 'trends content',
                },
                fileName: 'ai-agent-all-agents - trends.csv',
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useExportAiAgentAllAgentsToCSV(),
            )

            await act(async () => {
                await result.current.triggerDownload()
            })

            const [filesArg] = mockedSaveZippedFiles.mock.calls[0]
            expect(
                Object.keys(filesArg).some(
                    (name) => name === 'channel-performance.csv',
                ),
            ).toBe(true)
            expect(
                Object.keys(filesArg).some((name) =>
                    name.includes('all-agents-channel-performance'),
                ),
            ).toBe(false)
        })
    })

    describe('intent data based on AiAgentAnalyticsDashboardsTables flag', () => {
        it('uses intent data from useDashboardData when the tables flag is enabled', async () => {
            mockUseFlagWithLoading.mockReturnValue({
                value: true,
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useExportAiAgentAllAgentsToCSV(),
            )

            await act(async () => {
                await result.current.triggerDownload()
            })

            const [filesArg] = mockedSaveZippedFiles.mock.calls[0]
            expect(
                Object.keys(filesArg).some((name) =>
                    name.includes('all-agents-intent-performance'),
                ),
            ).toBe(true)
        })

        it('uses legacy intent performance data when the tables flag is disabled', async () => {
            mockUseFlagWithLoading.mockImplementation((flag) => ({
                value: flag !== FeatureFlagKey.AiAgentAnalyticsDashboardsTables,
                isLoading: false,
            }))
            mockedUseDashboardData.mockReturnValue({
                files: {
                    'ai-agent-all-agents - trends.csv': 'trends content',
                },
                fileName: 'ai-agent-all-agents - trends.csv',
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useExportAiAgentAllAgentsToCSV(),
            )

            await act(async () => {
                await result.current.triggerDownload()
            })

            const [filesArg] = mockedSaveZippedFiles.mock.calls[0]
            expect(
                Object.keys(filesArg).some(
                    (name) => name === 'intent-performance.csv',
                ),
            ).toBe(true)
            expect(
                Object.keys(filesArg).some((name) =>
                    name.includes('all-agents-intent-performance'),
                ),
            ).toBe(false)
        })
    })

    it('should handle empty download data files', async () => {
        mockedUseDashboardData.mockReturnValue({
            files: {},
            fileName: '',
            isLoading: false,
        })
        mockedUseDownloadChannelPerformanceData.mockReturnValue({
            files: {},
            fileName: '',
            isLoading: false,
        })
        mockedUseDownloadIntentPerformanceData.mockReturnValue({
            files: {},
            fileName: '',
            isLoading: false,
        })

        const { result } = renderHook(() => useExportAiAgentAllAgentsToCSV())

        await act(async () => {
            await result.current.triggerDownload()
        })

        const [filesArg] = mockedSaveZippedFiles.mock.calls[0]

        expect(Object.keys(filesArg).length).toBe(0)
    })
})
