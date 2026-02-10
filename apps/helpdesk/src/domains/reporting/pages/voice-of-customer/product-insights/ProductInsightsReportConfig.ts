import type { StaticFilter } from 'domains/reporting/models/stat/types'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { AUTO_QA_FILTER_KEYS } from 'domains/reporting/pages/common/filters/constants'
import { ReportsIDs } from 'domains/reporting/pages/dashboards/constants'
import type { ReportConfig } from 'domains/reporting/pages/dashboards/types'
import { ChartType } from 'domains/reporting/pages/dashboards/types'
import { SECTION_TITLES } from 'domains/reporting/pages/support-performance/agents/constants'
import { ChangeInTicketVolumeChart } from 'domains/reporting/pages/voice-of-customer/charts/ChangeInTicketVolumeChart/ChangeInTicketVolumeChart'
import { ProductInsightsTableChart } from 'domains/reporting/pages/voice-of-customer/charts/ProductInsightsTableChart/ProductInsightsTableChart'
import { TopAIIntentsOverTimeChart } from 'domains/reporting/pages/voice-of-customer/charts/TopAIIntentsOverTimeChart/TopAIIntentsOverTimeChart'
import { TopProductsPerAIIntentChart } from 'domains/reporting/pages/voice-of-customer/charts/TopProductsPerAIIntentChart/TopProductsPerAIIntentChart'
import { TotalTicketSentimentOverTimeChart } from 'domains/reporting/pages/voice-of-customer/charts/TotalTicketSentimentOverTimeChart/TotalTicketSentimentOverTimeChart'
import {
    TICKET_VOLUME_CHART_LABEL,
    TICKET_VOLUME_CHART_TOOLTIP,
} from 'domains/reporting/pages/voice-of-customer/constants'
import {
    ProductInsightsChart,
    ProductInsightsChartConfig,
} from 'domains/reporting/pages/voice-of-customer/product-insights/ProductInsightsChartConfig'
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
    FilterKey.AssignedTeam,
    FilterKey.CustomFields,
    FilterKey.Score,
    FilterKey.Stores,
    ...AUTO_QA_FILTER_KEYS,
]

export const ProductInsightsPlaceholderReportConfig: ReportConfig<ProductInsightsChart> =
    {
        id: ReportsIDs.ProductInsightsReportConfig,
        reportName: SECTION_TITLES.AGENT_PERFORMANCE,
        reportPath: VOICE_OF_CUSTOMER_ROUTES.PRODUCT_INSIGHTS,
        charts: {
            [ProductInsightsChart.TotalTicketSentimentOverTimeChart]: {
                chartComponent: TotalTicketSentimentOverTimeChart,
                label: ProductInsightsChartConfig[
                    ProductInsightsChart.TotalTicketSentimentOverTimeChart
                ].title,
                description:
                    ProductInsightsChartConfig[
                        ProductInsightsChart.TotalTicketSentimentOverTimeChart
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
            [ProductInsightsChart.TopProductsPerAIIntentChart]: {
                chartComponent: TopProductsPerAIIntentChart,
                label: ProductInsightsChartConfig[
                    ProductInsightsChart.TopProductsPerAIIntentChart
                ].title,
                description:
                    ProductInsightsChartConfig[
                        ProductInsightsChart.TopProductsPerAIIntentChart
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
