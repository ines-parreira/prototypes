import { useCallback, useMemo } from 'react'

import { useGetManagedDashboardsLayoutConfig } from '@repo/reporting'
import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useDashboardData } from 'domains/reporting/hooks/dashboards/useDashboardData'
import { buildDashboardSchemaFromLayout } from 'domains/reporting/utils/buildDashboardSchemaFromLayout'
import { AnalyticsAiAgentAllAgentsReportConfig } from 'pages/aiAgent/analyticsAiAgent/AnalyticsAiAgentAllAgentsReportConfig'
import { ANALYTICS_AI_AGENT_ALL_AGENTS_LAYOUT } from 'pages/aiAgent/analyticsAiAgent/config/aiAgentAllAgentsLayoutConfig'
import {
    ManagedDashboardId,
    ManagedDashboardsTabId,
} from 'pages/aiAgent/analyticsOverview/types/layoutConfig'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'
import { saveZippedFiles } from 'utils/file'

const REPORT_NAME = 'ai-agent-all-agents'

export const useExportAiAgentAllAgentsToCSV = () => {
    const { statsFilters } = useAiAgentStatsFilters()

    const { layoutConfig } = useGetManagedDashboardsLayoutConfig({
        dashboardId: ManagedDashboardId.AiAgentAnalytics,
        defaultLayoutConfig: ANALYTICS_AI_AGENT_ALL_AGENTS_LAYOUT,
        tabId: ManagedDashboardsTabId.AllAgents,
    })

    const allAgentsDashboard = useMemo(
        () => buildDashboardSchemaFromLayout(layoutConfig, REPORT_NAME),
        [layoutConfig],
    )

    const { files: dashboardDataFiles, isLoading: isDashboardDataLoading } =
        useDashboardData(
            allAgentsDashboard,
            AnalyticsAiAgentAllAgentsReportConfig.charts,
        )

    const isLoading = isDashboardDataLoading

    const files = dashboardDataFiles

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
