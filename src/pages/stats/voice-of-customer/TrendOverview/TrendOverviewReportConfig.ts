import { ReportsIDs } from 'pages/stats/dashboards/constants'
import { ChartType, ReportConfig } from 'pages/stats/dashboards/types'
import { TopAIIntentsForProductOverTimeChart } from 'pages/stats/voice-of-customer/product-insights/components/TopAIIntentsOverTimeForProductChart'
import {
    PRODUCT_INSIGHTS_OPTIONAL_FILTERS,
    PRODUCT_INSIGHTS_PERSISTENT_FILTERS,
} from 'pages/stats/voice-of-customer/product-insights/ProductInsightsReportConfig'
import { TREND_OVERVIEW_LABEL } from 'pages/stats/voice-of-customer/side-panel/constants'
import { NegativeSentimentsPerProductKpiChart } from 'pages/stats/voice-of-customer/side-panel/NegativeSentimentsPerProductKpiChart'
import { PositiveSentimentsPerProductKpiChart } from 'pages/stats/voice-of-customer/side-panel/PositiveSentimentsPerProductKpiChart'
import {
    TrendOverviewChart,
    TrendOverviewChartConfig,
} from 'pages/stats/voice-of-customer/TrendOverview/TrendOverviewChartConfig'

export const TrendOverviewReportConfig: ReportConfig<TrendOverviewChart> = {
    id: ReportsIDs.TrendOverviewReportConfig,
    reportName: TREND_OVERVIEW_LABEL,
    reportPath: '',
    charts: {
        [TrendOverviewChart.TopAIIntentsForProductOverTimeChart]: {
            chartComponent: TopAIIntentsForProductOverTimeChart,
            label: TrendOverviewChartConfig[
                TrendOverviewChart.TopAIIntentsForProductOverTimeChart
            ].title,
            description:
                TrendOverviewChartConfig[
                    TrendOverviewChart.TopAIIntentsForProductOverTimeChart
                ].hint.title,
            csvProducer: null,
            chartType: ChartType.Graph,
        },
        [TrendOverviewChart.PositiveSentimentsPerProductKpiChart]: {
            chartComponent: PositiveSentimentsPerProductKpiChart,
            label: TrendOverviewChartConfig[
                TrendOverviewChart.PositiveSentimentsPerProductKpiChart
            ].title,
            description:
                TrendOverviewChartConfig[
                    TrendOverviewChart.PositiveSentimentsPerProductKpiChart
                ].hint.title,
            csvProducer: null,
            chartType: ChartType.Card,
        },
        [TrendOverviewChart.NegativeSentimentsPerProductKpiChart]: {
            chartComponent: NegativeSentimentsPerProductKpiChart,
            label: TrendOverviewChartConfig[
                TrendOverviewChart.NegativeSentimentsPerProductKpiChart
            ].title,
            description:
                TrendOverviewChartConfig[
                    TrendOverviewChart.NegativeSentimentsPerProductKpiChart
                ].hint.title,
            csvProducer: null,
            chartType: ChartType.Card,
        },
    },
    reportFilters: {
        persistent: PRODUCT_INSIGHTS_PERSISTENT_FILTERS,
        optional: PRODUCT_INSIGHTS_OPTIONAL_FILTERS,
    },
}
