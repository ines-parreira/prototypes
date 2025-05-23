import { OrderDirection } from 'models/api/types'
import { StatsFilters } from 'models/stat/types'
import { isMediumOrSmallScreen } from 'pages/common/utils/mobile'
import {
    Domain,
    DrillDownQueryFactory,
} from 'pages/stats/common/drill-down/types'
import { MetricValueFormat } from 'pages/stats/common/utils'
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
import { ProductMetricColumn } from 'state/ui/stats/drillDownSlice'
import {
    ProductInsightsTableColumns,
    ProductInsightsTableViewIdentifier,
    TableSetting,
} from 'state/ui/stats/types'

export type Product = {
    id: string
    name: string
    thumbnailUrl?: string
    intent: string
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

type PlaceholderDataHook<TData> = (
    _statsFilters: StatsFilters,
    _timezone: string,
    _product: string,
    _intent: string,
    _sorting?: OrderDirection,
) => {
    data: TData
    isFetching: boolean
    isError: boolean
}

const usePlaceholderData: PlaceholderDataHook<{
    value: number
    decile: number
}> = () => ({
    data: {
        value: 123,
        decile: 4,
    },
    isFetching: false,
    isError: false,
})

const usePlaceholderTrendData: PlaceholderDataHook<{
    value: number
    prevValue: number
}> = () => ({
    data: {
        value: 321,
        prevValue: 123,
    },
    isFetching: false,
    isError: false,
})

const metricQueries = {
    [ProductInsightsTableColumns.NegativeSentiment]: usePlaceholderData,
    [ProductInsightsTableColumns.PositiveSentiment]: usePlaceholderData,
    [ProductInsightsTableColumns.ReturnMentions]: usePlaceholderData,
    [ProductInsightsTableColumns.TicketsVolume]: usePlaceholderData,
}

const trendQueries = {
    [ProductInsightsTableColumns.NegativeSentimentDelta]:
        usePlaceholderTrendData,
    [ProductInsightsTableColumns.PositiveSentimentDelta]:
        usePlaceholderTrendData,
}

export const getUseMetricQuery = (column: keyof typeof metricQueries) => {
    return metricQueries[column]
}

export const getUseTrendQuery = (column: keyof typeof trendQueries) => {
    return trendQueries[column]
}

const placeholderDrillDownQueryFactory: DrillDownQueryFactory = () => {
    return { measures: [], dimensions: [], filters: [] }
}

export const ProductInsightsColumnWithDrillDownConfig: Record<
    ProductMetricColumn,
    {
        format: MetricValueFormat
        hint: { title: string }
        drillDownQuery: DrillDownQueryFactory
        domain: Domain
        showMetric: boolean
    }
> = {
    [ProductInsightsTableColumns.NegativeSentiment]: {
        format: 'integer',
        hint: {
            title: ProductInsightsTableLabels[
                ProductInsightsTableColumns.NegativeSentiment
            ],
        },
        drillDownQuery: placeholderDrillDownQueryFactory,
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
        drillDownQuery: placeholderDrillDownQueryFactory,
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
        drillDownQuery: placeholderDrillDownQueryFactory,
        domain: Domain.Ticket,
        showMetric: false,
    },
}

export const ProductInsightsColumnWithoutDrillDownConfig = {
    [ProductInsightsTableColumns.Product]: {
        format: 'integer',
        hint: {
            title: ProductInsightsTableLabels[
                ProductInsightsTableColumns.Product
            ],
        },
    },
    [ProductInsightsTableColumns.Feedback]: {
        format: 'integer',
        hint: {
            title: ProductInsightsTableLabels[
                ProductInsightsTableColumns.Feedback
            ],
        },
    },
    [ProductInsightsTableColumns.NegativeSentimentDelta]: {
        format: 'percent',
        hint: {
            title: ProductInsightsTableLabels[
                ProductInsightsTableColumns.NegativeSentimentDelta
            ],
        },
    },
    [ProductInsightsTableColumns.PositiveSentimentDelta]: {
        format: 'percent',
        hint: {
            title: ProductInsightsTableLabels[
                ProductInsightsTableColumns.PositiveSentimentDelta
            ],
        },
    },
    [ProductInsightsTableColumns.ReturnMentions]: {
        format: 'integer',
        hint: {
            title: ProductInsightsTableLabels[
                ProductInsightsTableColumns.ReturnMentions
            ],
        },
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

const supportsDrillDown = (
    column: ProductInsightsTableColumns,
): column is ProductMetricColumn => {
    return [
        ProductInsightsTableColumns.NegativeSentiment,
        ProductInsightsTableColumns.PositiveSentiment,
        ProductInsightsTableColumns.TicketsVolume,
    ].includes(column)
}

const getDrillDownTitle = (
    column: ProductInsightsTableColumns,
    product: Product,
) => {
    let title = [product.name]

    if (
        [
            ProductInsightsTableColumns.NegativeSentiment,
            ProductInsightsTableColumns.PositiveSentiment,
        ].includes(column)
    ) {
        title.push('|')
        title.push(ProductInsightsTableLabels[column])
    }

    return title.join(' ')
}

export const getDrillDownMetricData = (
    column: ProductInsightsTableColumns,
    product: Product,
) => {
    if (supportsDrillDown(column)) {
        return {
            title: getDrillDownTitle(column, product),
            metricName: column,
            productId: product.id,
        }
    }

    return null
}
