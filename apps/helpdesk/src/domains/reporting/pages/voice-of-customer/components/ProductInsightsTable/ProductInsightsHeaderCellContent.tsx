import { useCallback, useMemo } from 'react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { MergedRecordWithEnrichment } from 'domains/reporting/hooks/useMetricPerDimension'
import { useProductsSorting } from 'domains/reporting/hooks/voice-of-customer/useSortedProducts'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    HintTooltip,
    HintTooltipContent,
} from 'domains/reporting/pages/common/HintTooltip'
import {
    getColumnAlignment,
    getColumnWidth,
    getIsLeadColumn,
    getTooltipPosition,
    ProductInsightsColumnConfig,
    ProductInsightsTableLabels,
} from 'domains/reporting/pages/voice-of-customer/components/ProductInsightsTable/ProductInsightsTableConfig'
import { ProductTableHeadCell } from 'domains/reporting/pages/voice-of-customer/components/ProductInsightsTable/ProductTable'
import {
    getSorting,
    sortingSet,
} from 'domains/reporting/state/ui/stats/productInsightsSlice'
import { ProductInsightsTableColumns } from 'domains/reporting/state/ui/stats/types'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { opposite, OrderDirection } from 'models/api/types'

export const SORTABLE_COLUMNS = [
    ProductInsightsTableColumns.Product,
    ProductInsightsTableColumns.PositiveSentiment,
    ProductInsightsTableColumns.NegativeSentiment,
    ProductInsightsTableColumns.TicketsVolume,
    ProductInsightsTableColumns.ReturnMentions,
]
export const ProductInsightsHeaderCellContent = ({
    column,
    useSortingQuery,
}: {
    column: ProductInsightsTableColumns
    useSortingQuery: (
        statsFilters: StatsFilters,
        userTimezone: string,
        sorting: OrderDirection,
    ) => {
        data: {
            allData: MergedRecordWithEnrichment[]
            value: number | null
        } | null
        isFetching: boolean
        isError: boolean
    }
}) => {
    const tooltip = ProductInsightsColumnConfig[column].hint
    const sorting = useAppSelector(getSorting)
    const dispatch = useAppDispatch()

    const { cleanStatsFilters, userTimezone } = useStatsFilters()
    const { data, isFetching } = useSortingQuery(
        cleanStatsFilters,
        userTimezone,
        sorting.direction,
    )

    useProductsSorting(column, data, isFetching)

    const setSortingCallback = useCallback(() => {
        dispatch(
            sortingSet({
                field: column,
                direction:
                    sorting.field === column
                        ? opposite(sorting.direction)
                        : sorting.direction,
            }),
        )
    }, [dispatch, column, sorting])

    const isSortable = useMemo(() => {
        return SORTABLE_COLUMNS.includes(column)
    }, [column])

    const tooltipPosition = getTooltipPosition(column)

    const tooltipElement =
        tooltip && tooltipPosition === 'right' ? (
            <HintTooltipContent {...tooltip} />
        ) : null

    const childElement =
        tooltip && tooltipPosition === 'left' ? (
            <HintTooltip {...tooltip} />
        ) : null

    return (
        <ProductTableHeadCell
            isOrderedBy={isSortable && sorting.field === column}
            direction={sorting.direction}
            onSetSortDirection={isSortable ? setSortingCallback : undefined}
            title={ProductInsightsTableLabels[column]}
            width={getColumnWidth(column)}
            isSticky={getIsLeadColumn(column)}
            justifyContent={getColumnAlignment(column)}
            tooltip={tooltipElement}
        >
            {childElement}
        </ProductTableHeadCell>
    )
}
