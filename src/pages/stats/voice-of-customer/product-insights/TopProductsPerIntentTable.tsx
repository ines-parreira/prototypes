import { useState } from 'react'

import classNames from 'classnames'
import Skeleton from 'react-loading-skeleton'

import { logEvent, SegmentEvent } from 'common/segment'
import { transformCategorySeparator } from 'hooks/reporting/helpers'
import { useIntentTicketCountsAndDelta } from 'hooks/reporting/voice-of-customer/useIntentTicketCountsAndDelta'
import { useProductsTicketCountsPerIntentDistribution } from 'hooks/reporting/voice-of-customer/useProductsTicketCountsPerIntentDistribution'
import { OrderDirection } from 'models/api/types'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import css from 'pages/stats/common/components/Table/BreakdownTable.less'
import { TableWithNestedRows } from 'pages/stats/common/components/Table/TableWithNestedRows'
import { TableWithNestedRowsCell } from 'pages/stats/common/components/Table/TableWithNestedRowsCell'
import { TrendIcon } from 'pages/stats/common/components/TrendIcon'
import { DrillDownModalTrigger } from 'pages/stats/common/drill-down/DrillDownModalTrigger'
import { ProductImage } from 'pages/stats/voice-of-customer/components/ProductImage'
import {
    DEFAULT_SORTING_COLUMN,
    DEFAULT_SORTING_DIRECTION,
} from 'pages/stats/voice-of-customer/product-insights/constants'
import {
    formatProductsPerIntentsTableData,
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
import { VoCSidePanelTrigger } from 'pages/stats/voice-of-customer/side-panel/VoCSidePanelTrigger'
import { VoiceOfCustomerMetricWithDrillDown } from 'pages/stats/voice-of-customer/VoiceOfCustomerMetricConfig'
import {
    TicketsPerIntentMetrics,
    TicketsPerProductPerIntentMetrics,
} from 'state/ui/stats/drillDownSlice'

interface ProductData {
    name: string
    value: number
    prevValue: number
    productId: string
    productUrl?: string
}

interface BaseRowProps {
    level: number
    columnOrder?: TopProductsPerIntentColumn[]
    leadColumn: TopProductsPerIntentColumn
    intentCustomFieldId: number
}

interface BaseMetrics {
    value: number
    prevValue: number
}

interface TopProductsPerIntentOrder {
    column: TopProductsPerIntentColumn
    direction: OrderDirection
}

interface ProductInfo {
    id: string
    name: string
    thumbnail_url?: string
}

interface TopProductsPerIntentTableProps {
    intentCustomFieldId: number
}

interface TopIntentsRowProps extends BaseRowProps, BaseMetrics {
    entityId: string
    productId?: string
    productUrl?: string
    defaultExpanded?: boolean
}

interface TopProductsRowProps extends BaseRowProps {
    entityId: string
}

interface TopProductsCellProps extends BaseRowProps, BaseMetrics {
    column: TopProductsPerIntentColumn
    entityId: string
    productId?: string
    productUrl?: string
    productName?: string
    isLeadColumn: boolean
    isExpanded?: boolean
    toggleExpand?: () => void
}

export const TopProductsPerIntentTable = ({
    intentCustomFieldId,
}: TopProductsPerIntentTableProps) => {
    const [order, setOrder] = useState<TopProductsPerIntentOrder>({
        column: DEFAULT_SORTING_COLUMN,
        direction: DEFAULT_SORTING_DIRECTION,
    })

    const { data, isFetching } = useIntentTicketCountsAndDelta(
        intentCustomFieldId,
        order.direction,
        getColumnsSortingValue(order.column),
    )

    return (
        <TableWithNestedRows<TopIntentsRowProps, TopProductsPerIntentColumn>
            RowComponent={TopIntentsRow}
            rows={formatProductsPerIntentsTableData(data, intentCustomFieldId)}
            perPage={TOP_INTENTS_PER_PAGE}
            columnOrder={columnOrder}
            leadColumn={LeadColumn}
            sortingOrder={order}
            columnConfig={TopProductsPerIntentColumnConfig}
            getSetOrderHandler={setOrder}
            isScrollable={false}
            intentCustomFieldId={intentCustomFieldId}
            isLoading={isFetching}
        />
    )
}

const TopIntentsRow = ({
    columnOrder = [],
    level,
    entityId,
    value,
    prevValue,
    productId,
    leadColumn,
    intentCustomFieldId,
    defaultExpanded = false,
}: TopIntentsRowProps) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded)

    const toggleExpand = (): void => {
        setIsExpanded(!isExpanded)
        if (!isExpanded) {
            logEvent(SegmentEvent.StatVoCSidePanelIntentClick)
        }
    }

    return (
        <>
            <TableBodyRow>
                {columnOrder.map((column) => (
                    <TopProductsCell
                        key={column}
                        column={column}
                        level={level}
                        entityId={entityId}
                        value={value}
                        prevValue={prevValue}
                        leadColumn={leadColumn}
                        isLeadColumn={leadColumn === column}
                        productId={productId}
                        intentCustomFieldId={intentCustomFieldId}
                        isExpanded={isExpanded}
                        toggleExpand={toggleExpand}
                    />
                ))}
            </TableBodyRow>
            {isExpanded && (
                <TopProductsRow
                    entityId={entityId}
                    intentCustomFieldId={intentCustomFieldId}
                    leadColumn={leadColumn}
                    columnOrder={columnOrder}
                    level={level}
                />
            )}
        </>
    )
}

