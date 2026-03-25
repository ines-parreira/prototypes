import { useCallback, useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useDashboardData } from 'domains/reporting/hooks/dashboards/useDashboardData'
import { useGetManagedDashboardsLayoutConfig } from 'domains/reporting/hooks/managed-dashboards/useGetManagedDashboardsLayoutConfig'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { AnalyticsAiAgentShoppingAssistantReportConfig } from 'pages/aiAgent/analyticsAiAgent/AnalyticsAiAgentShoppingAssistantReportConfig'
import { ANALYTICS_AI_AGENT_SHOPPING_ASSISTANT_LAYOUT } from 'pages/aiAgent/analyticsAiAgent/config/aiAgentShoppingAssistantLayoutConfig'
import { useDownloadGmvInfluenceTimeSeriesData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadGmvInfluenceTimeSeriesData'
import { useDownloadShoppingAssistantChannelPerformanceData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadShoppingAssistantChannelPerformanceData'
import { useDownloadShoppingAssistantTopProductsData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadShoppingAssistantTopProductsData'
import { useDownloadTotalSalesByProductData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadTotalSalesByProductData'
import {
    ManagedDashboardId,
    ManagedDashboardsTabId,
} from 'pages/aiAgent/analyticsOverview/types/layoutConfig'
import { buildCustomDashboard } from 'pages/aiAgent/analyticsOverview/utils/buildCustomDashboard'
import { saveZippedFiles } from 'utils/file'

const REPORT_NAME = 'ai-agent-shopping-assistant'

export const useExportAiAgentShoppingAssistantToCSV = () => {
    const isAnalyticsDashboardsTrendCardsEnabled = useFlag(
        FeatureFlagKey.AiAgentAnalyticsDashboardsTrendCards,
    )
    const isNewChartsEnabled = useFlag(
        FeatureFlagKey.AiAgentAnalyticsDashboardsChartsAndDropdowns,
    )
    const { cleanStatsFilters } = useStatsFilters()

    const { layoutConfig } = useGetManagedDashboardsLayoutConfig({
        dashboardId: ManagedDashboardId.AiAgentAnalytics,
        defaultLayoutConfig: ANALYTICS_AI_AGENT_SHOPPING_ASSISTANT_LAYOUT,
        tabId: ManagedDashboardsTabId.ShoppingAssistant,
    })
    const shoppingAssistantDashboard = useMemo(
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

    const { files: trendCardsFiles, isLoading: isKpiLoading } =
        useDashboardData(
            shoppingAssistantDashboard,
            true,
            AnalyticsAiAgentShoppingAssistantReportConfig.charts,
        )

    const totalSalesByProductData = useDownloadTotalSalesByProductData()
    const gmvInfluenceTimeSeriesData = useDownloadGmvInfluenceTimeSeriesData()
    const channelPerformanceData =
        useDownloadShoppingAssistantChannelPerformanceData()
    const topProductsData = useDownloadShoppingAssistantTopProductsData()

    const isLoading =
        isKpiLoading ||
        (!isNewChartsEnabled &&
            (totalSalesByProductData.isLoading ||
                gmvInfluenceTimeSeriesData.isLoading ||
                channelPerformanceData.isLoading ||
                topProductsData.isLoading))

    const files = useMemo(
        () =>
            isNewChartsEnabled
                ? trendCardsFiles
                : {
                      ...trendCardsFiles,
                      ...totalSalesByProductData.files,
                      ...gmvInfluenceTimeSeriesData.files,
                      ...channelPerformanceData.files,
                      ...topProductsData.files,
                  },
        [
            isNewChartsEnabled,
            trendCardsFiles,
            totalSalesByProductData.files,
            gmvInfluenceTimeSeriesData.files,
            channelPerformanceData.files,
            topProductsData.files,
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
