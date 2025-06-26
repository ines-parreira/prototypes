import _isNil from 'lodash/isNil'

import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { useSentimentPerProduct } from 'hooks/reporting/voice-of-customer/useSentimentPerProduct'
import { Sentiment } from 'models/stat/types'
import TrendBadge from 'pages/stats/common/components/TrendBadge'
import { DrillDownModalTrigger } from 'pages/stats/common/drill-down/DrillDownModalTrigger'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import { CellWrapper } from 'pages/stats/voice-of-customer/components/ProductInsightsTable/CellWrapper'
import { ProductFeedbackCell } from 'pages/stats/voice-of-customer/components/ProductInsightsTable/ProductFeedbackCell'
import {
    getDrillDownMetricData,
    getUseSentimentTrendQuery,
    Product,
    ProductInsightsColumnConfig,
} from 'pages/stats/voice-of-customer/components/ProductInsightsTable/ProductInsightsTableConfig'
import { ProductNameCell } from 'pages/stats/voice-of-customer/components/ProductInsightsTable/ProductNameCell'
import { ReturnMentionsMetricCell } from 'pages/stats/voice-of-customer/components/ProductInsightsTable/ReturnMentionsMetricCell'
import { TicketsVolumeMetricCell } from 'pages/stats/voice-of-customer/components/ProductInsightsTable/TicketsVolumeMetricCell'
import { PropsWithProduct } from 'pages/stats/voice-of-customer/components/ProductInsightsTable/types'
import { ProductInsightsTableColumns } from 'state/ui/stats/types'

export type ProductSentimentTableCellProps = PropsWithProduct & {
    sentimentCustomFieldId: number
}

const createTrendCell = (
    column:
        | ProductInsightsTableColumns.NegativeSentimentDelta
        | ProductInsightsTableColumns.PositiveSentimentDelta,
) => {
    const useTrendQuery = getUseSentimentTrendQuery(column)

    const TrendCell = ({
        product,
        sentimentCustomFieldId,
    }: ProductSentimentTableCellProps) => {
        const statsFilters = useStatsFilters()

        const { data, isFetching } = useTrendQuery(
            statsFilters.cleanStatsFilters,
            statsFilters.userTimezone,
            sentimentCustomFieldId,
            product.id,
        )

        return (
            <CellWrapper column={column} isLoading={isFetching}>
                <TrendBadge
                    value={data?.value}
                    prevValue={data?.prevValue}
                    interpretAs="more-is-better"
                    size="md"
                />
            </CellWrapper>
        )
    }

    TrendCell.displayName = `TrendCell<${column}>`

    return TrendCell
}

const createSentimentMetricCell = (
    column:
        | ProductInsightsTableColumns.NegativeSentiment
        | ProductInsightsTableColumns.PositiveSentiment,
) => {
    const { format } = ProductInsightsColumnConfig[column]
    const sentiment =
        column === ProductInsightsTableColumns.PositiveSentiment
            ? Sentiment.Positive
            : Sentiment.Negative

    const MetricCell = ({
        product,
        sentimentCustomFieldId,
    }: ProductSentimentTableCellProps) => {
        const statsFilters = useStatsFilters()
        const { data, isFetching } = useSentimentPerProduct(
            statsFilters.cleanStatsFilters,
            statsFilters.userTimezone,
            sentimentCustomFieldId,
            sentiment,
            product.id,
        )

        const content = formatMetricValue(
            data.value,
            format,
            NOT_AVAILABLE_PLACEHOLDER,
        )

        const metricData = getDrillDownMetricData(
            column,
            product,
            sentimentCustomFieldId,
        )

        const isDrillDownEnabled = !_isNil(data.value)

        return (
            <CellWrapper column={column} isLoading={isFetching}>
                <DrillDownModalTrigger
                    metricData={metricData}
                    enabled={isDrillDownEnabled}
                    highlighted
                >
                    {content}
                </DrillDownModalTrigger>
            </CellWrapper>
        )
    }

    MetricCell.displayName = `MetricCell<${column}>`

    return MetricCell
}

const componentMap = {
    [ProductInsightsTableColumns.Product]: ProductNameCell,
    [ProductInsightsTableColumns.Feedback]: ProductFeedbackCell,
    [ProductInsightsTableColumns.NegativeSentiment]: createSentimentMetricCell(
        ProductInsightsTableColumns.NegativeSentiment,
    ),
    [ProductInsightsTableColumns.PositiveSentiment]: createSentimentMetricCell(
        ProductInsightsTableColumns.PositiveSentiment,
    ),
    [ProductInsightsTableColumns.ReturnMentions]: ReturnMentionsMetricCell,
    [ProductInsightsTableColumns.TicketsVolume]: TicketsVolumeMetricCell,
    [ProductInsightsTableColumns.NegativeSentimentDelta]: createTrendCell(
        ProductInsightsTableColumns.NegativeSentimentDelta,
    ),
    [ProductInsightsTableColumns.PositiveSentimentDelta]: createTrendCell(
        ProductInsightsTableColumns.PositiveSentimentDelta,
    ),
}

export const ProductInsightsCellContent = ({
    column,
    product,
    intentCustomFieldId,
    sentimentCustomFieldId,
}: {
    column: ProductInsightsTableColumns
    product: Product
    sentimentCustomFieldId: number
    intentCustomFieldId: number
}) => {
    const Component = componentMap[column]
    return (
        <Component
            product={product}
            sentimentCustomFieldId={sentimentCustomFieldId}
            intentCustomFieldId={intentCustomFieldId}
        />
    )
}
