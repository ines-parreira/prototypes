import { useCallback, useMemo } from 'react'

import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'

import { useGetManagedDashboardsLayoutConfig } from '@repo/reporting'
import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useDashboardData } from 'domains/reporting/hooks/dashboards/useDashboardData'
import { AnalyticsAiAgentAllAgentsReportConfig } from 'pages/aiAgent/analyticsAiAgent/AnalyticsAiAgentAllAgentsReportConfig'
import { ANALYTICS_AI_AGENT_ALL_AGENTS_LAYOUT } from 'pages/aiAgent/analyticsAiAgent/config/aiAgentAllAgentsLayoutConfig'
import { useDownloadChannelPerformanceData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadChannelPerformanceData'
import { useDownloadIntentPerformanceData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadIntentPerformanceData'
import {
    ManagedDashboardId,
    ManagedDashboardsTabId,
} from 'pages/aiAgent/analyticsOverview/types/layoutConfig'
import { buildCustomDashboard } from 'pages/aiAgent/analyticsOverview/utils/buildCustomDashboard'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'
import { AGENT_COST_PER_TICKET } from 'pages/automate/automate-metrics/constants'
import { useMoneySavedPerInteractionWithAutomate } from 'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate'
import { saveZippedFiles } from 'utils/file'

const REPORT_NAME = 'ai-agent-all-agents'

export const useExportAiAgentAllAgentsToCSV = () => {
    const { value: isTrendCardsFFEnabled, isLoading: isTrendCardsFFLoading } =
        useFlagWithLoading(FeatureFlagKey.AiAgentAnalyticsDashboardsTrendCards)
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
        defaultLayoutConfig: ANALYTICS_AI_AGENT_ALL_AGENTS_LAYOUT,
        tabId: ManagedDashboardsTabId.AllAgents,
    })

    const allAgentsDashboard = useMemo(
        () =>
            buildCustomDashboard(
                REPORT_NAME,
                layoutConfig,
                isTrendCardsFFEnabled,
                isTablesFFEnabled,
            ),
        [isTrendCardsFFEnabled, layoutConfig, isTablesFFEnabled],
    )

    const { files: dashboardDataFiles, isLoading: isDashboardDataLoading } =
        useDashboardData(
            allAgentsDashboard,
            true,
            AnalyticsAiAgentAllAgentsReportConfig.charts,
            extraData,
        )

    const legacyChannelPerformanceTable = useDownloadChannelPerformanceData()
    const legacyIntentPerformanceTable = useDownloadIntentPerformanceData()

    const isLoading =
        isDashboardDataLoading ||
        isTrendCardsFFLoading ||
        isTablesFFLoading ||
        (!isTablesFFEnabled &&
            (legacyChannelPerformanceTable.isLoading ||
                legacyIntentPerformanceTable.isLoading))

    const files = useMemo(
        () => ({
            ...dashboardDataFiles,
            ...(!isTablesFFEnabled && {
                ...legacyChannelPerformanceTable.files,
                ...legacyIntentPerformanceTable.files,
            }),
        }),
        [
            dashboardDataFiles,
            legacyChannelPerformanceTable.files,
            legacyIntentPerformanceTable.files,
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
