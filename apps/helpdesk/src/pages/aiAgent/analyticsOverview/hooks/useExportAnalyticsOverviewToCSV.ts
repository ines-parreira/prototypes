import { useCallback, useMemo } from 'react'

import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useDashboardData } from 'domains/reporting/hooks/dashboards/useDashboardData'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import type { DashboardSchema } from 'domains/reporting/pages/dashboards/types'
import { DashboardChildType } from 'domains/reporting/pages/dashboards/types'
import { saveZippedFiles } from 'utils/file'

import { DEFAULT_ANALYTICS_OVERVIEW_LAYOUT } from '../config/defaultLayoutConfig'
import { useDownloadAutomationRateByFeatureData } from './useDownloadAutomationRateByFeatureData'
import { useDownloadAutomationRateTimeSeriesData } from './useDownloadAutomationRateTimeSeriesData'
import { useDownloadPerformanceBreakdownData } from './useDownloadPerformanceBreakdownData'

const REPORT_NAME = 'analytics-overview'

const analyticsOverviewDashboard: DashboardSchema = {
    id: -1,
    name: REPORT_NAME,
    analytics_filter_id: null,
    emoji: null,
    children: DEFAULT_ANALYTICS_OVERVIEW_LAYOUT.sections
        .filter((section) => section.type === 'kpis')
        .map((section) => ({
            type: DashboardChildType.Section,
            children: section.items
                .filter((item) => item.visibility)
                .map((item) => ({
                    type: DashboardChildType.Chart,
                    config_id: item.chartId,
                })),
        })),
}

export const useExportAnalyticsOverviewToCSV = () => {
    const { cleanStatsFilters } = useStatsFilters()

    const { files: trendCardsFiles, isLoading: isKpiLoading } =
        useDashboardData(analyticsOverviewDashboard, true)

    const automationRateByFeatureData = useDownloadAutomationRateByFeatureData()
    const automationRateTimeSeriesData =
        useDownloadAutomationRateTimeSeriesData()
    const performanceBreakdownData = useDownloadPerformanceBreakdownData()

    const isLoading =
        isKpiLoading ||
        automationRateByFeatureData.isLoading ||
        automationRateTimeSeriesData.isLoading ||
        performanceBreakdownData.isLoading

    const files = useMemo(
        () => ({
            ...trendCardsFiles,
            ...automationRateByFeatureData.files,
            ...automationRateTimeSeriesData.files,
            ...performanceBreakdownData.files,
        }),
        [
            trendCardsFiles,
            automationRateByFeatureData.files,
            automationRateTimeSeriesData.files,
            performanceBreakdownData.files,
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
