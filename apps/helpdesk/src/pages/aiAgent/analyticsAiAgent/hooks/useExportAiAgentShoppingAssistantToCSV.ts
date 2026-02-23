import { useCallback, useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useDashboardData } from 'domains/reporting/hooks/dashboards/useDashboardData'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import type { DashboardSchema } from 'domains/reporting/pages/dashboards/types'
import { DashboardChildType } from 'domains/reporting/pages/dashboards/types'
import { ANALYTICS_AI_AGENT_SHOPPING_ASSISTANT_LAYOUT } from 'pages/aiAgent/analyticsAiAgent/config/aiAgentShoppingAssistantLayoutConfig'
import { useDownloadGmvInfluenceTimeSeriesData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadGmvInfluenceTimeSeriesData'
import { useDownloadShoppingAssistantChannelPerformanceData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadShoppingAssistantChannelPerformanceData'
import { useDownloadShoppingAssistantTopProductsData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadShoppingAssistantTopProductsData'
import { useDownloadTotalSalesByProductData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadTotalSalesByProductData'
import { saveZippedFiles } from 'utils/file'

const REPORT_NAME = 'ai-agent-shopping-assistant'

export const useExportAiAgentShoppingAssistantToCSV = () => {
    const isAnalyticsDashboardsTrendCardsEnabled = useFlag(
        FeatureFlagKey.AiAgentAnalyticsDashboardsTrendCards,
    )
    const { cleanStatsFilters } = useStatsFilters()

    const shoppingAssistantDashboard = useMemo(
        (): DashboardSchema => ({
            id: -1,
            name: REPORT_NAME,
            analytics_filter_id: null,
            emoji: null,
            children: ANALYTICS_AI_AGENT_SHOPPING_ASSISTANT_LAYOUT.sections
                .filter((section) => section.type === 'kpis')
                .map((section) => ({
                    type: DashboardChildType.Section,
                    children: section.items
                        .filter(
                            (item) =>
                                item.visibility &&
                                (!item.requiresFeatureFlag ||
                                    isAnalyticsDashboardsTrendCardsEnabled),
                        )
                        .map((item) => ({
                            type: DashboardChildType.Chart,
                            config_id: item.chartId,
                        })),
                })),
        }),
        [isAnalyticsDashboardsTrendCardsEnabled],
    )

    const { files: trendCardsFiles, isLoading: isKpiLoading } =
        useDashboardData(shoppingAssistantDashboard, true)

    const totalSalesByProductData = useDownloadTotalSalesByProductData()
    const gmvInfluenceTimeSeriesData = useDownloadGmvInfluenceTimeSeriesData()
    const channelPerformanceData =
        useDownloadShoppingAssistantChannelPerformanceData()
    const topProductsData = useDownloadShoppingAssistantTopProductsData()

    const isLoading =
        isKpiLoading ||
        totalSalesByProductData.isLoading ||
        gmvInfluenceTimeSeriesData.isLoading ||
        channelPerformanceData.isLoading ||
        topProductsData.isLoading

    const files = useMemo(
        () => ({
            ...trendCardsFiles,
            ...totalSalesByProductData.files,
            ...gmvInfluenceTimeSeriesData.files,
            ...channelPerformanceData.files,
            ...topProductsData.files,
        }),
        [
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
