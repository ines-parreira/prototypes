import { useCallback, useMemo } from 'react'

import { formatMetricValue } from '@repo/reporting'

import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { createCsv, saveZippedFiles } from 'utils/file'

import { useDownloadGmvInfluenceTimeSeriesData } from './useDownloadGmvInfluenceTimeSeriesData'
import { useDownloadShoppingAssistantChannelPerformanceData } from './useDownloadShoppingAssistantChannelPerformanceData'
import { useDownloadShoppingAssistantTopProductsData } from './useDownloadShoppingAssistantTopProductsData'
import { useDownloadTotalSalesByProductData } from './useDownloadTotalSalesByProductData'
import { useOrdersInfluencedMetric } from './useOrdersInfluencedMetric'
import { useResolvedInteractionsMetric } from './useResolvedInteractionsMetric'
import { useRevenuePerInteractionMetric } from './useRevenuePerInteractionMetric'
import { useTotalSalesMetric } from './useTotalSalesMetric'

const REPORT_NAME = 'ai-agent-shopping-assistant'
const KPI_CARDS_FILE_NAME = 'kpi-cards'

export const useExportAiAgentShoppingAssistantToCSV = () => {
    const { cleanStatsFilters } = useStatsFilters()

    const totalSalesMetric = useTotalSalesMetric()
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
        ordersInfluencedMetric.isFetching ||
        resolvedInteractionsMetric.isFetching ||
        revenuePerInteractionMetric.isFetching ||
        totalSalesByProductData.isLoading ||
        gmvInfluenceTimeSeriesData.isLoading ||
        channelPerformanceData.isLoading ||
        topProductsData.isLoading

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
        return createCsv(csvData)
    }, [
        totalSalesMetric.data,
        ordersInfluencedMetric.data,
        resolvedInteractionsMetric.data,
        revenuePerInteractionMetric.data,
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
