import { useCallback, useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { formatMetricValue } from '@repo/reporting'

import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useAverageDiscountAmountMetric } from 'pages/aiAgent/analyticsAiAgent/hooks/useAverageDiscountAmountMetric'
import { useDownloadGmvInfluenceTimeSeriesData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadGmvInfluenceTimeSeriesData'
import { useDownloadShoppingAssistantChannelPerformanceData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadShoppingAssistantChannelPerformanceData'
import { useDownloadShoppingAssistantTopProductsData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadShoppingAssistantTopProductsData'
import { useDownloadTotalSalesByProductData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadTotalSalesByProductData'
import { useOrdersInfluencedMetric } from 'pages/aiAgent/analyticsAiAgent/hooks/useOrdersInfluencedMetric'
import { useResolvedInteractionsMetric } from 'pages/aiAgent/analyticsAiAgent/hooks/useResolvedInteractionsMetric'
import { useRevenuePerInteractionMetric } from 'pages/aiAgent/analyticsAiAgent/hooks/useRevenuePerInteractionMetric'
import { useTotalSalesMetric } from 'pages/aiAgent/analyticsAiAgent/hooks/useTotalSalesMetric'
import { createCsv, saveZippedFiles } from 'utils/file'

const REPORT_NAME = 'ai-agent-shopping-assistant'
const KPI_CARDS_FILE_NAME = 'kpi-cards'

export const useExportAiAgentShoppingAssistantToCSV = () => {
    const isAnalyticsDashboardsTrendCardsEnabled = useFlag(
        FeatureFlagKey.AiAgentAnalyticsDashboardsTrendCards,
    )
    const { cleanStatsFilters } = useStatsFilters()

    const totalSalesMetric = useTotalSalesMetric()
    const averageDiscountAmountMetric = useAverageDiscountAmountMetric()
    const ordersInfluencedMetric = useOrdersInfluencedMetric()
    const resolvedInteractionsMetric = useResolvedInteractionsMetric()
    const revenuePerInteractionMetric = useRevenuePerInteractionMetric()

    const totalSalesByProductData = useDownloadTotalSalesByProductData()
    const gmvInfluenceTimeSeriesData = useDownloadGmvInfluenceTimeSeriesData()
    const channelPerformanceData =
        useDownloadShoppingAssistantChannelPerformanceData()
    const topProductsData = useDownloadShoppingAssistantTopProductsData()

    const isLoading =
        totalSalesMetric.isFetching ||
        averageDiscountAmountMetric.isFetching ||
        ordersInfluencedMetric.isFetching ||
        resolvedInteractionsMetric.isFetching ||
        revenuePerInteractionMetric.isFetching ||
        totalSalesByProductData.isLoading ||
        gmvInfluenceTimeSeriesData.isLoading ||
        channelPerformanceData.isLoading ||
        topProductsData.isLoading

    const enabledUnderFeatureFlagCsvData = useMemo(() => {
        if (!isAnalyticsDashboardsTrendCardsEnabled) {
            return []
        }
        return [
            [
                'Average discount amount',
                formatMetricValue(
                    averageDiscountAmountMetric.data?.value,
                    'currency-precision-1',
                ),
                formatMetricValue(
                    averageDiscountAmountMetric.data?.prevValue,
                    'currency-precision-1',
                ),
            ],
        ]
    }, [
        isAnalyticsDashboardsTrendCardsEnabled,
        averageDiscountAmountMetric.data,
    ])

    const kpiCardsCsv = useMemo(() => {
        const csvData = [
            ['', 'current period', 'previous period'],
            [
                'Total sales',
                formatMetricValue(
                    totalSalesMetric.data?.value,
                    'currency-precision-1',
                ),
                formatMetricValue(
                    totalSalesMetric.data?.prevValue,
                    'currency-precision-1',
                ),
            ],

            [
                'Orders influenced',
                formatMetricValue(
                    ordersInfluencedMetric.data?.value,
                    'decimal',
                ),
                formatMetricValue(
                    ordersInfluencedMetric.data?.prevValue,
                    'decimal',
                ),
            ],
            [
                'Automated interactions',
                formatMetricValue(
                    resolvedInteractionsMetric.data?.value,
                    'decimal',
                ),
                formatMetricValue(
                    resolvedInteractionsMetric.data?.prevValue,
                    'decimal',
                ),
            ],
            [
                'Revenue per interaction',
                formatMetricValue(
                    revenuePerInteractionMetric.data?.value,
                    'currency-precision-1',
                ),
                formatMetricValue(
                    revenuePerInteractionMetric.data?.prevValue,
                    'currency-precision-1',
                ),
            ],
        ]
        return createCsv([...csvData, ...enabledUnderFeatureFlagCsvData])
    }, [
        totalSalesMetric.data,
        ordersInfluencedMetric.data,
        resolvedInteractionsMetric.data,
        revenuePerInteractionMetric.data,
        enabledUnderFeatureFlagCsvData,
    ])

    const kpiCardsFileName = getCsvFileNameWithDates(
        cleanStatsFilters.period,
        KPI_CARDS_FILE_NAME,
    )

    const files = useMemo(
        () => ({
            [kpiCardsFileName]: kpiCardsCsv,
            ...totalSalesByProductData.files,
            ...gmvInfluenceTimeSeriesData.files,
            ...channelPerformanceData.files,
            ...topProductsData.files,
        }),
        [
            kpiCardsFileName,
            kpiCardsCsv,
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
