import { useCallback } from 'react'
import type { ReactNode } from 'react'

import type {
    FinancialStatusValue,
    FulfillmentStatusValue,
    OrderCardProduct,
    OrderLineItem,
} from '@repo/ecommerce/shopify/types'
import {
    getFinancialStatusInfo,
    getFulfillmentStatusInfo,
} from '@repo/ecommerce/shopify/utils'
import { getMoneySymbol } from '@repo/utils'

import { Box, Button, Heading, Icon, OverlayContent, Tag } from '@gorgias/axiom'

import { OrderActions } from './OrderActions'
import { OrderDetailsSection } from './OrderDetailsSection'
import { OrderLineItemsSection } from './OrderLineItemsSection'
import { OrderShipmentSection } from './OrderShipmentSection'
import type {
    EditShippingAddressModalRenderProps,
    ShippingAddress,
} from './ShippingAddressSection'
import { ShippingAddressSection } from './ShippingAddressSection'

export type OrderData = {
    id: number | string
    name: string
    financial_status: FinancialStatusValue | string
    fulfillment_status: FulfillmentStatusValue | string | null
    line_items?: OrderLineItem[]
    currency?: string
    total_price?: string
    subtotal_price?: string
    total_tax?: string
    total_shipping_price?: string
    tags?: string
    note?: string
    created_at?: string
    order_status_url?: string
    invoice_url?: string
    fulfillments?: Array<{
        tracking_url?: string | null
        tracking_number?: string | null
    }> | null
    shipping_address?: ShippingAddress | null
}

type Props<T extends OrderData = OrderData> = {
    order: T
    onClose: () => void
    productsMap?: Map<number, OrderCardProduct>
    isDraftOrder?: boolean
    onDuplicate?: (order: T) => void
    onRefund?: (order: T) => void
    onCancel?: (order: T) => void
    storeName?: string
    integrationId?: number
    ticketId?: string
    customerId?: string
    renderEditShippingAddressModal?: (
        props: EditShippingAddressModalRenderProps,
    ) => ReactNode
}

export function OrderSidePanelContent<T extends OrderData = OrderData>({
    order,
    onClose,
    productsMap,
    isDraftOrder,
    onDuplicate,
    onRefund,
    onCancel,
    storeName,
    integrationId,
    ticketId,
    customerId,
    renderEditShippingAddressModal,
}: Props<T>) {
    const handleDuplicate = useCallback(() => {
        onDuplicate?.(order)
    }, [order, onDuplicate])

    const handleRefund = useCallback(() => {
        onRefund?.(order)
    }, [order, onRefund])

    const handleCancel = useCallback(() => {
        onCancel?.(order)
    }, [order, onCancel])

    const { label: financialLabel, color: financialColor } =
        getFinancialStatusInfo(order.financial_status as FinancialStatusValue)

    const { label: fulfillmentLabel, color: fulfillmentColor } =
        getFulfillmentStatusInfo(
            order.fulfillment_status as FulfillmentStatusValue | null,
        )

    const moneySymbol = order.currency
        ? getMoneySymbol(order.currency, true)
        : ''

    return (
        <OverlayContent>
            <Box
                flexDirection="column"
                paddingTop={'md'}
                paddingLeft={'lg'}
                paddingRight={'lg'}
                flex={1}
            >
                <Box
                    flexDirection="row"
                    alignItems="center"
                    gap="xxxs"
                    marginBottom={'xxs'}
                >
                    <Box flexShrink={0}>
                        <Icon
                            name="vendor-shopify-colored"
                            size="lg"
                            intent="regular"
                        />
                    </Box>

                    <Box flex={1} minWidth={0} alignItems="center" gap="xs">
                        <Heading size="lg" overflow="ellipsis">
                            Order {order.name}
                        </Heading>
                        <Box gap="xxxs">
                            <Tag color={financialColor}>{financialLabel}</Tag>
                            <Tag color={fulfillmentColor}>
                                {fulfillmentLabel}
                            </Tag>
                        </Box>
                    </Box>

                    <Box
                        flexDirection="row"
                        alignItems="center"
                        gap="xxxs"
                        flexShrink={0}
                    >
                        <Button
                            as="button"
                            icon="close"
                            intent="regular"
                            size="sm"
                            variant="tertiary"
                            onClick={onClose}
                            aria-label="Close preview"
                        />
                    </Box>
                </Box>

                {!isDraftOrder && (
                    <OrderActions
                        onDuplicate={handleDuplicate}
                        onRefund={handleRefund}
                        onCancel={handleCancel}
                    />
                )}

                <OrderDetailsSection
                    order={order}
                    isDraftOrder={isDraftOrder}
                    integrationId={integrationId}
                    ticketId={ticketId}
                    storeName={storeName}
                />

                <OrderLineItemsSection
                    lineItems={order.line_items ?? []}
                    productsMap={productsMap}
                    moneySymbol={moneySymbol}
                    subtotalPrice={order.subtotal_price}
                    totalShippingPrice={order.total_shipping_price}
                    totalTax={order.total_tax}
                    totalPrice={order.total_price}
                />

                <OrderShipmentSection fulfillments={order.fulfillments} />
                <Box mt="sm">
                    <ShippingAddressSection
                        key={String(order.id)}
                        shippingAddress={order.shipping_address}
                        orderId={String(order.id)}
                        customerId={customerId}
                        integrationId={integrationId}
                        renderEditShippingAddressModal={
                            renderEditShippingAddressModal
                        }
                    />
                </Box>
            </Box>
        </OverlayContent>
    )
}
