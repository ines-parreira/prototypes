import { useCallback, useMemo } from 'react'

import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'

import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useDashboardData } from 'domains/reporting/hooks/dashboards/useDashboardData'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { AnalyticsAiAgentSupportAgentReportConfig } from 'pages/aiAgent/analyticsAiAgent/AnalyticsAiAgentSupportAgentReportConfig'
import { buildCustomDashboard } from 'pages/aiAgent/analyticsOverview/utils/buildCustomDashboard'
import { AGENT_COST_PER_TICKET } from 'pages/automate/automate-metrics/constants'
import { useMoneySavedPerInteractionWithAutomate } from 'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate'
import { saveZippedFiles } from 'utils/file'

import { ANALYTICS_AI_AGENT_SUPPORT_AGENT_LAYOUT } from '../config/aiAgentSupportAgentLayoutConfig'
import { useDownloadIntentPerformanceData } from './useDownloadIntentPerformanceData'
import { useDownloadSupportAgentChannelPerformanceData } from './useDownloadSupportAgentChannelPerformanceData'
import { useDownloadSupportInteractionsByIntentData } from './useDownloadSupportInteractionsByIntentData'
import { useDownloadSupportInteractionsTimeSeriesData } from './useDownloadSupportInteractionsTimeSeriesData'

const REPORT_NAME = 'ai-agent-support-agent'

export const useExportAiAgentSupportAgentToCSV = () => {
    const { value: isTrendCardsFFEnabled, isLoading: isTrendCardsFFLoading } =
        useFlagWithLoading(FeatureFlagKey.AiAgentAnalyticsDashboardsTrendCards)
    const { value: isGraphsFFEnabled, isLoading: isGraphsFFLoading } =
        useFlagWithLoading(
            FeatureFlagKey.AiAgentAnalyticsDashboardsChartsAndDropdowns,
        )
    const { value: isTablesFFEnabled, isLoading: isTablesFFLoading } =
        useFlagWithLoading(FeatureFlagKey.AiAgentAnalyticsDashboardsTables)

    const { cleanStatsFilters } = useStatsFilters()
    const costSavedPerInteraction = useMoneySavedPerInteractionWithAutomate(
        AGENT_COST_PER_TICKET,
    )

    const extraData = useMemo(
        () => ({ costSavedPerInteraction }),
        [costSavedPerInteraction],
    )

    const supportAgentDashboard = useMemo(
        () =>
            buildCustomDashboard(
                REPORT_NAME,
                ANALYTICS_AI_AGENT_SUPPORT_AGENT_LAYOUT,
                isTrendCardsFFEnabled,
                isGraphsFFEnabled,
                isTablesFFEnabled,
            ),
        [isTrendCardsFFEnabled, isGraphsFFEnabled, isTablesFFEnabled],
    )

    const { files: dashboardDataFiles, isLoading: isDashboardDataLoading } =
        useDashboardData(
            supportAgentDashboard,
            true,
            AnalyticsAiAgentSupportAgentReportConfig.charts,
            extraData,
        )

    const supportInteractionsByIntentData =
        useDownloadSupportInteractionsByIntentData()
    const supportInteractionsTimeSeriesData =
        useDownloadSupportInteractionsTimeSeriesData()
    const legacyChannelTable = useDownloadSupportAgentChannelPerformanceData()
    const intentPerformanceData = useDownloadIntentPerformanceData()

    const isLoading =
        isDashboardDataLoading ||
        isTrendCardsFFLoading ||
        isGraphsFFLoading ||
        isTablesFFLoading ||
        (!isGraphsFFEnabled &&
            (supportInteractionsByIntentData.isLoading ||
                supportInteractionsTimeSeriesData.isLoading)) ||
        (!isTablesFFEnabled && legacyChannelTable.isLoading) ||
        intentPerformanceData.isLoading

    const files = useMemo(
        () => ({
            ...dashboardDataFiles,
            ...(!isGraphsFFEnabled && {
                ...supportInteractionsByIntentData.files,
                ...supportInteractionsTimeSeriesData.files,
            }),
            ...(!isTablesFFEnabled && { ...legacyChannelTable.files }),
            ...intentPerformanceData.files,
        }),
        [
            dashboardDataFiles,
            supportInteractionsByIntentData.files,
            supportInteractionsTimeSeriesData.files,
            legacyChannelTable.files,
            intentPerformanceData.files,
            isGraphsFFEnabled,
            isTablesFFEnabled,
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
