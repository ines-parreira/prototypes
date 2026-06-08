import type { ReactNode } from 'react'

import type { OrderCardProduct } from '@repo/ecommerce/shopify/types'
import { formatOrderDate } from '@repo/ecommerce/shopify/utils'
import { useUserDateTimePreferences } from '@repo/preferences'

import { Box } from '@gorgias/axiom'

import type { EditShippingAddressModalRenderProps } from '../orders/sections/ShippingAddressSection'
import { formatTotal } from './money'
import { OrderDetail } from './OrderDetail'
import { OrderRowHeader } from './OrderRowHeader'
import { OrderStatusPills } from './OrderStatusPills'
import { OrderThumbnailStack } from './OrderThumbnailStack'
import type { OrdersV2Order } from './types'

import css from './OrderRow.less'

type Props = {
    order: OrdersV2Order
    isExpanded: boolean
    onToggle: () => void
    productsMap?: Map<number, OrderCardProduct>
    storeName?: string
    integrationId?: number
    ticketId?: string
    ticketCustomerId?: number
    customerExternalId?: string
    renderEditShippingAddressModal?: (
        props: EditShippingAddressModalRenderProps,
    ) => ReactNode
}

export function OrderRow({
    order,
    isExpanded,
    onToggle,
    productsMap,
    storeName,
    integrationId,
    ticketId,
    ticketCustomerId,
    customerExternalId,
    renderEditShippingAddressModal,
}: Props) {
    const { data, isDraft } = order
    const { dateFormat, timeFormat, timezone } = useUserDateTimePreferences()

    const lineItems = data.line_items ?? []
    const dateLabel = data.created_at
        ? formatOrderDate(data.created_at, dateFormat, timeFormat, timezone)
        : '—'
    return (
        <div
            className={isExpanded ? css.row : `${css.row} ${css.clickable}`}
            onClick={isExpanded ? undefined : onToggle}
        >
            <OrderRowHeader
                orderName={data.name}
                dateLabel={dateLabel}
                itemCount={lineItems.length}
                total={formatTotal(data.currency, data.total_price)}
                isExpanded={isExpanded}
                onToggle={onToggle}
            />

            <Box flexDirection="column" gap="xs" className={css.summaryBody}>
                <OrderThumbnailStack
                    lineItems={lineItems}
                    productsMap={productsMap}
                />
                <OrderStatusPills order={data} isDraft={isDraft} />
            </Box>

            {isExpanded && (
                <OrderDetail
                    hideSummary
                    order={order}
                    productsMap={productsMap}
                    integrationId={integrationId}
                    ticketId={ticketId}
                    ticketCustomerId={ticketCustomerId}
                    storeName={storeName}
                    customerExternalId={customerExternalId}
                    renderEditShippingAddressModal={
                        renderEditShippingAddressModal
                    }
                />
            )}
        </div>
    )
}
