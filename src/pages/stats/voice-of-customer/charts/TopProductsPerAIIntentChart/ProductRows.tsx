import classNames from 'classnames'
import Skeleton from 'react-loading-skeleton'

import { SegmentEvent } from 'common/segment'
import {
    ProductTicketCountsPerIntentItem,
    useProductsTicketCountsPerIntentDistribution,
} from 'hooks/reporting/voice-of-customer/useProductsTicketCountsPerIntentDistribution'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import css from 'pages/stats/common/components/Table/BreakdownTable.less'
import { TableWithNestedRowsCell } from 'pages/stats/common/components/Table/TableWithNestedRowsCell'
import {
    DEFAULT_BADGE_TEXT,
    TREND_BADGE_FORMAT,
} from 'pages/stats/common/components/TrendBadge'
import { TrendIcon } from 'pages/stats/common/components/TrendIcon'
import { DrillDownModalTrigger } from 'pages/stats/common/drill-down/DrillDownModalTrigger'
import { formatMetricTrend } from 'pages/stats/common/utils'
import topProductsCss from 'pages/stats/voice-of-customer/charts/TopProductsPerAIIntentChart/TopProductsPerAIIntent.less'
import {
    TopIntentsColumns,
    TopProductsTableColumnsForProducts,
} from 'pages/stats/voice-of-customer/charts/TopProductsPerAIIntentChart/TopProductsPerAIIntentConfig'
import { TopProductsRowProps } from 'pages/stats/voice-of-customer/charts/TopProductsPerAIIntentChart/types'
import { ProductImage } from 'pages/stats/voice-of-customer/components/ProductImage'
import { VoCSidePanelTrigger } from 'pages/stats/voice-of-customer/components/VoCSidePanelTrigger/VoCSidePanelTrigger'
import { VoiceOfCustomerMetricWithDrillDown } from 'pages/stats/voice-of-customer/components/VoiceOfCustomerNavbarContainer/VoiceOfCustomerMetricConfig'

export const ProductRows = ({
    entityId,
    level,
    leadColumn,
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
            {data.map((product) => (
                <TableBodyRow key={product.productId}>
                    {TopProductsTableColumnsForProducts.map((column) => (
                        <ProductCell
                            key={column}
                            entityId={entityId}
                            product={product}
                            column={column}
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

export const ProductCell = ({
    column,
    entityId,
    product,
    isLeadColumn,
    level,
    intentCustomFieldId,
}: {
    column: TopIntentsColumns
    entityId: string
    product: ProductTicketCountsPerIntentItem
    isLeadColumn: boolean
    level: number
    intentCustomFieldId: number
}) => {
    const { value, prevValue } = product

    const { formattedTrend, sign } = formatMetricTrend(
        value,
        prevValue,
        TREND_BADGE_FORMAT,
    )

    switch (column) {
        case TopIntentsColumns.Product:
            return (
                <TableWithNestedRowsCell
                    isLeadColumn={isLeadColumn}
                    level={level}
                    hasChildren={false}
                    innerStyle={{
                        marginLeft: 0,
                    }}
                    className={classNames(css.leadColumn)}
                >
                    <div className={topProductsCss.product}>
                        <ProductImage
                            src={product.productUrl}
                            alt={product.name}
                        />
                        <div className={topProductsCss.productName}>
                            <VoCSidePanelTrigger
                                highlighted
                                product={{
                                    id: product.productId,
                                    name: product.name,
                                    thumbnail_url: product.productUrl,
                                }}
                                segmentEventName={
                                    SegmentEvent.StatVoCSidePanelProductClick
                                }
                            >
                                {product.name}
                            </VoCSidePanelTrigger>
                        </div>
                    </div>
                </TableWithNestedRowsCell>
            )
        case TopIntentsColumns.TicketVolume:
            return (
                <TableWithNestedRowsCell
                    isLeadColumn={isLeadColumn}
                    level={level}
                    hasChildren={false}
                >
                    <DrillDownModalTrigger
                        highlighted
                        metricData={{
                            metricName:
                                VoiceOfCustomerMetricWithDrillDown.IntentPerProduct,
                            title: product.name,
                            intentCustomFieldId: intentCustomFieldId,
                            intentCustomFieldValueString: entityId,
                            productId: product.productId,
                        }}
                    >
                        {value}
                    </DrillDownModalTrigger>
                </TableWithNestedRowsCell>
            )
        case TopIntentsColumns.Delta:
            return (
                <TableWithNestedRowsCell
                    isLeadColumn={isLeadColumn}
                    level={level}
                    hasChildren={false}
                >
                    <TrendIcon sign={sign} />
                    {formattedTrend || DEFAULT_BADGE_TEXT}
                </TableWithNestedRowsCell>
            )
    }
}
