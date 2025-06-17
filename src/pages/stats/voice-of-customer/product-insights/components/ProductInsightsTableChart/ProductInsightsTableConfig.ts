import {
    useReturnMentionsPerProductWithEnrichment,
    useTicketCountPerProductWithEnrichment,
} from 'hooks/reporting/voice-of-customer/metricsPerProduct'
import {
    Sentiment,
    useNegativeSentimentPerProduct,
    useNegativeSentimentsPerProductMetricTrend,
    usePositiveSentimentPerProduct,
    usePositiveSentimentsPerProductMetricTrend,
} from 'hooks/reporting/voice-of-customer/useSentimentPerProduct'
import { returnMentionsPerProductDrillDownQueryFactory } from 'models/reporting/queryFactories/voice-of-customer/returnMentionsPerProduct'
import { sentimentsTicketCountPerProductDrillDownQueryFactory } from 'models/reporting/queryFactories/voice-of-customer/sentimentPerProduct'
import { ticketCountForProductDrillDownQueryFactory } from 'models/reporting/queryFactories/voice-of-customer/ticketsWithProducts'
import { isMediumOrSmallScreen } from 'pages/common/utils/mobile'
import { Domain } from 'pages/stats/common/drill-down/types'
import {
    METRIC_COLUMN_WIDTH,
    MOBILE_METRIC_COLUMN_WIDTH,
} from 'pages/stats/support-performance/agents/AgentsTableConfig'
import { MOBILE_CHANNEL_COLUMN_WIDTH } from 'pages/stats/support-performance/channels/ChannelsTableConfig'
import {
    FEEDBACK_COLUMN_LABEL,
    NEGATIVE_SENTIMENT_COLUMN_LABEL,
    NEGATIVE_SENTIMENT_DELTA_COLUMN_LABEL,
    POSITIVE_SENTIMENT_COLUMN_LABEL,
    POSITIVE_SENTIMENT_DELTA_COLUMN_LABEL,
    PRODUCT_COLUMN_LABEL,
    RETURN_MENTIONS_COLUMN_LABEL,
    TICKETS_VOLUME_COLUMN_LABEL,
} from 'pages/stats/voice-of-customer/product-insights/constants'
import {
    ProductInsightsTableColumns,
    ProductInsightsTableViewIdentifier,
    TableSetting,
} from 'state/ui/stats/types'

export type Product = {
    id: string
    name: string
    thumbnail_url?: string
}

export const LeadColumn = ProductInsightsTableColumns.Product
export const columnsOrder: ProductInsightsTableColumns[] = [
    ProductInsightsTableColumns.Product,
    ProductInsightsTableColumns.Feedback,
    ProductInsightsTableColumns.NegativeSentiment,
    ProductInsightsTableColumns.NegativeSentimentDelta,
    ProductInsightsTableColumns.PositiveSentiment,
    ProductInsightsTableColumns.PositiveSentimentDelta,
    ProductInsightsTableColumns.ReturnMentions,
    ProductInsightsTableColumns.TicketsVolume,
]

export const ProductInsightsTableLabels: Record<
    ProductInsightsTableColumns,
    string
> = {
    [ProductInsightsTableColumns.Product]: PRODUCT_COLUMN_LABEL,
    [ProductInsightsTableColumns.Feedback]: FEEDBACK_COLUMN_LABEL,
    [ProductInsightsTableColumns.NegativeSentiment]:
        NEGATIVE_SENTIMENT_COLUMN_LABEL,
    [ProductInsightsTableColumns.NegativeSentimentDelta]:
        NEGATIVE_SENTIMENT_DELTA_COLUMN_LABEL,
    [ProductInsightsTableColumns.PositiveSentiment]:
        POSITIVE_SENTIMENT_COLUMN_LABEL,
    [ProductInsightsTableColumns.PositiveSentimentDelta]:
        POSITIVE_SENTIMENT_DELTA_COLUMN_LABEL,
    [ProductInsightsTableColumns.ReturnMentions]: RETURN_MENTIONS_COLUMN_LABEL,
    [ProductInsightsTableColumns.TicketsVolume]: TICKETS_VOLUME_COLUMN_LABEL,
}

const trendQueries = {
    [ProductInsightsTableColumns.NegativeSentimentDelta]:
        useNegativeSentimentsPerProductMetricTrend,
    [ProductInsightsTableColumns.PositiveSentimentDelta]:
        usePositiveSentimentsPerProductMetricTrend,
}

export const getUseSentimentTrendQuery = (
    column:
        | ProductInsightsTableColumns.NegativeSentimentDelta
        | ProductInsightsTableColumns.PositiveSentimentDelta,
) => {
    return trendQueries[column]
}

