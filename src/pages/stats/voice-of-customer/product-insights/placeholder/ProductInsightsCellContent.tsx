import classnames from 'classnames'

import { Skeleton } from '@gorgias/merchant-ui-kit'

import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { MetricPerProductAndIntentQueryHook } from 'hooks/reporting/voice-of-customer/metricsPerProductAndIntent'
import { OrderDirection } from 'models/api/types'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import css from 'pages/stats/common/components/Table/AnalyticsTable.less'
import { TruncateCellContent } from 'pages/stats/common/components/TruncateCellContent'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import { METRIC_COLUMN_WIDTH } from 'pages/stats/support-performance/agents/AgentsTableConfig'
import {
    LeadColumn,
    ProductInsightsColumnConfig,
} from 'pages/stats/voice-of-customer/product-insights/placeholder/ProductInsightsTableConfig'
import { ProductInsightsTableColumns } from 'state/ui/stats/types'

const getCellContent = (
    column: ProductInsightsTableColumns,
    product: {
        id: string
        name: string
    },
    intent: string,
    data: {
        value: number | null
    } | null,
) => {
    switch (column) {
        case LeadColumn:
            return product.name
        case ProductInsightsTableColumns.Feedback:
            return intent
        default:
            return formatMetricValue(
                data?.value,
                ProductInsightsColumnConfig[column].format,
                NOT_AVAILABLE_PLACEHOLDER,
            )
    }
}

export const ProductInsightsCellContent = ({
    column,
    product,
    intent,
    className,
    isLoading,
    useMetric,
    width,
}: {
    product: { id: string; name: string; thumbnailUrl: string }
    intent: string
    column: ProductInsightsTableColumns
    className?: string
    isLoading?: boolean
    width: number
    useMetric: MetricPerProductAndIntentQueryHook
}) => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    const { isFetching, data } = useMetric(
        cleanStatsFilters,
        userTimezone,
        product.id,
        intent,
        OrderDirection.Desc,
    )

    const cellContent = getCellContent(column, product, intent, data)

    return (
        <BodyCell
            width={width}
            className={classnames(className)}
            innerClassName={classnames(
                css.cellContent,
                cellContent === NOT_AVAILABLE_PLACEHOLDER && css.emptyValue,
            )}
            justifyContent={column === LeadColumn ? 'left' : 'right'}
            size={'small'}
        >
            {isFetching || isLoading ? (
                <Skeleton inline width={METRIC_COLUMN_WIDTH} />
            ) : column !== LeadColumn ? (
                <>{cellContent}</>
            ) : (
                <>
                    <img src={product.thumbnailUrl} alt={product.name} />
                    <TruncateCellContent
                        content={<a href={'#'}>{cellContent}</a>}
                    />
                </>
            )}
        </BodyCell>
    )
}
