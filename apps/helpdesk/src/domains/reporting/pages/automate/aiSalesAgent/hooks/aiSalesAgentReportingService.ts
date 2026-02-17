import { useMemo } from 'react'

import { createCsv } from '@repo/utils'

import {
    fetchTableReportData,
    useTableReportData,
} from 'domains/reporting/hooks/common/useTableReportData'
import { useTimeSeriesReportData } from 'domains/reporting/hooks/common/useTimeSeriesReportData'
import { useTrendReportData } from 'domains/reporting/hooks/common/useTrendReportData'
import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import type { MetricTrendFetch } from 'domains/reporting/hooks/useMetricTrend'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    AiSalesAgentChart,
    AiSalesAgentChartConfig,
    AiSalesAgentMetricConfig,
} from 'domains/reporting/pages/automate/aiSalesAgent/AiSalesAgentMetricsConfig'
import type {
    TimeSeriesMetric,
    TrendMetric,
} from 'domains/reporting/pages/automate/aiSalesAgent/AiSalesAgentMetricsConfig'
import type { ProductTableKeys } from 'domains/reporting/pages/automate/aiSalesAgent/constants'
import {
    PRODUCT_TABLE_CELLS,
    ProductTableConfig,
} from 'domains/reporting/pages/automate/aiSalesAgent/constants'
import { fetchProductRecommendations } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useProductRecommendations'
import type { MetricValueFormat } from 'domains/reporting/pages/common/utils'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'domains/reporting/pages/common/utils'
import {
    createTimeSeriesReport,
    createTrendReport,
} from 'domains/reporting/services/supportPerformanceReportingService'

export const AI_SALES_AGENT_OVERVIEW_FILENAME = 'ai-sales-agent-overview'
export const AI_SALES_AGENT_METRIC_FILE_NAME = 'metrics'
export const AI_SALES_AGENT_GMV_INFLUENCED_OVER_TIME =
    'gmv-influenced-over-time'
export const AI_SALES_AGENT_RECOMMENDED_PRODUCT = 'recommended-products'

const metricSource: TrendMetric[] = [
    AiSalesAgentChart.AiSalesAgentTotalSalesConv,
    AiSalesAgentChart.AiSalesAgentGmv,
    AiSalesAgentChart.AiSalesAgentGmvInfluenced,
    AiSalesAgentChart.AiSalesAgentRoiRate,
    AiSalesAgentChart.AiSalesAgentTotalNumberOfOrders,
    AiSalesAgentChart.AiSalesAgentAverageOrderValue,
    AiSalesAgentChart.AiSalesAgentSuccessRate,
    AiSalesAgentChart.AiSalesAgentConversionRate,
    AiSalesAgentChart.AiSalesTimeSavedByAgent,
    AiSalesAgentChart.AiSalesAgentTotalProductRecommendations,
    AiSalesAgentChart.AiSalesAgentProductClickRate,
    AiSalesAgentChart.AiSalesAgentProductBuyRate,
    AiSalesAgentChart.AiSalesDiscountOffered,
    AiSalesAgentChart.AiSalesDiscountApplied,
    AiSalesAgentChart.AiSalesDiscountRateApplied,
    AiSalesAgentChart.AiSalesAverageDiscount,
]

const metricReportSource: {
    fetchTrend: MetricTrendFetch
    metricFormat: MetricValueFormat
    title: string
}[] = metricSource.map((metric) => AiSalesAgentMetricConfig[metric])

const timeSeriesSource: TimeSeriesMetric[] = [
    AiSalesAgentChart.AiSalesAgentGmvInfluencedOverTime,
]

const timeSeriesReportSource = timeSeriesSource.map(
    (metric: TimeSeriesMetric) => AiSalesAgentChartConfig[metric],
)

const formatMetric = (
    column: ProductTableKeys,
    value?: number | null,
    currency?: string,
) => {
    return ProductTableConfig[column].metricFormat
        ? formatMetricValue(
              value,
              ProductTableConfig[column].metricFormat,
              NOT_AVAILABLE_PLACEHOLDER,
              currency,
          )
        : value
}

const tableReportDataSource = [
    {
        title: 'totalProductRecommendations',
        fetchData: fetchProductRecommendations,
    },
]

export const createReport = (data: any, fileName: string) => {
    if (!data) {
        return {
            files: {},
        }
    }

    const reportData = [
        PRODUCT_TABLE_CELLS.map((cell) => cell.title),
        ...(data?.totalProductRecommendations?.data ?? []).map((row: any) => {
            return PRODUCT_TABLE_CELLS.map((cell) => {
                return formatMetric(cell.key, row[cell.key])
            })
        }),
    ]

    return {
        files: {
            [fileName]: createCsv(reportData),
        },
        fileName,
    }
}

export const fetchTopProductRecommendationsReportData = async (
    filters: StatsFilters,
    timezone: string,
) => {
    const fileName = getCsvFileNameWithDates(
        filters.period,
        AI_SALES_AGENT_RECOMMENDED_PRODUCT,
    )

    return Promise.all([
        fetchTableReportData(filters, timezone, tableReportDataSource),
    ])
        .then((data) => {
            const report = createReport(data, fileName)

            return {
                files: {
                    ...report.files,
                },
                fileName: fileName,
                isLoading: false,
                isError: false,
            }
        })
        .catch(() => ({
            isLoading: false,
            isError: true,
            files: {},
            fileName,
        }))
}

const useAiSalesAgentOverviewReportData = () => {
    const { cleanStatsFilters, userTimezone, granularity } = useStatsFilters()

    const trendData = useTrendReportData(
        cleanStatsFilters,
        userTimezone,
        metricReportSource,
    )

    const timeSeriesData = useTimeSeriesReportData(
        cleanStatsFilters,
        userTimezone,
        granularity,
        timeSeriesReportSource,
    )

    const loading = useMemo(() => {
        return [trendData].some((metric) => metric.isFetching)
    }, [trendData])

    const metricReport = createTrendReport(
        trendData.data,
        getCsvFileNameWithDates(
            cleanStatsFilters.period,
            AI_SALES_AGENT_METRIC_FILE_NAME,
        ),
    )

    const gmvOverTimeSeries = createTimeSeriesReport(
        timeSeriesData.data,
        getCsvFileNameWithDates(
            cleanStatsFilters.period,
            AI_SALES_AGENT_GMV_INFLUENCED_OVER_TIME,
        ),
    )

    const tableData = useTableReportData(
        cleanStatsFilters,
        userTimezone,
        tableReportDataSource,
    )

    const tableReport = createReport(
        tableData.data,
        getCsvFileNameWithDates(
            cleanStatsFilters.period,
            AI_SALES_AGENT_RECOMMENDED_PRODUCT,
        ),
    )

    const fileName = getCsvFileNameWithDates(
        cleanStatsFilters.period,
        AI_SALES_AGENT_OVERVIEW_FILENAME,
    )

    return {
        files: {
            ...metricReport.files,
            ...gmvOverTimeSeries.files,
            ...tableReport.files,
        },
        fileName,
        isLoading: loading,
    }
}

export default useAiSalesAgentOverviewReportData
