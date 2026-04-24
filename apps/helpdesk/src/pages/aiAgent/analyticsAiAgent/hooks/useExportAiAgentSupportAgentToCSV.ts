import { useCallback, useMemo } from 'react'

import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'

import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useDashboardData } from 'domains/reporting/hooks/dashboards/useDashboardData'
import { useGetManagedDashboardsLayoutConfig } from 'domains/reporting/hooks/managed-dashboards/useGetManagedDashboardsLayoutConfig'
import { AnalyticsAiAgentSupportAgentReportConfig } from 'pages/aiAgent/analyticsAiAgent/AnalyticsAiAgentSupportAgentReportConfig'
import {
    ManagedDashboardId,
    ManagedDashboardsTabId,
} from 'pages/aiAgent/analyticsOverview/types/layoutConfig'
import { buildCustomDashboard } from 'pages/aiAgent/analyticsOverview/utils/buildCustomDashboard'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'
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

    const { statsFilters } = useAiAgentStatsFilters()
    const costSavedPerInteraction = useMoneySavedPerInteractionWithAutomate(
        AGENT_COST_PER_TICKET,
    )

    const extraData = useMemo(
        () => ({ costSavedPerInteraction }),
        [costSavedPerInteraction],
    )

    const { layoutConfig } = useGetManagedDashboardsLayoutConfig({
        dashboardId: ManagedDashboardId.AiAgentAnalytics,
        defaultLayoutConfig: ANALYTICS_AI_AGENT_SUPPORT_AGENT_LAYOUT,
        tabId: ManagedDashboardsTabId.SupportAgent,
    })

    const supportAgentDashboard = useMemo(
        () =>
            buildCustomDashboard(
                REPORT_NAME,
                layoutConfig,
                isTrendCardsFFEnabled,
                isGraphsFFEnabled,
                isTablesFFEnabled,
            ),
        [
            isTrendCardsFFEnabled,
            layoutConfig,
            isGraphsFFEnabled,
            isTablesFFEnabled,
        ],
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
    const legacyIntentTable = useDownloadIntentPerformanceData()

    const isLoading =
        isDashboardDataLoading ||
        isTrendCardsFFLoading ||
        isGraphsFFLoading ||
        isTablesFFLoading ||
        (!isGraphsFFEnabled &&
            (supportInteractionsByIntentData.isLoading ||
                supportInteractionsTimeSeriesData.isLoading)) ||
        (!isTablesFFEnabled &&
            (legacyChannelTable.isLoading || legacyIntentTable.isLoading))

    const files = useMemo(
        () => ({
            ...dashboardDataFiles,
            ...(!isGraphsFFEnabled && {
                ...supportInteractionsByIntentData.files,
                ...supportInteractionsTimeSeriesData.files,
            }),
            ...(!isTablesFFEnabled && {
                ...legacyChannelTable.files,
                ...legacyIntentTable.files,
            }),
        }),
        [
            dashboardDataFiles,
            supportInteractionsByIntentData.files,
            supportInteractionsTimeSeriesData.files,
            legacyChannelTable.files,
            legacyIntentTable.files,
            isGraphsFFEnabled,
            isTablesFFEnabled,
        ],
    )

    const triggerDownload = useCallback(async () => {
        const fileName = getCsvFileNameWithDates(
            statsFilters.period,
            REPORT_NAME,
        ).replace('.csv', '')
        await saveZippedFiles(files, fileName)
    }, [files, statsFilters.period])

    return {
        triggerDownload,
        isLoading,
    }
}
