import { useCallback, useMemo } from 'react'

import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { MergedRecordWithEnrichment } from 'hooks/reporting/useMetricPerDimension'
import { useProductsSorting } from 'hooks/reporting/voice-of-customer/useSortedProducts'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { opposite, OrderDirection } from 'models/api/types'
import { StatsFilters } from 'models/stat/types'
import { HintTooltip, HintTooltipContent } from 'pages/stats/common/HintTooltip'
import {
    getColumnAlignment,
    getColumnWidth,
    getIsLeadColumn,
    getTooltipPosition,
    ProductInsightsColumnConfig,
    ProductInsightsTableLabels,
} from 'pages/stats/voice-of-customer/components/ProductInsightsTable/ProductInsightsTableConfig'
import { ProductTableHeadCell } from 'pages/stats/voice-of-customer/components/ProductInsightsTable/ProductTable'
import { getSorting, sortingSet } from 'state/ui/stats/productInsightsSlice'
import { ProductInsightsTableColumns } from 'state/ui/stats/types'

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
