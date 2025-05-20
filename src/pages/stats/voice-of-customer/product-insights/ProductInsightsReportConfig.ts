import { FilterKey, StaticFilter } from 'models/stat/types'
import { AUTO_QA_FILTER_KEYS } from 'pages/stats/common/filters/constants'
import { ReportsIDs } from 'pages/stats/dashboards/constants'
import { ChartType, ReportConfig } from 'pages/stats/dashboards/types'
import { AGENT_PERFORMANCE_SECTION_TITLE } from 'pages/stats/support-performance/agents/AgentsTableChart'
import { TopAIIntentsOverTimeChart } from 'pages/stats/voice-of-customer/product-insights/components/TopAIIntentsOverTimeChart'
import { TotalProductSentimentOverTimeChart } from 'pages/stats/voice-of-customer/product-insights/components/TotalProductSentimentOverTimeChart'
import { TICKET_VOLUME_CHART_LABEL } from 'pages/stats/voice-of-customer/product-insights/constants'
import { ProductInsightsTableChart } from 'pages/stats/voice-of-customer/product-insights/placeholder/ProductInsightsTableChart'
import { TicketVolumeChart } from 'pages/stats/voice-of-customer/product-insights/placeholder/TicketVolumeChart'
import {
    TOP_PRODUCTS_PER_INTENT_HINT,
    TOP_PRODUCTS_PER_INTENT_TITLE,
    TopProductsPerIntentChart,
} from 'pages/stats/voice-of-customer/product-insights/placeholder/TopProductsPerIntentChart'
import {
    ProductInsightsChart,
    ProductInsightsChartConfig,
} from 'pages/stats/voice-of-customer/product-insights/ProductInsightsChartConfig'
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
        id: ReportsIDs.SupportPerformanceAgentsReportConfig,
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
                chartComponent: TicketVolumeChart,
                label: 'Change in ticket volume',
                description: 'Change in ticket volume ',
                csvProducer: null,
                chartType: ChartType.Table,
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
            [ProductInsightsChart.ProductInsightsTableChartPlaceholder]: {
                chartComponent: ProductInsightsTableChart,
                label: TICKET_VOLUME_CHART_LABEL,
                description: TICKET_VOLUME_CHART_LABEL,
                csvProducer: null,
                chartType: ChartType.Table,
            },
            [ProductInsightsChart.TopProductsPerIntentChartPlaceholder]: {
                chartComponent: TopProductsPerIntentChart,
                label: TOP_PRODUCTS_PER_INTENT_TITLE,
                description: TOP_PRODUCTS_PER_INTENT_HINT.title,
                csvProducer: null,
                chartType: ChartType.Graph,
            },
        },
        reportFilters: {
            persistent: PRODUCT_INSIGHTS_PERSISTENT_FILTERS,
            optional: PRODUCT_INSIGHTS_OPTIONAL_FILTERS,
        },
    }
