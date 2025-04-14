import { FilterKey, StaticFilter } from 'models/stat/types'
import { AUTO_QA_FILTER_KEYS } from 'pages/stats/common/filters/constants'
import { ReportsIDs } from 'pages/stats/dashboards/constants'
import { ChartType, ReportConfig } from 'pages/stats/dashboards/types'
import { AGENT_PERFORMANCE_SECTION_TITLE } from 'pages/stats/support-performance/agents/AgentsTableChart'
import { TICKET_VOLUME_CHART_LABEL } from 'pages/stats/voice-of-customer/product-insights/constants'
import { ProductInsightsTableChart } from 'pages/stats/voice-of-customer/product-insights/placeholder/ProductInsightsTableChart'
import { TicketVolumeChart } from 'pages/stats/voice-of-customer/product-insights/placeholder/TicketVolumeChart'
import {
    CHART_TITLE,
    TotalProductSentimentOverTimeChartPlaceholder,
} from 'pages/stats/voice-of-customer/product-insights/placeholder/TotalProductSentimentOverTimeChartPlaceholder'
import { VOICE_OF_CUSTOMER_ROUTES } from 'routes/constants'

export enum ProductInsightsChart {
    TotalProductSentimentOverTimeChartPlaceholder = 'total_product_sentiment_over_time_chart_placeholder',
    ProductInsightsTableChartPlaceholder = 'product_insights_table_chart_placeholder',
    TicketVolumeChart = 'ticket_volume_chart',
}

export const PRODUCT_INSIGHTS_PERSISTENT_FILTERS: StaticFilter[] = [
    FilterKey.Period,
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
            [ProductInsightsChart.TotalProductSentimentOverTimeChartPlaceholder]:
                {
                    chartComponent:
                        TotalProductSentimentOverTimeChartPlaceholder,
                    label: CHART_TITLE,
                    description: 'Total product sentiment over time',
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
            [ProductInsightsChart.ProductInsightsTableChartPlaceholder]: {
                chartComponent: ProductInsightsTableChart,
                label: TICKET_VOLUME_CHART_LABEL,
                description: TICKET_VOLUME_CHART_LABEL,
                csvProducer: null,
                chartType: ChartType.Table,
            },
        },
        reportFilters: {
            persistent: PRODUCT_INSIGHTS_PERSISTENT_FILTERS,
            optional: PRODUCT_INSIGHTS_OPTIONAL_FILTERS,
        },
    }
