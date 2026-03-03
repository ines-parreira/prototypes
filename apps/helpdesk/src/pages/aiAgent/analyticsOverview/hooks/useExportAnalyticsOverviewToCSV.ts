import { useCallback, useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useDashboardData } from 'domains/reporting/hooks/dashboards/useDashboardData'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { saveZippedFiles } from 'utils/file'

import { DEFAULT_ANALYTICS_OVERVIEW_LAYOUT } from '../config/defaultLayoutConfig'
import { buildKpiDashboard } from '../utils/buildKpiDashboard'
import { useDownloadAutomationRateByFeatureData } from './useDownloadAutomationRateByFeatureData'
import { useDownloadAutomationRateTimeSeriesData } from './useDownloadAutomationRateTimeSeriesData'
import { useDownloadPerformanceBreakdownData } from './useDownloadPerformanceBreakdownData'

const REPORT_NAME = 'analytics-overview'

export const useExportAnalyticsOverviewToCSV = () => {
    const isAnalyticsDashboardsTrendCardsEnabled = useFlag(
        FeatureFlagKey.AiAgentAnalyticsDashboardsTrendCards,
    )
    const { cleanStatsFilters } = useStatsFilters()

    const analyticsOverviewDashboard = useMemo(
        () =>
            buildKpiDashboard(
                REPORT_NAME,
                DEFAULT_ANALYTICS_OVERVIEW_LAYOUT,
                isAnalyticsDashboardsTrendCardsEnabled,
            ),
        [isAnalyticsDashboardsTrendCardsEnabled],
    )

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
