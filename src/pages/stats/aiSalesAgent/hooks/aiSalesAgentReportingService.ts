import { useMemo } from 'react'

import { useTimeSeriesReportData } from 'hooks/reporting/common/useTimeSeriesReportData'
import { useTrendReportData } from 'hooks/reporting/common/useTrendReportData'
import { getCsvFileNameWithDates } from 'hooks/reporting/common/utils'
import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { MetricTrendFetch } from 'hooks/reporting/useMetricTrend'
import {
    AiSalesAgentChart,
    AiSalesAgentChartConfig,
    AiSalesAgentMetricConfig,
    type TimeSeriesMetric,
    type TrendMetric,
} from 'pages/stats/aiSalesAgent/AiSalesAgentMetricsConfig'
import { MetricValueFormat } from 'pages/stats/common/utils'
import {
    createTimeSeriesReport,
    createTrendReport,
} from 'services/reporting/supportPerformanceReportingService'

export const AI_SALES_AGENT_OVERVIEW_FILENAME = 'ai-sales-agent-overview'
export const AI_SALES_AGENT_METRIC_FILE_NAME = 'metrics'
export const AI_SALES_AGENT_GMV_INFLUENCED_OVER_TIME =
    'gmv-influenced-over-time'

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

    const fileName = getCsvFileNameWithDates(
        cleanStatsFilters.period,
        AI_SALES_AGENT_OVERVIEW_FILENAME,
    )

    return {
        files: {
            ...metricReport.files,
            ...gmvOverTimeSeries.files,
        },
        fileName,
        isLoading: loading,
    }
}

export default useAiSalesAgentOverviewReportData
