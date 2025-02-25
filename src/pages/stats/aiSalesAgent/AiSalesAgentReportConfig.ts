import {FilterKey, StaticFilter} from 'models/stat/types'
import GmvInfluencedMetricCard from 'pages/stats/aiSalesAgent//charts/GmvInfluencedMetricCard'
import RoiRateMetricCard from 'pages/stats/aiSalesAgent//charts/RoiRateMetricCard'
import {
    AiSalesAgentChart,
    AiSalesAgentMetricConfig,
    AiSalesAgentChartConfig,
} from 'pages/stats/aiSalesAgent/AiSalesAgentMetricsConfig'
import AverageOrderValueCard from 'pages/stats/aiSalesAgent/charts/AverageOrderValueCard'
import GmvInfluencedOverTimeChart from 'pages/stats/aiSalesAgent/charts/GmvInfluencedOverTimeChart'
import GmvMetricCard from 'pages/stats/aiSalesAgent/charts/GmvMetricCard'
import TotalAIConvMetricCard from 'pages/stats/aiSalesAgent/charts/TotalAIConvMetricCard'
import TotalNumberOfOrdersCard from 'pages/stats/aiSalesAgent/charts/TotalNumberOfOrdersCard'
import {ROUTE_AI_SALES_AGENT_OVERVIEW} from 'pages/stats/aiSalesAgent/constants'
import {ChartType, ReportConfig} from 'pages/stats/custom-reports/types'

export const AI_SALES_AGENTS_PERSISTENT_FILTERS: StaticFilter[] = [
    FilterKey.Period,
]
export const AI_SALES_AGENTS_OPTIONAL_FILTERS = []

export const AiSalesAgentReportConfig: ReportConfig<AiSalesAgentChart> = {
    reportName: 'AI Agents Sales',
    reportPath: ROUTE_AI_SALES_AGENT_OVERVIEW,
    reportFilters: {
        persistent: AI_SALES_AGENTS_PERSISTENT_FILTERS,
        optional: AI_SALES_AGENTS_OPTIONAL_FILTERS,
    },
    charts: {
        [AiSalesAgentChart.AiSalesAgentTotalSalesConv]: {
            chartType: ChartType.Card,
            label: AiSalesAgentMetricConfig[
                AiSalesAgentChart.AiSalesAgentTotalSalesConv
            ].title,
            description:
                AiSalesAgentMetricConfig[
                    AiSalesAgentChart.AiSalesAgentTotalSalesConv
                ].hint.title,
            chartComponent: TotalAIConvMetricCard,
            csvProducer: [],
        },
        [AiSalesAgentChart.AiSalesAgentGmv]: {
            chartType: ChartType.Card,
            label: AiSalesAgentMetricConfig[AiSalesAgentChart.AiSalesAgentGmv]
                .title,
            description:
                AiSalesAgentMetricConfig[AiSalesAgentChart.AiSalesAgentGmv].hint
                    .title,
            chartComponent: GmvMetricCard,
            csvProducer: [],
        },
        [AiSalesAgentChart.AiSalesAgentGmvInfluenced]: {
            chartType: ChartType.Card,
            label: AiSalesAgentMetricConfig[
                AiSalesAgentChart.AiSalesAgentGmvInfluenced
            ].title,
            description:
                AiSalesAgentMetricConfig[
                    AiSalesAgentChart.AiSalesAgentGmvInfluenced
                ].hint.title,
            chartComponent: GmvInfluencedMetricCard,
            csvProducer: [],
        },
        [AiSalesAgentChart.AiSalesAgentRoiRate]: {
            chartType: ChartType.Card,
            label: AiSalesAgentMetricConfig[
                AiSalesAgentChart.AiSalesAgentRoiRate
            ].title,
            description:
                AiSalesAgentMetricConfig[AiSalesAgentChart.AiSalesAgentRoiRate]
                    .hint.title,
            chartComponent: RoiRateMetricCard,
            csvProducer: [],
        },
        [AiSalesAgentChart.AiSalesAgentTotalNumberOfOrders]: {
            chartType: ChartType.Card,
            label: AiSalesAgentMetricConfig[
                AiSalesAgentChart.AiSalesAgentTotalNumberOfOrders
            ].title,
            description:
                AiSalesAgentMetricConfig[
                    AiSalesAgentChart.AiSalesAgentTotalNumberOfOrders
                ].hint.title,
            chartComponent: TotalNumberOfOrdersCard,
            csvProducer: [],
        },
        [AiSalesAgentChart.AiSalesAgentAverageOrderValue]: {
            chartType: ChartType.Card,
            label: AiSalesAgentMetricConfig[
                AiSalesAgentChart.AiSalesAgentTotalNumberOfOrders
            ].title,
            description:
                AiSalesAgentMetricConfig[
                    AiSalesAgentChart.AiSalesAgentTotalNumberOfOrders
                ].hint.title,
            chartComponent: AverageOrderValueCard,
            csvProducer: [],
        },
        [AiSalesAgentChart.AiSalesAgentGmvInfluencedOverTime]: {
            chartType: ChartType.Graph,
            chartComponent: GmvInfluencedOverTimeChart,
            label: AiSalesAgentChartConfig[
                AiSalesAgentChart.AiSalesAgentGmvInfluencedOverTime
            ].title,
            description:
                AiSalesAgentChartConfig[
                    AiSalesAgentChart.AiSalesAgentGmvInfluencedOverTime
                ].hint.title,
            csvProducer: [],
        },
    },
}
