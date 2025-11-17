import _isNil from 'lodash/isNil'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useSentimentPerProduct } from 'domains/reporting/hooks/voice-of-customer/useSentimentPerProduct'
import { Sentiment } from 'domains/reporting/models/stat/types'
import TrendBadge from 'domains/reporting/pages/common/components/TrendBadge'
import { DrillDownModalTrigger } from 'domains/reporting/pages/common/drill-down/DrillDownModalTrigger'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'domains/reporting/pages/common/utils'
import { CellWrapper } from 'domains/reporting/pages/voice-of-customer/components/ProductInsightsTable/CellWrapper'
import { ProductFeedbackCell } from 'domains/reporting/pages/voice-of-customer/components/ProductInsightsTable/ProductFeedbackCell'
import type { Product } from 'domains/reporting/pages/voice-of-customer/components/ProductInsightsTable/ProductInsightsTableConfig'
import {
    getDrillDownMetricData,
    getUseSentimentTrendQuery,
    ProductInsightsColumnConfig,
} from 'domains/reporting/pages/voice-of-customer/components/ProductInsightsTable/ProductInsightsTableConfig'
import { ProductNameCell } from 'domains/reporting/pages/voice-of-customer/components/ProductInsightsTable/ProductNameCell'
import { ReturnMentionsMetricCell } from 'domains/reporting/pages/voice-of-customer/components/ProductInsightsTable/ReturnMentionsMetricCell'
import { TicketsVolumeMetricCell } from 'domains/reporting/pages/voice-of-customer/components/ProductInsightsTable/TicketsVolumeMetricCell'
import type { PropsWithProduct } from 'domains/reporting/pages/voice-of-customer/components/ProductInsightsTable/types'
import { ProductInsightsTableColumns } from 'domains/reporting/state/ui/stats/types'

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
