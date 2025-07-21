import { ReportsIDs } from 'domains/reporting/pages/dashboards/constants'
import {
    ChartType,
    ReportConfig,
} from 'domains/reporting/pages/dashboards/types'
import { NegativeSentimentsPerProductKpiChart } from 'domains/reporting/pages/voice-of-customer/charts/NegativeSentimentsPerProductKpiChart/NegativeSentimentsPerProductKpiChart'
import { PositiveSentimentsPerProductKpiChart } from 'domains/reporting/pages/voice-of-customer/charts/PositiveSentimentsPerProductKpiChart/PositiveSentimentsPerProductKpiChart'
import { TopAIIntentsForProductOverTimeChart } from 'domains/reporting/pages/voice-of-customer/charts/TopAIIntentsForProductOverTimeChart/TopAIIntentsOverTimeForProductChart'
import { TREND_OVERVIEW_LABEL } from 'domains/reporting/pages/voice-of-customer/constants'
import {
    PRODUCT_INSIGHTS_OPTIONAL_FILTERS,
    PRODUCT_INSIGHTS_PERSISTENT_FILTERS,
} from 'domains/reporting/pages/voice-of-customer/product-insights/ProductInsightsReportConfig'
import {
    TrendOverviewChart,
    TrendOverviewChartConfig,
} from 'domains/reporting/pages/voice-of-customer/side-panel/TrendOverviewReport/TrendOverviewChartConfig'

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
