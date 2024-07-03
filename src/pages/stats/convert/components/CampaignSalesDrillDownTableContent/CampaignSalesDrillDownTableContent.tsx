import React from 'react'

import TableHead from 'pages/common/components/table/TableHead'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import css from 'pages/stats/DrillDownTable.less'
import TableBody from 'pages/common/components/table/TableBody'
import {useDrillDownData} from 'hooks/reporting/useDrillDownData'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import {DrillDownMetric} from 'state/ui/stats/drillDownSlice'
import {
    formatCurrency,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import DatetimeLabel from 'pages/common/utils/DatetimeLabel'
import {DrillDownTableContentSkeleton} from 'pages/stats/common/components/Table/DrillDownTableContentSkeleton'

// should add up to table width from CSS
const COLUMN_WIDTHS = {
    orderId: 160,
    date: 180,
    campaign: 360,
    customer: 260,
    amount: 100,
    items: 80,
}
const COLUMN_WIDTHS_ORDERED = [
    COLUMN_WIDTHS.orderId,
    COLUMN_WIDTHS.date,
    COLUMN_WIDTHS.campaign,
    COLUMN_WIDTHS.customer,
    COLUMN_WIDTHS.amount,
    COLUMN_WIDTHS.items,
].map((width) => width - 40)

export const CampaignSalesDrillDownTableContent = ({
    metricData,
}: {
    metricData: DrillDownMetric
}) => {
    const {data, isFetching} = useDrillDownData(metricData)

    return (
        <>
            <TableHead>
                <HeaderCellProperty
                    title="Order"
                    width={COLUMN_WIDTHS.orderId}
                    className={css.headerCell}
                />
                <HeaderCellProperty
                    title="Date"
                    width={COLUMN_WIDTHS.date}
                    className={css.headerCell}
                />
                <HeaderCellProperty
                    title="Campaign attributed"
                    width={COLUMN_WIDTHS.campaign}
                    className={css.headerCell}
                />
                <HeaderCellProperty
                    title="Customer"
                    width={COLUMN_WIDTHS.customer}
                    className={css.headerCell}
                />
                <HeaderCellProperty
                    title="Amount"
                    width={COLUMN_WIDTHS.amount}
                    className={css.headerCell}
                />
                <HeaderCellProperty
                    title="Items"
                    width={COLUMN_WIDTHS.items}
                    className={css.headerCell}
                />
            </TableHead>
            <TableBody>
                {isFetching ? (
                    <DrillDownTableContentSkeleton
                        columnWidths={COLUMN_WIDTHS_ORDERED}
                    />
                ) : (
                    data.map((item) => (
                        <TableBodyRow key={item.data.id}>
                            <BodyCell width={COLUMN_WIDTHS.orderId}>
                                {item.data.id
                                    ? `#${item.data.id}`
                                    : NOT_AVAILABLE_PLACEHOLDER}
                            </BodyCell>
                            <BodyCell width={COLUMN_WIDTHS.date}>
                                {item.data.createdDatetime ? (
                                    <DatetimeLabel
                                        dateTime={item.data.createdDatetime}
                                    />
                                ) : (
                                    NOT_AVAILABLE_PLACEHOLDER
                                )}
                            </BodyCell>
                            <BodyCell width={COLUMN_WIDTHS.campaign}>
                                {item.data.campaignId
                                    ? item.data.campaignId
                                    : NOT_AVAILABLE_PLACEHOLDER}
                            </BodyCell>
                            <BodyCell width={COLUMN_WIDTHS.customer}>
                                {item.data.customerId
                                    ? item.data.customerId
                                    : NOT_AVAILABLE_PLACEHOLDER}
                            </BodyCell>
                            <BodyCell width={COLUMN_WIDTHS.amount}>
                                {item.data.amount && item.data.currency
                                    ? formatCurrency(
                                          parseFloat(item.data.amount),
                                          item.data.currency
                                      )
                                    : NOT_AVAILABLE_PLACEHOLDER}
                            </BodyCell>
                            <BodyCell width={COLUMN_WIDTHS.items}>
                                {item.data.productIds
                                    ? item.data.productIds.length
                                    : NOT_AVAILABLE_PLACEHOLDER}
                            </BodyCell>
                        </TableBodyRow>
                    ))
                )}
            </TableBody>
        </>
    )
}
