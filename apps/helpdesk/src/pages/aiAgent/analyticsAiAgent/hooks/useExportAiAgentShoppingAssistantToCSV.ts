import { useCallback, useMemo } from 'react'

import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'

import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useDashboardData } from 'domains/reporting/hooks/dashboards/useDashboardData'
import { useGetManagedDashboardsLayoutConfig } from 'domains/reporting/hooks/managed-dashboards/useGetManagedDashboardsLayoutConfig'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { AnalyticsAiAgentShoppingAssistantReportConfig } from 'pages/aiAgent/analyticsAiAgent/AnalyticsAiAgentShoppingAssistantReportConfig'
import { ANALYTICS_AI_AGENT_SHOPPING_ASSISTANT_LAYOUT } from 'pages/aiAgent/analyticsAiAgent/config/aiAgentShoppingAssistantLayoutConfig'
import { useDownloadGmvInfluenceTimeSeriesData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadGmvInfluenceTimeSeriesData'
import { useDownloadShoppingAssistantChannelPerformanceData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadShoppingAssistantChannelPerformanceData'
import { useDownloadShoppingAssistantTopProductsDataLegacy } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadShoppingAssistantTopProductsDataLegacy'
import { useDownloadTotalSalesByProductData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadTotalSalesByProductData'
import {
    ManagedDashboardId,
    ManagedDashboardsTabId,
} from 'pages/aiAgent/analyticsOverview/types/layoutConfig'
import { buildCustomDashboard } from 'pages/aiAgent/analyticsOverview/utils/buildCustomDashboard'
import { saveZippedFiles } from 'utils/file'

const REPORT_NAME = 'ai-agent-shopping-assistant'

export const useExportAiAgentShoppingAssistantToCSV = () => {
    const { value: isTrendCardsFFEnabled, isLoading: isTrendCardsFFLoading } =
        useFlagWithLoading(FeatureFlagKey.AiAgentAnalyticsDashboardsTrendCards)
    const { value: isGraphsFFEnabled, isLoading: isGraphsFFLoading } =
        useFlagWithLoading(
            FeatureFlagKey.AiAgentAnalyticsDashboardsChartsAndDropdowns,
        )
    const { value: isTablesFFEnabled, isLoading: isTablesFFLoading } =
        useFlagWithLoading(FeatureFlagKey.AiAgentAnalyticsDashboardsTables)

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
                isTrendCardsFFEnabled,
                isGraphsFFEnabled,
                isTablesFFEnabled,
            ),
        [
            isTrendCardsFFEnabled,
            layoutConfig,
            isGraphsFFEnabled,
            isTablesFFEnabled,
        ],
    )

    const { files: dashboardDataFiles, isLoading: isDashboardDataLoading } =
        useDashboardData(
            shoppingAssistantDashboard,
            true,
            AnalyticsAiAgentShoppingAssistantReportConfig.charts,
        )

    const totalSalesByProductData = useDownloadTotalSalesByProductData()
    const gmvInfluenceTimeSeriesData = useDownloadGmvInfluenceTimeSeriesData()
    const legacySalesChannelTable =
        useDownloadShoppingAssistantChannelPerformanceData()
    const legacyTopProductsTable =
        useDownloadShoppingAssistantTopProductsDataLegacy()

    const isLoading =
        isDashboardDataLoading ||
        isTrendCardsFFLoading ||
        isGraphsFFLoading ||
        isTablesFFLoading ||
        (!isGraphsFFEnabled &&
            (totalSalesByProductData.isLoading ||
                gmvInfluenceTimeSeriesData.isLoading)) ||
        (!isTablesFFEnabled &&
            (legacySalesChannelTable.isLoading ||
                legacyTopProductsTable.isLoading))

    const files = useMemo(
        () => ({
            ...dashboardDataFiles,
            ...(!isGraphsFFEnabled && {
                ...totalSalesByProductData.files,
                ...gmvInfluenceTimeSeriesData.files,
            }),
            ...(!isTablesFFEnabled && {
                ...legacySalesChannelTable.files,
                ...legacyTopProductsTable.files,
            }),
        }),
        [
            dashboardDataFiles,
            totalSalesByProductData.files,
            gmvInfluenceTimeSeriesData.files,
            legacySalesChannelTable.files,
            legacyTopProductsTable.files,
            isGraphsFFEnabled,
            isTablesFFEnabled,
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
