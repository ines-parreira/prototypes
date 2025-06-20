import { FilterKey, StaticFilter } from 'models/stat/types'
import { AUTO_QA_FILTER_KEYS } from 'pages/stats/common/filters/constants'
import { ReportsIDs } from 'pages/stats/dashboards/constants'
import { ChartType, ReportConfig } from 'pages/stats/dashboards/types'
import { AGENT_PERFORMANCE_SECTION_TITLE } from 'pages/stats/support-performance/agents/AgentsTableChart'
import { ChangeInTicketVolumeChart } from 'pages/stats/voice-of-customer/product-insights/charts/ChangeInTicketVolumeChart'
import { TopAIIntentsOverTimeChart } from 'pages/stats/voice-of-customer/product-insights/charts/TopAIIntentsOverTimeChart'
import { ProductInsightsTableChart } from 'pages/stats/voice-of-customer/product-insights/components/ProductInsightsTableChart/ProductInsightsTableChart'
import { TotalProductSentimentOverTimeChart } from 'pages/stats/voice-of-customer/product-insights/components/TotalProductSentimentOverTimeChart'
import {
    TICKET_VOLUME_CHART_LABEL,
    TICKET_VOLUME_CHART_TOOLTIP,
} from 'pages/stats/voice-of-customer/product-insights/constants'
import {
    ProductInsightsChart,
    ProductInsightsChartConfig,
} from 'pages/stats/voice-of-customer/product-insights/ProductInsightsChartConfig'
import { TopProductsPerIntentChart } from 'pages/stats/voice-of-customer/product-insights/TopProductsPerIntentChart'
import { VOICE_OF_CUSTOMER_ROUTES } from 'routes/constants'

export const PRODUCT_INSIGHTS_PERSISTENT_FILTERS: StaticFilter[] = [
    FilterKey.Period,
    FilterKey.AggregationWindow,
]

export const PRODUCT_INSIGHTS_OPTIONAL_FILTERS = [
    FilterKey.Channels,
    FilterKey.Integrations,
    FilterKey.Tags,
    FilterKey.Agents,
    FilterKey.CustomFields,
    FilterKey.Score,
    ...AUTO_QA_FILTER_KEYS,
]

export const ProductInsightsPlaceholderReportConfig: ReportConfig<ProductInsightsChart> =
    {
        id: ReportsIDs.ProductInsightsReportConfig,
        reportName: AGENT_PERFORMANCE_SECTION_TITLE,
        reportPath: VOICE_OF_CUSTOMER_ROUTES.PRODUCT_INSIGHTS,
        charts: {
            [ProductInsightsChart.TotalProductSentimentOverTimeChart]: {
                chartComponent: TotalProductSentimentOverTimeChart,
                label: ProductInsightsChartConfig[
                    ProductInsightsChart.TotalProductSentimentOverTimeChart
                ].title,
                description:
                    ProductInsightsChartConfig[
                        ProductInsightsChart.TotalProductSentimentOverTimeChart
                    ].hint.title,
                csvProducer: null,
                chartType: ChartType.Graph,
            },
            [ProductInsightsChart.TicketVolumeChart]: {
                chartComponent: ChangeInTicketVolumeChart,
                label: TICKET_VOLUME_CHART_LABEL,
                description: TICKET_VOLUME_CHART_TOOLTIP,
                csvProducer: null,
                chartType: ChartType.Graph,
            },
            [ProductInsightsChart.TopAIIntentsOverTimeChart]: {
                chartComponent: TopAIIntentsOverTimeChart,
                label: ProductInsightsChartConfig[
                    ProductInsightsChart.TopAIIntentsOverTimeChart
                ].title,
                description:
                    ProductInsightsChartConfig[
                        ProductInsightsChart.TopAIIntentsOverTimeChart
                    ].hint.title,
                csvProducer: null,
                chartType: ChartType.Graph,
            },
            [ProductInsightsChart.ProductInsightsTableChart]: {
                chartComponent: ProductInsightsTableChart,
                label: TICKET_VOLUME_CHART_LABEL,
                description: TICKET_VOLUME_CHART_LABEL,
                csvProducer: null,
                chartType: ChartType.Table,
            },
            [ProductInsightsChart.TopProductsPerIntentChart]: {
                chartComponent: TopProductsPerIntentChart,
                label: ProductInsightsChartConfig[
                    ProductInsightsChart.TopProductsPerIntentChart
                ].title,
                description:
                    ProductInsightsChartConfig[
                        ProductInsightsChart.TopProductsPerIntentChart
                    ].hint.title,
                csvProducer: null,
                chartType: ChartType.Graph,
            },
        },
        reportFilters: {
            persistent: PRODUCT_INSIGHTS_PERSISTENT_FILTERS,
            optional: PRODUCT_INSIGHTS_OPTIONAL_FILTERS,
        },
    }
