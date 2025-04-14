import moment from 'moment'

import { MetricPerProductAndIntentQueryHook } from 'hooks/reporting/voice-of-customer/metricsPerProductAndIntent'
import { OrderDirection } from 'models/api/types'
import { StatsFilters } from 'models/stat/types'
import { isMediumOrSmallScreen } from 'pages/common/utils/mobile'
import { MetricValueFormat, SHORT_FORMAT } from 'pages/stats/common/utils'
import {
    METRIC_COLUMN_WIDTH,
    MOBILE_METRIC_COLUMN_WIDTH,
} from 'pages/stats/support-performance/agents/AgentsTableConfig'
import { MOBILE_CHANNEL_COLUMN_WIDTH } from 'pages/stats/support-performance/channels/ChannelsTableConfig'
import { TooltipData } from 'pages/stats/types'
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

const usePlaceholderData: MetricPerProductAndIntentQueryHook = (
    statsFilters: StatsFilters,
    timezone: string,
    product: string,
    intent: string,
    sorting?: OrderDirection,
) => ({
    data: {
        value: 123,
        decile: 4,
        allData: [
            {
                dateDimension: moment
                    .parseZone(statsFilters.period.start_datetime)
                    .utcOffset(timezone)
                    .format(SHORT_FORMAT),
                productDimension: product,
                intentDimension: intent,
                value: '123',
            },
        ].sort((a, b) =>
            sorting === OrderDirection.Asc
                ? Number(a.value) - Number(b.value)
                : Number(b.value) - Number(a.value),
        ),
    },
    isFetching: false,
    isError: false,
})

export const ProductInsightsColumnConfig: Record<
    ProductInsightsTableColumns,
    {
        format: MetricValueFormat
        hint: TooltipData | null
        useMetric: MetricPerProductAndIntentQueryHook
    }
> = {
    [ProductInsightsTableColumns.Product]: {
        format: 'integer',
        hint: {
            title: ProductInsightsTableLabels[
                ProductInsightsTableColumns.Product
            ],
        },
        useMetric: usePlaceholderData,
    },
    [ProductInsightsTableColumns.Feedback]: {
        format: 'integer',
        hint: {
            title: ProductInsightsTableLabels[
                ProductInsightsTableColumns.Feedback
            ],
        },
        useMetric: usePlaceholderData,
    },
    [ProductInsightsTableColumns.NegativeSentiment]: {
        format: 'integer',
        hint: {
            title: ProductInsightsTableLabels[
                ProductInsightsTableColumns.NegativeSentiment
            ],
        },
        useMetric: usePlaceholderData,
    },
    [ProductInsightsTableColumns.NegativeSentimentDelta]: {
        format: 'percent',
        hint: {
            title: ProductInsightsTableLabels[
                ProductInsightsTableColumns.NegativeSentimentDelta
            ],
        },
        useMetric: usePlaceholderData,
    },
    [ProductInsightsTableColumns.PositiveSentiment]: {
        format: 'integer',
        hint: {
            title: ProductInsightsTableLabels[
                ProductInsightsTableColumns.PositiveSentiment
            ],
        },
        useMetric: usePlaceholderData,
    },
    [ProductInsightsTableColumns.PositiveSentimentDelta]: {
        format: 'percent',
        hint: {
            title: ProductInsightsTableLabels[
                ProductInsightsTableColumns.PositiveSentimentDelta
            ],
        },
        useMetric: usePlaceholderData,
    },
    [ProductInsightsTableColumns.ReturnMentions]: {
        format: 'integer',
        hint: {
            title: ProductInsightsTableLabels[
                ProductInsightsTableColumns.ReturnMentions
            ],
        },
        useMetric: usePlaceholderData,
    },
    [ProductInsightsTableColumns.TicketsVolume]: {
        format: 'integer',
        hint: {
            title: ProductInsightsTableLabels[
                ProductInsightsTableColumns.TicketsVolume
            ],
        },
        useMetric: usePlaceholderData,
    },
}

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

const PRODUCT_COLUMN_WIDTH = 240

export const getColumnWidth = (column: ProductInsightsTableColumns) => {
    if (isMediumOrSmallScreen()) {
        return column === LeadColumn
            ? MOBILE_CHANNEL_COLUMN_WIDTH
            : MOBILE_METRIC_COLUMN_WIDTH
    }
    return column === LeadColumn ? PRODUCT_COLUMN_WIDTH : METRIC_COLUMN_WIDTH
}
