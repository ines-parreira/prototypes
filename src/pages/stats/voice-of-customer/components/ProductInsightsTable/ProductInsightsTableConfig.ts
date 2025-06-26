import {
    useReturnMentionsPerProductWithEnrichment,
    useTicketCountPerProductWithEnrichment,
} from 'hooks/reporting/voice-of-customer/metricsPerProduct'
import {
    useNegativeSentimentPerProduct,
    useNegativeSentimentsPerProductMetricTrend,
    usePositiveSentimentPerProduct,
    usePositiveSentimentsPerProductMetricTrend,
} from 'hooks/reporting/voice-of-customer/useSentimentPerProduct'
import { returnMentionsPerProductDrillDownQueryFactory } from 'models/reporting/queryFactories/voice-of-customer/returnMentionsPerProduct'
import { sentimentsTicketCountPerProductDrillDownQueryFactory } from 'models/reporting/queryFactories/voice-of-customer/sentimentPerProduct'
import { ticketCountForProductDrillDownQueryFactory } from 'models/reporting/queryFactories/voice-of-customer/ticketsWithProducts'
import { Sentiment } from 'models/stat/types'
import { isMediumOrSmallScreen } from 'pages/common/utils/mobile'
import { Domain } from 'pages/stats/common/drill-down/types'
import { MOBILE_METRIC_COLUMN_WIDTH } from 'pages/stats/support-performance/agents/AgentsTableConfig'
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
} from 'pages/stats/voice-of-customer/constants'
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
            title: 'Number of tickets where AI detected frustrated or negative customer tone.',
        },
        sortingHook: useNegativeSentimentPerProduct,
        drillDownQuery: sentimentsTicketCountPerProductDrillDownQueryFactory,
        domain: Domain.Ticket,
        showMetric: false,
    },
    [ProductInsightsTableColumns.PositiveSentiment]: {
        format: 'integer',
        hint: {
            title: 'AI classified positive sentiment including Positive and Promoter categorizations.',
        },
        sortingHook: usePositiveSentimentPerProduct,
        drillDownQuery: sentimentsTicketCountPerProductDrillDownQueryFactory,
        domain: Domain.Ticket,
        showMetric: false,
    },
    [ProductInsightsTableColumns.TicketsVolume]: {
        format: 'integer',
        hint: {
            title: 'Number of tickets in relation to product.',
        },
        sortingHook: useTicketCountPerProductWithEnrichment,
        drillDownQuery: ticketCountForProductDrillDownQueryFactory,
        domain: Domain.Ticket,
        showMetric: false,
    },
    [ProductInsightsTableColumns.ReturnMentions]: {
        format: 'integer',
        hint: {
            title: 'Tickets where the customer expresses intent to return a product.',
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
            title: 'Name of the product, as labeled in Shopify.',
        },
        sortingHook: useTicketCountPerProductWithEnrichment,
    },
    [ProductInsightsTableColumns.Feedback]: {
        format: 'integer',
        hint: {
            title: 'Main feedback about this product from across customer conversations, summarized by AI.',
        },
        sortingHook: useTicketCountPerProductWithEnrichment,
    },
    [ProductInsightsTableColumns.NegativeSentimentDelta]: {
        format: 'percent',
        hint: {
            title: 'Change in negative sentiment tickets compared to previous period.',
        },
        sortingHook: useNegativeSentimentPerProduct,
    },
    [ProductInsightsTableColumns.PositiveSentimentDelta]: {
        format: 'percent',
        hint: {
            title: 'Change in positive sentiment tickets compared to previous period.',
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
const METRIC_COLUMN_WIDTH = 140

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

export const getTooltipPosition = (column: ProductInsightsTableColumns) => {
    const isRightAlignedColumn =
        column === ProductInsightsTableColumns.Product ||
        column === ProductInsightsTableColumns.Feedback

    return isRightAlignedColumn ? 'right' : 'left'
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
