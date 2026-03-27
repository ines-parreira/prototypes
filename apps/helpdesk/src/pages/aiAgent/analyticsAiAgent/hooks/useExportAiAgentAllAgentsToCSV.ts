import { useCallback, useMemo } from 'react'

import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'

import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useDashboardData } from 'domains/reporting/hooks/dashboards/useDashboardData'
import { useGetManagedDashboardsLayoutConfig } from 'domains/reporting/hooks/managed-dashboards/useGetManagedDashboardsLayoutConfig'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { AnalyticsAiAgentAllAgentsReportConfig } from 'pages/aiAgent/analyticsAiAgent/AnalyticsAiAgentAllAgentsReportConfig'
import { ANALYTICS_AI_AGENT_ALL_AGENTS_LAYOUT } from 'pages/aiAgent/analyticsAiAgent/config/aiAgentAllAgentsLayoutConfig'
import { useDownloadAiAgentAutomationRateTimeSeriesData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadAiAgentAutomationRateTimeSeriesData'
import { useDownloadAllAgentsPerformanceByChannelData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadAllAgentsPerformanceByChannelData'
import { useDownloadAllAgentsPerformanceByIntentData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadAllAgentsPerformanceByIntentData'
import { useDownloadAutomatedInteractionsBySkillData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadAutomatedInteractionsBySkillData'
import { useDownloadChannelPerformanceData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadChannelPerformanceData'
import { useDownloadIntentPerformanceData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadIntentPerformanceData'
import {
    ManagedDashboardId,
    ManagedDashboardsTabId,
} from 'pages/aiAgent/analyticsOverview/types/layoutConfig'
import { buildCustomDashboard } from 'pages/aiAgent/analyticsOverview/utils/buildCustomDashboard'
import { saveZippedFiles } from 'utils/file'

const REPORT_NAME = 'ai-agent-all-agents'

export const useExportAiAgentAllAgentsToCSV = () => {
    const {
        value: isAnalyticsDashboardsTrendCardsEnabled,
        isLoading: isTrendCardsFlagLoading,
    } = useFlagWithLoading(FeatureFlagKey.AiAgentAnalyticsDashboardsTrendCards)
    const { value: isNewChartsEnabled, isLoading: isChartsFlagLoading } =
        useFlagWithLoading(
            FeatureFlagKey.AiAgentAnalyticsDashboardsChartsAndDropdowns,
        )
    const {
        value: isAnalyticsDashboardsTablesEnabled,
        isLoading: isTablesFlagLoading,
    } = useFlagWithLoading(FeatureFlagKey.AiAgentAnalyticsDashboardsTables)
    const { cleanStatsFilters } = useStatsFilters()

    const { layoutConfig } = useGetManagedDashboardsLayoutConfig({
        dashboardId: ManagedDashboardId.AiAgentAnalytics,
        defaultLayoutConfig: ANALYTICS_AI_AGENT_ALL_AGENTS_LAYOUT,
        tabId: ManagedDashboardsTabId.AllAgents,
    })

    const allAgentsDashboard = useMemo(
        () =>
            buildCustomDashboard(
                REPORT_NAME,
                layoutConfig,
                isAnalyticsDashboardsTrendCardsEnabled,
                isNewChartsEnabled,
            ),
        [
            isAnalyticsDashboardsTrendCardsEnabled,
            layoutConfig,
            isNewChartsEnabled,
        ],
    )

    const { files: dashboardDataFiles, isLoading: isKpiLoading } =
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
    const allAgentsIntentPerformanceData =
        useDownloadAllAgentsPerformanceByIntentData()
    const legacyIntentPerformanceData = useDownloadIntentPerformanceData()
    const intentPerformanceData = isAnalyticsDashboardsTablesEnabled
        ? allAgentsIntentPerformanceData
        : legacyIntentPerformanceData

    const isLoading =
        isKpiLoading ||
        isTrendCardsFlagLoading ||
        isTablesFlagLoading ||
        isChartsFlagLoading ||
        (!isNewChartsEnabled &&
            (automatedInteractionsBySkillData.isLoading ||
                automationRateTimeSeriesData.isLoading)) ||
        channelPerformanceData.isLoading ||
        intentPerformanceData.isLoading

    const files = useMemo(
        () =>
            isNewChartsEnabled
                ? {
                      ...dashboardDataFiles,
                      ...channelPerformanceData.files,
                      ...intentPerformanceData.files,
                  }
                : {
                      ...dashboardDataFiles,
                      ...automatedInteractionsBySkillData.files,
                      ...automationRateTimeSeriesData.files,
                      ...channelPerformanceData.files,
                      ...intentPerformanceData.files,
                  },
        [
            dashboardDataFiles,
            automatedInteractionsBySkillData.files,
            automationRateTimeSeriesData.files,
            channelPerformanceData.files,
            intentPerformanceData.files,
            isNewChartsEnabled,
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
