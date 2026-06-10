import { useCallback, useMemo } from 'react'

import { useGetManagedDashboardsLayoutConfig } from '@repo/reporting'
import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useDashboardData } from 'domains/reporting/hooks/dashboards/useDashboardData'
import {
    ManagedDashboardId,
    ManagedDashboardsTabId,
} from 'pages/aiAgent/analyticsOverview/types/layoutConfig'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'
import { saveZippedFiles } from 'utils/file'

import { buildDashboardSchemaFromLayout } from 'domains/reporting/utils/buildDashboardSchemaFromLayout'
import { AnalyticsOverviewReportConfig } from '../AnalyticsOverviewReportConfig'
import { DEFAULT_ANALYTICS_OVERVIEW_LAYOUT } from '../config/defaultLayoutConfig'

const REPORT_NAME = 'analytics-overview'

export const useExportAnalyticsOverviewToCSV = () => {
    const { statsFilters } = useAiAgentStatsFilters()

    const { layoutConfig } = useGetManagedDashboardsLayoutConfig({
        dashboardId: ManagedDashboardId.AiAgentOverview,
        defaultLayoutConfig: DEFAULT_ANALYTICS_OVERVIEW_LAYOUT,
        tabId: ManagedDashboardsTabId.Overview,
    })

    const analyticsOverviewDashboard = useMemo(
        () => buildDashboardSchemaFromLayout(layoutConfig, REPORT_NAME),
        [layoutConfig],
    )

    const { files, isLoading } = useDashboardData(
        analyticsOverviewDashboard,
        AnalyticsOverviewReportConfig.charts,
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
