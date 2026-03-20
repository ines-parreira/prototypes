import { useCallback, useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useDashboardData } from 'domains/reporting/hooks/dashboards/useDashboardData'
import { useGetManagedDashboardsLayoutConfig } from 'domains/reporting/hooks/managed-dashboards/useGetManagedDashboardsLayoutConfig'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import {
    ManagedDashboardId,
    ManagedDashboardsTabId,
} from 'pages/aiAgent/analyticsOverview/types/layoutConfig'
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
    const isNewChartsEnabled = useFlag(
        FeatureFlagKey.AiAgentAnalyticsDashboardsChartsAndDropdowns,
    )
    const { cleanStatsFilters } = useStatsFilters()

    const { layoutConfig } = useGetManagedDashboardsLayoutConfig({
        dashboardId: ManagedDashboardId.AiAgentOverview,
        defaultLayoutConfig: DEFAULT_ANALYTICS_OVERVIEW_LAYOUT,
        tabId: ManagedDashboardsTabId.Overview,
    })

    const analyticsOverviewDashboard = useMemo(
        () =>
            buildCustomDashboard(
                REPORT_NAME,
                layoutConfig,
                isAnalyticsDashboardsTrendCardsEnabled,
                isNewChartsEnabled,
            ),
        [
            isAnalyticsDashboardsTrendCardsEnabled,
            layoutConfig,
            isNewChartsEnabled,
        ],
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

    const files = useMemo(
        () =>
            isNewChartsEnabled
                ? dashboardDataFiles
                : {
                      ...dashboardDataFiles,
                      ...automationRateByFeatureData.files,
                      ...automationRateTimeSeriesData.files,
                  },
        [
            dashboardDataFiles,
            automationRateByFeatureData.files,
            automationRateTimeSeriesData.files,
            isNewChartsEnabled,
        ],
    )

    const isLoading =
        isKpiLoading ||
        (!isNewChartsEnabled &&
            (automationRateByFeatureData.isLoading ||
                automationRateTimeSeriesData.isLoading))

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
