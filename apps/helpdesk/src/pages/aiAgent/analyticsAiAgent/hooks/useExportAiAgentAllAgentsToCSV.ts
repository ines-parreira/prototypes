import { useCallback, useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useDashboardData } from 'domains/reporting/hooks/dashboards/useDashboardData'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { AnalyticsAiAgentAllAgentsReportConfig } from 'pages/aiAgent/analyticsAiAgent/AnalyticsAiAgentAllAgentsReportConfig'
import { ANALYTICS_AI_AGENT_ALL_AGENTS_LAYOUT } from 'pages/aiAgent/analyticsAiAgent/config/aiAgentAllAgentsLayoutConfig'
import { useDownloadAiAgentAutomationRateTimeSeriesData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadAiAgentAutomationRateTimeSeriesData'
import { useDownloadAllAgentsPerformanceByChannelData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadAllAgentsPerformanceByChannelData'
import { useDownloadAutomatedInteractionsBySkillData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadAutomatedInteractionsBySkillData'
import { useDownloadChannelPerformanceData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadChannelPerformanceData'
import { useDownloadIntentPerformanceData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadIntentPerformanceData'
import { buildCustomDashboard } from 'pages/aiAgent/analyticsOverview/utils/buildCustomDashboard'
import { saveZippedFiles } from 'utils/file'

const REPORT_NAME = 'ai-agent-all-agents'

export const useExportAiAgentAllAgentsToCSV = () => {
    const isAnalyticsDashboardsTrendCardsEnabled = useFlag(
        FeatureFlagKey.AiAgentAnalyticsDashboardsTrendCards,
    )
    const isAnalyticsDashboardsTablesEnabled = useFlag(
        FeatureFlagKey.AiAgentAnalyticsDashboardsTables,
    )
    const { cleanStatsFilters } = useStatsFilters()

    const allAgentsDashboard = useMemo(
        () =>
            buildCustomDashboard(
                REPORT_NAME,
                ANALYTICS_AI_AGENT_ALL_AGENTS_LAYOUT,
                isAnalyticsDashboardsTrendCardsEnabled,
            ),
        [isAnalyticsDashboardsTrendCardsEnabled],
    )

    const { files: trendCardsFiles, isLoading: isKpiLoading } =
        useDashboardData(
            allAgentsDashboard,
            true,
            AnalyticsAiAgentAllAgentsReportConfig.charts,
        )

    const automatedInteractionsBySkillData =
        useDownloadAutomatedInteractionsBySkillData()
    const automationRateTimeSeriesData =
        useDownloadAiAgentAutomationRateTimeSeriesData()
    const allAgentsChannelPerformanceData =
        useDownloadAllAgentsPerformanceByChannelData()
    const legacyChannelPerformanceData = useDownloadChannelPerformanceData()
    const channelPerformanceData = isAnalyticsDashboardsTablesEnabled
        ? allAgentsChannelPerformanceData
        : legacyChannelPerformanceData
    const intentPerformanceData = useDownloadIntentPerformanceData()

    const isLoading =
        isKpiLoading ||
        automatedInteractionsBySkillData.isLoading ||
        automationRateTimeSeriesData.isLoading ||
        channelPerformanceData.isLoading ||
        intentPerformanceData.isLoading

    const files = useMemo(
        () => ({
            ...trendCardsFiles,
            ...automatedInteractionsBySkillData.files,
            ...automationRateTimeSeriesData.files,
            ...channelPerformanceData.files,
            ...intentPerformanceData.files,
        }),
        [
            trendCardsFiles,
            automatedInteractionsBySkillData.files,
            automationRateTimeSeriesData.files,
            channelPerformanceData.files,
            intentPerformanceData.files,
        ],
    )

    const triggerDownload = useCallback(async () => {
        const fileName = getCsvFileNameWithDates(
            cleanStatsFilters.period,
            REPORT_NAME,
        ).replace('.csv', '')
        await saveZippedFiles(files, fileName)
    }, [files, cleanStatsFilters.period])

    return {
        triggerDownload,
        isLoading,
    }
}
