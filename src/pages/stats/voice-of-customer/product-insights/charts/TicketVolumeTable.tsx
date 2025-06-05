import { useCallback } from 'react'

import { useTicketsPerProductDistribution } from 'hooks/reporting/voice-of-customer/useTicketsDistributionPerProduct'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { useWidthBasedOnScreen } from 'hooks/useWidthBasedOnScreen'
import { opposite } from 'models/api/types'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import { NoDataAvailable } from 'pages/stats/common/components/NoDataAvailable'
import {
    DEFAULT_BADGE_TEXT,
    TREND_BADGE_FORMAT,
} from 'pages/stats/common/components/TrendBadge'
import { TrendIcon } from 'pages/stats/common/components/TrendIcon'
import { HintTooltip } from 'pages/stats/common/HintTooltip'
import {
    formatMetricTrend,
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import { DistributionCategoryCell } from 'pages/stats/ticket-insights/components/DistributionCategoryCell'
import { LoadingTable } from 'pages/stats/ticket-insights/tags/TopUsedTagsChart'
import css from 'pages/stats/ticket-insights/tags/TopUsedTagsChart.less'
import {
    getSorting,
    ProductsPerTicketColumn,
    sortingSet,
} from 'state/ui/stats/productsPerTicketSlice'
import { ColumnSorting } from 'state/ui/stats/types'

const PRODUCT_COLUMN_LABEL = 'Product'
const TOTAL_COLUMN_LABEL = 'Total'
const DELTA_COLUMN_LABEL = 'Delta'

export const ColumnLabels: Record<ProductsPerTicketColumn, string> = {
    [ProductsPerTicketColumn.Product]: PRODUCT_COLUMN_LABEL,
    [ProductsPerTicketColumn.TicketVolume]: TOTAL_COLUMN_LABEL,
    [ProductsPerTicketColumn.Delta]: DELTA_COLUMN_LABEL,
}

const PRODUCT_COLUMN_TOOLTIP =
    'Products and their variant SKUs categorized by  (Shopify? Ticket fields?)'

export const HeaderRow = ({
    sorting,
}: {
    sorting: ColumnSorting<ProductsPerTicketColumn>
}) => {
    const dispatch = useAppDispatch()

    const sortingCallback = useCallback(
        (field: ProductsPerTicketColumn) => {
            dispatch(
                sortingSet({
                    field,
                    direction: opposite(sorting.direction),
                }),
            )
        },
        [dispatch, sorting.direction],
    )

    return (
        <TableBodyRow>
            <HeaderCellProperty
                justifyContent="left"
                width={300}
                className={css.bodyCell}
                title={ColumnLabels[ProductsPerTicketColumn.Product]}
                direction={sorting.direction}
                isOrderedBy={sorting.field === ProductsPerTicketColumn.Product}
                onClick={() => sortingCallback(ProductsPerTicketColumn.Product)}
            >
                {<HintTooltip title={PRODUCT_COLUMN_TOOLTIP} />}
            </HeaderCellProperty>
            <HeaderCellProperty
                justifyContent="center"
                width={65}
                className={css.bodyCell}
                title={ColumnLabels[ProductsPerTicketColumn.TicketVolume]}
                direction={sorting.direction}
                isOrderedBy={
                    sorting.field === ProductsPerTicketColumn.TicketVolume
                }
                onClick={() =>
                    sortingCallback(ProductsPerTicketColumn.TicketVolume)
                }
            />
            <HeaderCellProperty
                justifyContent="center"
                width={65}
                className={css.bodyCell}
                title={ColumnLabels[ProductsPerTicketColumn.Delta]}
                direction={sorting.direction}
                isOrderedBy={sorting.field === ProductsPerTicketColumn.Delta}
            />
        </TableBodyRow>
    )
}

export const TicketVolumeTable = () => {
    const getWidth = useWidthBasedOnScreen()
    const sorting = useAppSelector(getSorting)

    const { data, isFetching } = useTicketsPerProductDistribution()

    return (
        <>
            {isFetching ? (
                <LoadingTable />
            ) : data.length === 0 ? (
                <NoDataAvailable style={{ minHeight: 300 }} />
            ) : (
                <TableWrapper className={css.table}>
                    <TableBody>
                        <HeaderRow sorting={sorting} />
                        {data.map((item, index) => {
                            const { formattedTrend, sign = 0 } =
                                formatMetricTrend(
                                    item.valueInPercentage,
                                    item.previousValueInPercentage,
                                    TREND_BADGE_FORMAT,
                                )
                            return (
                                <TableBodyRow key={index}>
                                    <DistributionCategoryCell
                                        key={item.productId}
                                        progress={item.gaugePercentage}
                                        width={getWidth(300, 140)}
                                        category={item.name}
                                        justifyContent="left"
                                        innerStyle={{ paddingLeft: 0 }}
                                        innerClassName={css.bodyCellContent}
                                    />
                                    <BodyCell
                                        justifyContent="center"
                                        width={65}
                                    >
                                        {item.productId &&
                                            formatMetricValue(
                                                item.value,
                                                'decimal',
                                                NOT_AVAILABLE_PLACEHOLDER,
                                            )}
                                    </BodyCell>
                                    <BodyCell
                                        justifyContent="center"
                                        width={65}
                                    >
                                        <TrendIcon sign={sign} />
                                        {formattedTrend || DEFAULT_BADGE_TEXT}
                                    </BodyCell>
                                </TableBodyRow>
                            )
                        })}
                    </TableBody>
                </TableWrapper>
            )}
        </>
    )
}
