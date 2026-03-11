import { useCallback, useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useDashboardData } from 'domains/reporting/hooks/dashboards/useDashboardData'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { saveZippedFiles } from 'utils/file'

import { AnalyticsOverviewReportConfig } from '../AnalyticsOverviewReportConfig'
import { DEFAULT_ANALYTICS_OVERVIEW_LAYOUT } from '../config/defaultLayoutConfig'
import { buildCustomDashboard } from '../utils/buildCustomDashboard'
import { useDownloadAutomationRateByFeatureData } from './useDownloadAutomationRateByFeatureData'
import { useDownloadAutomationRateTimeSeriesData } from './useDownloadAutomationRateTimeSeriesData'

const REPORT_NAME = 'analytics-overview'

export const useExportAnalyticsOverviewToCSV = () => {
    const isAnalyticsDashboardsTrendCardsEnabled = useFlag(
        FeatureFlagKey.AiAgentAnalyticsDashboardsTrendCards,
    )
    const { cleanStatsFilters } = useStatsFilters()

    const analyticsOverviewDashboard = useMemo(
        () =>
            buildCustomDashboard(
                REPORT_NAME,
                DEFAULT_ANALYTICS_OVERVIEW_LAYOUT,
                isAnalyticsDashboardsTrendCardsEnabled,
            ),
        [isAnalyticsDashboardsTrendCardsEnabled],
    )

    const { files: dashboardDataFiles, isLoading: isKpiLoading } =
        useDashboardData(
            analyticsOverviewDashboard,
            true,
            AnalyticsOverviewReportConfig.charts,
        )

    const automationRateByFeatureData = useDownloadAutomationRateByFeatureData()
    const automationRateTimeSeriesData =
        useDownloadAutomationRateTimeSeriesData()

    const isLoading =
        isKpiLoading ||
        automationRateByFeatureData.isLoading ||
        automationRateTimeSeriesData.isLoading

    const files = useMemo(
        () => ({
            ...dashboardDataFiles,
            ...automationRateByFeatureData.files,
            ...automationRateTimeSeriesData.files,
        }),
        [
            dashboardDataFiles,
            automationRateByFeatureData.files,
            automationRateTimeSeriesData.files,
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