const TopProductsRow = ({
    entityId,
    level,
    leadColumn,
    columnOrder,
    intentCustomFieldId,
}: TopProductsRowProps) => {
    const { data, isFetching } = useProductsTicketCountsPerIntentDistribution(
        intentCustomFieldId,
        entityId,
    )

    if (isFetching) {
        return (
            <TableBodyRow>
                <BodyCell>
                    <Skeleton inline width={200} />
                </BodyCell>
                <BodyCell>
                    <Skeleton inline width={100} />
                </BodyCell>
                <BodyCell>
                    <Skeleton inline width={100} />
                </BodyCell>
            </TableBodyRow>
        )
    }

    return (
        <>
            {data.map((product: ProductData) => (
                <TableBodyRow key={product.productId}>
                    {columnOrder?.map((column) => (
                        <TopProductsCell
                            key={column}
                            entityId={entityId}
                            productName={product.name}
                            value={product.value}
                            prevValue={product.prevValue}
                            productUrl={product.productUrl}
                            productId={product.productId}
                            column={column}
                            leadColumn={leadColumn}
                            isLeadColumn={leadColumn === column}
                            intentCustomFieldId={intentCustomFieldId}
                            level={level}
                        />
                    ))}
                </TableBodyRow>
            ))}
        </>
    )
}

const TopProductsCell = ({
    column,
    entityId,
    value,
    prevValue,
    productUrl,
    productName,
    productId,
    isLeadColumn,
    level,
    intentCustomFieldId,
    isExpanded,
    toggleExpand,
}: TopProductsCellProps) => {
    const { trend, sign = 0 } = formatTrendData(value, prevValue)

    const formattedEntity = transformCategorySeparator(entityId)

    const productDrillDownMetric: TicketsPerProductPerIntentMetrics = {
        metricName: VoiceOfCustomerMetricWithDrillDown.IntentPerProduct,
        title: productName,
        intentCustomFieldId: intentCustomFieldId,
        intentCustomFieldValueString: entityId,
        productId: productId || '',
    }

    const intentDrillDownMetric: TicketsPerIntentMetrics = {
        title: `Intent Topic | ${formattedEntity}`,
        metricName: VoiceOfCustomerMetricWithDrillDown.IntentPerProducts,
        intentCustomFieldId: intentCustomFieldId,
        intentCustomFieldValueString: entityId,
    }

    const productInfo: ProductInfo = {
        id: productId || '',
        name: productName || '',
        thumbnail_url: productUrl,
    }

    switch (column) {
        case TopProductsPerIntentColumn.Intent:
            return productId ? (
                <TableWithNestedRowsCell
                    isLeadColumn={isLeadColumn}
                    level={level}
                    hasChildren={false}
                    innerStyle={{
                        marginLeft: 0,
                    }}
                    className={classNames(
                        css.leadColumn,
                        topProductsCss.productCell,
                    )}
                >
                    <div className={topProductsCss.product}>
                        <ProductImage src={productUrl} alt={formattedEntity} />
                        <div className={topProductsCss.productName}>
                            <VoCSidePanelTrigger
                                highlighted
                                product={productInfo}
                                segmentEventName={
                                    SegmentEvent.StatVoCSidePanelProductClick
                                }
                            >
                                {productName}
                            </VoCSidePanelTrigger>
                        </div>
                    </div>
                </TableWithNestedRowsCell>
            ) : (
                <TableWithNestedRowsCell
                    isLeadColumn={isLeadColumn}
                    level={level}
                    hasChildren={false}
                    innerStyle={{
                        marginLeft: 0,
                    }}
                    className={classNames(
                        css.leadColumn,
                        topProductsCss.productCell,
                    )}
                    onClick={toggleExpand}
                >
                    <i
                        className={classNames(
                            'material-icons-round',
                            topProductsCss.expandIcon,
                        )}
                    >
                        {isExpanded ? 'arrow_drop_down' : 'arrow_right'}
                    </i>
                    {formattedEntity}
                </TableWithNestedRowsCell>
            )
        case TopProductsPerIntentColumn.TicketVolume:
            return (
                <TableWithNestedRowsCell
                    isLeadColumn={isLeadColumn}
                    level={level}
                    hasChildren={false}
                >
                    <DrillDownModalTrigger
                        highlighted
                        metricData={
                            productId
                                ? productDrillDownMetric
                                : intentDrillDownMetric
                        }
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
                    hasChildren={false}
                >
                    <TrendIcon sign={sign} />
                    {trend}
                </TableWithNestedRowsCell>
            )
    }
}
