import { useState } from 'react'

import classNames from 'classnames'

import { transformCategorySeparatorBack } from 'hooks/reporting/helpers'
import { useIntentTicketCountsAndDelta } from 'hooks/reporting/voice-of-customer/useIntentTicketCountsAndDelta'
import { OrderDirection } from 'models/api/types'
import { TicketTimeReference } from 'models/stat/types'
import { NoDataAvailable } from 'pages/stats/common/components/NoDataAvailable'
import css from 'pages/stats/common/components/Table/BreakdownTable.less'
import { TableWithNestedRows } from 'pages/stats/common/components/Table/TableWithNestedRows'
import { TableWithNestedRowsCell } from 'pages/stats/common/components/Table/TableWithNestedRowsCell'
import { TrendIcon } from 'pages/stats/common/components/TrendIcon'
import { DrillDownModalTrigger } from 'pages/stats/common/drill-down/DrillDownModalTrigger'
import { TableLoadingFallback } from 'pages/stats/ticket-insights/ticket-fields/TableLoadingFallback'
import { DEFAULT_SORTING_COLUMN } from 'pages/stats/voice-of-customer/product-insights/constants'
import {
    formatTableData,
    formatTrendData,
    getColumnsSortingValue,
} from 'pages/stats/voice-of-customer/product-insights/helpers'
import topProductsCss from 'pages/stats/voice-of-customer/product-insights/TopProductsPerIntent.less'
import {
    columnOrder,
    LeadColumn,
    TOP_INTENTS_PER_PAGE,
    TopProductsPerIntentColumn,
    TopProductsPerIntentColumnConfig,
} from 'pages/stats/voice-of-customer/product-insights/TopProductsPerIntentConfig'
import { DEFAULT_SORTING_DIRECTION } from 'state/ui/stats/createTableSlice'
import { TicketFieldsMetric } from 'state/ui/stats/types'

type Props = {
    intentsCustomFieldId: number
}

type TopProductsPerIntentOrder = {
    column: TopProductsPerIntentColumn
    direction: OrderDirection
}

export const TopProductsPerIntentTable = ({ intentsCustomFieldId }: Props) => {
    const [order, setOrder] = useState<TopProductsPerIntentOrder>({
        column: DEFAULT_SORTING_COLUMN,
        direction: DEFAULT_SORTING_DIRECTION,
    })
    const { data, isFetching } = useIntentTicketCountsAndDelta(
        intentsCustomFieldId.toString(),
        order.direction,
        getColumnsSortingValue(order.column),
    )

    if (isFetching) {
        return <TableLoadingFallback />
    }

    if (data.length === 0) {
        return <NoDataAvailable style={{ minHeight: 300 }} />
    }

    return (
        <TableWithNestedRows<IntentRowProps, TopProductsPerIntentColumn>
            RowComponent={TopProductsRow}
            rows={formatTableData(data, intentsCustomFieldId)}
            perPage={TOP_INTENTS_PER_PAGE}
            columnOrder={columnOrder}
            leadColumn={LeadColumn}
            sortingOrder={order}
            columnConfig={TopProductsPerIntentColumnConfig}
            getSetOrderHandler={setOrder}
            isScrollable={false}
            intentsCustomFieldId={intentsCustomFieldId}
        />
    )
}

type IntentRowProps = {
    level: number
    columnOrder?: TopProductsPerIntentColumn[]
    entityId: string
    value: number
    prevValue: number
    productId?: string
    leadColumn: TopProductsPerIntentColumn
    intentsCustomFieldId: number
    onClick?: () => void
}

type CellProps = {
    level: number
    hasChildren: boolean
    column: TopProductsPerIntentColumn
    entityId: string
    value: number
    prevValue: number
    productId?: string
    isLeadColumn: boolean
    onClick?: () => void
    intentsCustomFieldId: number
}

const TopProductsRow = ({
    columnOrder = [],
    level,
    entityId,
    value,
    prevValue,
    productId,
    leadColumn,
    onClick,
    intentsCustomFieldId,
}: IntentRowProps) => {
    return (
        <>
            {columnOrder.map((column) => (
                <TopProductsCell
                    key={column}
                    column={column}
                    level={level}
                    entityId={entityId}
                    value={value}
                    prevValue={prevValue}
                    productId={productId}
                    isLeadColumn={leadColumn === column}
                    hasChildren={level === 0}
                    onClick={onClick}
                    intentsCustomFieldId={intentsCustomFieldId}
                />
            ))}
        </>
    )
}

const TopProductsCell = ({
    column,
    entityId,
    value,
    prevValue,
    isLeadColumn,
    level,
    hasChildren,
    onClick,
    intentsCustomFieldId,
}: CellProps) => {
    const { trend, sign = 0 } = formatTrendData(value, prevValue)

    switch (column) {
        case TopProductsPerIntentColumn.Intent:
            return (
                <TableWithNestedRowsCell
                    isLeadColumn={isLeadColumn}
                    level={level}
                    hasChildren={hasChildren}
                    className={classNames(
                        css.leadColumn,
                        topProductsCss.productCell,
                    )}
                    onClick={onClick}
                    innerStyle={{
                        marginLeft: 0,
                    }}
                >
                    {entityId}
                </TableWithNestedRowsCell>
            )
        case TopProductsPerIntentColumn.Volume:
            return (
                <TableWithNestedRowsCell
                    isLeadColumn={isLeadColumn}
                    level={level}
                    hasChildren={hasChildren}
                    innerStyle={{
                        marginLeft: 0,
                    }}
                >
                    <DrillDownModalTrigger
                        highlighted
                        metricData={{
                            title: `Intent Topic | ${entityId}`,
                            metricName:
                                TicketFieldsMetric.TicketCustomFieldsTicketCount,
                            customFieldId: intentsCustomFieldId,
                            customFieldValue: [
                                transformCategorySeparatorBack(entityId),
                            ],
                            ticketTimeReference: TicketTimeReference.CreatedAt,
                        }}
                    >
                        {value}
                    </DrillDownModalTrigger>
                </TableWithNestedRowsCell>
            )
        case TopProductsPerIntentColumn.Delta:
            return (
                <TableWithNestedRowsCell
                    isLeadColumn={isLeadColumn}
                    level={level}
                    hasChildren={hasChildren}
                    innerStyle={{
                        marginLeft: 0,
                    }}
                >
                    <TrendIcon sign={sign} />
                    {trend}
                </TableWithNestedRowsCell>
            )
    }
}
