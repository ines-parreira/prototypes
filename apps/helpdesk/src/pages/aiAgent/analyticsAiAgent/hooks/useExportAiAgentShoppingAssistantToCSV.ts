import { useCallback, useMemo } from 'react'

import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'

import { useGetManagedDashboardsLayoutConfig } from '@repo/reporting'
import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useDashboardData } from 'domains/reporting/hooks/dashboards/useDashboardData'
import { AnalyticsAiAgentShoppingAssistantReportConfig } from 'pages/aiAgent/analyticsAiAgent/AnalyticsAiAgentShoppingAssistantReportConfig'
import { ANALYTICS_AI_AGENT_SHOPPING_ASSISTANT_LAYOUT } from 'pages/aiAgent/analyticsAiAgent/config/aiAgentShoppingAssistantLayoutConfig'
import { useDownloadShoppingAssistantChannelPerformanceData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadShoppingAssistantChannelPerformanceData'
import { useDownloadShoppingAssistantTopProductsDataLegacy } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadShoppingAssistantTopProductsDataLegacy'
import {
    ManagedDashboardId,
    ManagedDashboardsTabId,
} from 'pages/aiAgent/analyticsOverview/types/layoutConfig'
import { buildCustomDashboard } from 'pages/aiAgent/analyticsOverview/utils/buildCustomDashboard'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'
import { saveZippedFiles } from 'utils/file'

const REPORT_NAME = 'ai-agent-shopping-assistant'

export const useExportAiAgentShoppingAssistantToCSV = () => {
    const { value: isTrendCardsFFEnabled, isLoading: isTrendCardsFFLoading } =
        useFlagWithLoading(FeatureFlagKey.AiAgentAnalyticsDashboardsTrendCards)
    const { value: isTablesFFEnabled, isLoading: isTablesFFLoading } =
        useFlagWithLoading(FeatureFlagKey.AiAgentAnalyticsDashboardsTables)

    const { statsFilters } = useAiAgentStatsFilters()

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
                isTablesFFEnabled,
            ),
        [isTrendCardsFFEnabled, layoutConfig, isTablesFFEnabled],
    )

    const { files: dashboardDataFiles, isLoading: isDashboardDataLoading } =
        useDashboardData(
            shoppingAssistantDashboard,
            true,
            AnalyticsAiAgentShoppingAssistantReportConfig.charts,
        )

    const legacySalesChannelTable =
        useDownloadShoppingAssistantChannelPerformanceData()
    const legacyTopProductsTable =
        useDownloadShoppingAssistantTopProductsDataLegacy()

    const isLoading =
        isDashboardDataLoading ||
        isTrendCardsFFLoading ||
        isTablesFFLoading ||
        (!isTablesFFEnabled &&
            (legacySalesChannelTable.isLoading ||
                legacyTopProductsTable.isLoading))

    const files = useMemo(
        () => ({
            ...dashboardDataFiles,
            ...(!isTablesFFEnabled && {
                ...legacySalesChannelTable.files,
                ...legacyTopProductsTable.files,
            }),
        }),
        [
            dashboardDataFiles,
            legacySalesChannelTable.files,
            legacyTopProductsTable.files,
            isTablesFFEnabled,
        ],
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