export const ProductInsightsColumnWithDrillDownConfig = {
    [ProductInsightsTableColumns.NegativeSentiment]: {
        format: 'integer',
        hint: {
            title: ProductInsightsTableLabels[
                ProductInsightsTableColumns.NegativeSentiment
            ],
        },
        sortingHook: useNegativeSentimentPerProduct,
        drillDownQuery: sentimentsTicketCountPerProductDrillDownQueryFactory,
        domain: Domain.Ticket,
        showMetric: false,
    },
    [ProductInsightsTableColumns.PositiveSentiment]: {
        format: 'integer',
        hint: {
            title: ProductInsightsTableLabels[
                ProductInsightsTableColumns.PositiveSentiment
            ],
        },
        sortingHook: usePositiveSentimentPerProduct,
        drillDownQuery: sentimentsTicketCountPerProductDrillDownQueryFactory,
        domain: Domain.Ticket,
        showMetric: false,
    },
    [ProductInsightsTableColumns.TicketsVolume]: {
        format: 'integer',
        hint: {
            title: ProductInsightsTableLabels[
                ProductInsightsTableColumns.TicketsVolume
            ],
        },
        sortingHook: useTicketCountPerProductWithEnrichment,
        drillDownQuery: ticketCountForProductDrillDownQueryFactory,
        domain: Domain.Ticket,
        showMetric: false,
    },
    [ProductInsightsTableColumns.ReturnMentions]: {
        format: 'integer',
        hint: {
            title: ProductInsightsTableLabels[
                ProductInsightsTableColumns.ReturnMentions
            ],
        },
        sortingHook: useReturnMentionsPerProductWithEnrichment,
        drillDownQuery: returnMentionsPerProductDrillDownQueryFactory,
        domain: Domain.Ticket,
        showMetric: false,
    },
} as const

export const ProductInsightsColumnWithoutDrillDownConfig = {
    [ProductInsightsTableColumns.Product]: {
        format: 'integer',
        hint: {
            title: ProductInsightsTableLabels[
                ProductInsightsTableColumns.Product
            ],
        },
        sortingHook: useTicketCountPerProductWithEnrichment,
    },
    [ProductInsightsTableColumns.Feedback]: {
        format: 'integer',
        hint: {
            title: ProductInsightsTableLabels[
                ProductInsightsTableColumns.Feedback
            ],
        },
        sortingHook: useTicketCountPerProductWithEnrichment,
    },
    [ProductInsightsTableColumns.NegativeSentimentDelta]: {
        format: 'percent',
        hint: {
            title: ProductInsightsTableLabels[
                ProductInsightsTableColumns.NegativeSentimentDelta
            ],
        },
        sortingHook: useNegativeSentimentPerProduct,
    },
    [ProductInsightsTableColumns.PositiveSentimentDelta]: {
        format: 'percent',
        hint: {
            title: ProductInsightsTableLabels[
                ProductInsightsTableColumns.PositiveSentimentDelta
            ],
        },
        sortingHook: usePositiveSentimentPerProduct,
    },
} as const

export const ProductInsightsColumnConfig = Object.freeze({
    ...ProductInsightsColumnWithoutDrillDownConfig,
    ...ProductInsightsColumnWithDrillDownConfig,
})

export const productInsightsMetrics = columnsOrder.map((column) => ({
    id: column,
    visibility: true,
}))

export const ProductInsightsTableViews: TableSetting<ProductInsightsTableColumns> =
    {
        active_view: ProductInsightsTableViewIdentifier.ProductInsights,
        views: [],
    }

export const productInsightsTableActiveView = {
    id: ProductInsightsTableViewIdentifier.ProductInsights,
    name: 'Product centric insights',
    metrics: productInsightsMetrics,
}

const PRODUCT_COLUMN_WIDTH = 380

export const getColumnWidth = (column: ProductInsightsTableColumns) => {
    const isWideColumn =
        column === ProductInsightsTableColumns.Product ||
        column === ProductInsightsTableColumns.Feedback

    if (isMediumOrSmallScreen()) {
        return isWideColumn
            ? MOBILE_CHANNEL_COLUMN_WIDTH
            : MOBILE_METRIC_COLUMN_WIDTH
    }

    return isWideColumn ? PRODUCT_COLUMN_WIDTH : METRIC_COLUMN_WIDTH
}

export const getColumnAlignment = (column: ProductInsightsTableColumns) => {
    const isLeftAlignedColumn =
        column === ProductInsightsTableColumns.Product ||
        column === ProductInsightsTableColumns.Feedback

    return isLeftAlignedColumn ? 'left' : 'right'
}

export const getIsLeadColumn = (column: ProductInsightsTableColumns) => {
    return column === LeadColumn
}

const getDrillDownTitle = (
    column:
        | ProductInsightsTableColumns.PositiveSentiment
        | ProductInsightsTableColumns.NegativeSentiment,
    product: Product,
) => {
    let title = [product.name]

    title.push('|')
    title.push(ProductInsightsTableLabels[column])

    return title.join(' ')
}

export const getDrillDownMetricData = (
    column:
        | ProductInsightsTableColumns.PositiveSentiment
        | ProductInsightsTableColumns.NegativeSentiment,
    product: Product,
    sentimentCustomFieldId: number,
) => {
    const sentiment =
        column === ProductInsightsTableColumns.PositiveSentiment
            ? Sentiment.Positive
            : Sentiment.Negative

    return {
        title: getDrillDownTitle(column, product),
        metricName: column,
        productId: product.id,
        sentimentCustomFieldId,
        sentiment,
    }
}
