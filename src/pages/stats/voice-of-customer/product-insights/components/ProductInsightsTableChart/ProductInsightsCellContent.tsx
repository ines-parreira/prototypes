import { ReactNode, useState } from 'react'

import fallbackImage from 'assets/img/stats/no-product.png'
import { SegmentEvent } from 'common/segment'
import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { OrderDirection } from 'models/api/types'
import TrendBadge from 'pages/stats/common/components/TrendBadge'
import { DrillDownModalTrigger } from 'pages/stats/common/drill-down/DrillDownModalTrigger'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import css from 'pages/stats/voice-of-customer/product-insights/components/ProductInsightsTableChart/ProductInsightsCellContent.less'
import {
    getColumnAlignment,
    getColumnWidth,
    getDrillDownMetricData,
    getIsLeadColumn,
    getUseMetricQuery,
    getUseTrendQuery,
    Product,
    ProductInsightsColumnConfig,
} from 'pages/stats/voice-of-customer/product-insights/components/ProductInsightsTableChart/ProductInsightsTableConfig'
import { ProductTableBodyCell } from 'pages/stats/voice-of-customer/product-insights/components/ProductInsightsTableChart/ProductTable'
import { VoCSidePanelTrigger } from 'pages/stats/voice-of-customer/side-panel/VoCSidePanelTrigger'
import { ProductInsightsTableColumns } from 'state/ui/stats/types'

const CellWrapper = ({
    children,
    isLoading,
    column,
}: {
    column: ProductInsightsTableColumns
    children: ReactNode
    isLoading?: boolean
}) => (
    <ProductTableBodyCell
        isLoading={isLoading}
        width={getColumnWidth(column)}
        isSticky={getIsLeadColumn(column)}
        justifyContent={getColumnAlignment(column)}
    >
        {children}
    </ProductTableBodyCell>
)

type ProductTableCellProps = { product: Product }

const createTrendCell = (
    column:
        | ProductInsightsTableColumns.NegativeSentimentDelta
        | ProductInsightsTableColumns.PositiveSentimentDelta,
) => {
    const useTrendQuery = getUseTrendQuery(column)

    const TrendCell = ({ product }: ProductTableCellProps) => {
        const statsFilters = useStatsFilters()

        const { data, isFetching } = useTrendQuery(
            statsFilters.cleanStatsFilters,
            statsFilters.userTimezone,
            product.id,
            product.intent,
            OrderDirection.Desc,
        )

        return (
            <CellWrapper column={column} isLoading={isFetching}>
                <TrendBadge
                    value={data.value}
                    prevValue={data.prevValue}
                    interpretAs="more-is-better"
                    size="md"
                />
            </CellWrapper>
        )
    }

    TrendCell.displayName = `TrendCell<${column}>`

    return TrendCell
}

const WithDrillDownTrigger = ({
    children,
    metricData,
}: {
    children: React.ReactNode
    metricData: ReturnType<typeof getDrillDownMetricData>
}) => {
    if (metricData) {
        return (
            <DrillDownModalTrigger highlighted metricData={metricData}>
                {children}
            </DrillDownModalTrigger>
        )
    }

    return <>{children}</>
}

const createMetricCell = (
    column:
        | ProductInsightsTableColumns.NegativeSentiment
        | ProductInsightsTableColumns.PositiveSentiment
        | ProductInsightsTableColumns.ReturnMentions
        | ProductInsightsTableColumns.TicketsVolume,
) => {
    const { format } = ProductInsightsColumnConfig[column]
    const useMetricQuery = getUseMetricQuery(column)

    const MetricCell = ({ product }: ProductTableCellProps) => {
        const statsFilters = useStatsFilters()

        const { data, isFetching } = useMetricQuery(
            statsFilters.cleanStatsFilters,
            statsFilters.userTimezone,
            product.id,
            product.intent,
            OrderDirection.Desc,
        )

        const content = formatMetricValue(
            data.value,
            format,
            NOT_AVAILABLE_PLACEHOLDER,
        )

        const metricData = getDrillDownMetricData(column, product)

        return (
            <CellWrapper column={column} isLoading={isFetching}>
                <WithDrillDownTrigger metricData={metricData}>
                    {content}
                </WithDrillDownTrigger>
            </CellWrapper>
        )
    }

    MetricCell.displayName = `MetricCell<${column}>`

    return MetricCell
}

const ProductFeedbackCell = ({ product }: ProductTableCellProps) => {
    return (
        <CellWrapper column={ProductInsightsTableColumns.Feedback}>
            <div className={css.feedback}>{product.intent}</div>
        </CellWrapper>
    )
}

const ProductCell = ({ product }: ProductTableCellProps) => {
    return (
        <CellWrapper column={ProductInsightsTableColumns.Product}>
            <div className={css.product}>
                <ProductImage src={product.thumbnail_url} alt={product.name} />
                <div className={css.productName}>
                    <VoCSidePanelTrigger
                        highlighted
                        product={product}
                        segmentEventName={
                            SegmentEvent.StatVoCSidePanelIntentClick
                        }
                    >
                        {product.name}
                    </VoCSidePanelTrigger>
                </div>
            </div>
        </CellWrapper>
    )
}

enum ImageSize {
    md = 48,
}

const ProductImage = ({
    src = fallbackImage,
    alt,
    size = ImageSize.md,
}: {
    src?: string
    alt: string
    size?: ImageSize
}) => {
    const [isError, setIsError] = useState(false)
    const imageSource = isError ? fallbackImage : src
    return (
        <div style={{ width: size, height: size }} className={css.productImage}>
            <img src={imageSource} alt={alt} onError={() => setIsError(true)} />
        </div>
    )
}

const componentMap = {
    [ProductInsightsTableColumns.Product]: ProductCell,
    [ProductInsightsTableColumns.Feedback]: ProductFeedbackCell,
    [ProductInsightsTableColumns.NegativeSentiment]: createMetricCell(
        ProductInsightsTableColumns.NegativeSentiment,
    ),
    [ProductInsightsTableColumns.PositiveSentiment]: createMetricCell(
        ProductInsightsTableColumns.PositiveSentiment,
    ),
    [ProductInsightsTableColumns.ReturnMentions]: createMetricCell(
        ProductInsightsTableColumns.ReturnMentions,
    ),
    [ProductInsightsTableColumns.TicketsVolume]: createMetricCell(
        ProductInsightsTableColumns.TicketsVolume,
    ),
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
}: {
    column: ProductInsightsTableColumns
    product: Product
}) => {
    const Component = componentMap[column]
    return <Component product={product} />
}
