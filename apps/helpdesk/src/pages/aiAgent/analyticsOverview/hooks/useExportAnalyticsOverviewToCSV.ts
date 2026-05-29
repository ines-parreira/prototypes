import { useCallback, useMemo } from 'react'

import { useGetManagedDashboardsLayoutConfig } from '@repo/reporting'
import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useDashboardData } from 'domains/reporting/hooks/dashboards/useDashboardData'
import {
    ManagedDashboardId,
    ManagedDashboardsTabId,
} from 'pages/aiAgent/analyticsOverview/types/layoutConfig'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'
import { AGENT_COST_PER_TICKET } from 'pages/automate/automate-metrics/constants'
import { useMoneySavedPerInteractionWithAutomate } from 'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate'
import { saveZippedFiles } from 'utils/file'

import { AnalyticsOverviewReportConfig } from '../AnalyticsOverviewReportConfig'
import { DEFAULT_ANALYTICS_OVERVIEW_LAYOUT } from '../config/defaultLayoutConfig'
import { buildCustomDashboard } from '../utils/buildCustomDashboard'

const REPORT_NAME = 'analytics-overview'

export const useExportAnalyticsOverviewToCSV = () => {
    const { statsFilters } = useAiAgentStatsFilters()
    const costSavedPerInteraction = useMoneySavedPerInteractionWithAutomate(
        AGENT_COST_PER_TICKET,
    )

    const extraData = useMemo(
        () => ({ costSavedPerInteraction }),
        [costSavedPerInteraction],
    )

    const { layoutConfig } = useGetManagedDashboardsLayoutConfig({
        dashboardId: ManagedDashboardId.AiAgentOverview,
        defaultLayoutConfig: DEFAULT_ANALYTICS_OVERVIEW_LAYOUT,
        tabId: ManagedDashboardsTabId.Overview,
    })

    const analyticsOverviewDashboard = useMemo(
        () => buildCustomDashboard(REPORT_NAME, layoutConfig),
        [layoutConfig],
    )

    const { files, isLoading } = useDashboardData(
        analyticsOverviewDashboard,
        true,
        AnalyticsOverviewReportConfig.charts,
        extraData,
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
