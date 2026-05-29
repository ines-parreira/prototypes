import { useCallback, useMemo } from 'react'

import { useGetManagedDashboardsLayoutConfig } from '@repo/reporting'

import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useDashboardData } from 'domains/reporting/hooks/dashboards/useDashboardData'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { DEFAULT_PERFORMANCE_OVERVIEW_LAYOUT } from 'domains/reporting/pages/performance/overview/config/defaultLayoutConfig'
import {
    PERFORMANCE_OVERVIEW_DASHBOARD_ID,
    PerformanceOverviewTabs,
} from 'domains/reporting/pages/performance/overview/constants'
import { PerformanceOverviewReportConfig } from 'domains/reporting/pages/performance/overview/PerformanceOverviewReportConfig'
import { buildDashboardSchemaFromLayout } from 'domains/reporting/utils/buildDashboardSchemaFromLayout'
import { saveZippedFiles } from 'utils/file'

const REPORT_NAME = 'performance-overview'

export const useExportPerformanceOverviewToCSV = () => {
    const { cleanStatsFilters } = useStatsFilters()

    const { layoutConfig } = useGetManagedDashboardsLayoutConfig({
        dashboardId: PERFORMANCE_OVERVIEW_DASHBOARD_ID,
        defaultLayoutConfig: DEFAULT_PERFORMANCE_OVERVIEW_LAYOUT,
        tabId: PerformanceOverviewTabs.Overview,
    })

    const performanceOverviewDashboard = useMemo(
        () => buildDashboardSchemaFromLayout(layoutConfig, REPORT_NAME),
        [layoutConfig],
    )

    const { files, isLoading } = useDashboardData(
        performanceOverviewDashboard,
        PerformanceOverviewReportConfig.charts,
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
