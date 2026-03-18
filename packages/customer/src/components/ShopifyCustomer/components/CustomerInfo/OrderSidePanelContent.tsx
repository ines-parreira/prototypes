import { useCallback } from 'react'
import type { ReactNode } from 'react'

import type { FullShopifyMetafield } from '@repo/ecommerce/shopify/components'
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

import { BillingAddressSection } from './BillingAddressSection'
import { OrderActions } from './OrderActions'
import { OrderDetailsSection } from './OrderDetailsSection'
import { OrderLineItemsSection } from './OrderLineItemsSection'
import { OrderShipmentSection } from './OrderShipmentSection'
import type {
    EditShippingAddressModalRenderProps,
    ShippingAddress,
} from './ShippingAddressSection'
import { ShippingAddressSection } from './ShippingAddressSection'
import { useCanEditOrder } from './useCanEditOrder'
import { useOrderFieldPreferences } from './useOrderFieldPreferences'

export type OrderData = {
    id: number | string
    order_number?: number | string
    updated_at?: string
    customer?: unknown
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
    cancelled_at?: string | null
    order_status_url?: string
    invoice_url?: string
    fulfillments?: Array<{
        tracking_url?: string | null
        tracking_number?: string | null
    }> | null
    shipping_address?: ShippingAddress | null
    billing_address?: {
        name?: string
        address1?: string | null
        address2?: string | null
        city?: string | null
        province_code?: string | null
        country_code?: string
        country?: string | null
        zip?: string | null
    } | null
    discount_codes?: Array<{ code: string; amount: string; type: string }>
    shipping_lines?: Array<{ code?: string; [key: string]: unknown }> | null
    metafields?: FullShopifyMetafield[]
}

type Props<T extends OrderData = OrderData> = {
    order: T
    onClose: () => void
    productsMap?: Map<number, OrderCardProduct>
    isDraftOrder?: boolean
    onEdit?: (order: T) => void
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
    onEdit,
    onDuplicate,
    onRefund,
    onCancel,
    storeName,
    integrationId,
    ticketId,
    customerId,
    renderEditShippingAddressModal,
}: Props<T>) {
    const handleEdit = useCallback(() => {
        onEdit?.(order)
    }, [order, onEdit])

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

    const { preferences } = useOrderFieldPreferences()

    const isRefunded = ['refunded', 'partially_refunded', 'voided'].includes(
        order.financial_status,
    )
    const isCancelled = !!order.cancelled_at
    const lineItemsVisible =
        preferences.sections.lineItems?.sectionVisible !== false
    const canEdit = useCanEditOrder(order)

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
                        <Icon name="app-shopify" size="lg" intent="regular" />
                    </Box>

                    <Box flex={1} minWidth={0} alignItems="center" gap="xs">
                        <Heading size="lg" overflow="ellipsis">
                            Order {order.name}
                        </Heading>
                        <Box gap="xxxs">
                            {isCancelled && <Tag color="red">Cancelled</Tag>}
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
                        onEdit={canEdit && onEdit ? handleEdit : undefined}
                        onDuplicate={onDuplicate ? handleDuplicate : undefined}
                        onRefund={
                            isRefunded || !onRefund ? undefined : handleRefund
                        }
                        onCancel={
                            isCancelled || !onCancel ? undefined : handleCancel
                        }
                    />
                )}

                <OrderDetailsSection
                    order={order}
                    isDraftOrder={isDraftOrder}
                    integrationId={integrationId}
                    ticketId={ticketId}
                    storeName={storeName}
                />

                {lineItemsVisible && (
                    <OrderLineItemsSection
                        lineItems={order.line_items ?? []}
                        productsMap={productsMap}
                        moneySymbol={moneySymbol}
                        subtotalPrice={order.subtotal_price}
                        totalShippingPrice={order.total_shipping_price}
                        totalTax={order.total_tax}
                        totalPrice={order.total_price}
                    />
                )}

                <OrderShipmentSection
                    order={order}
                    storeName={storeName}
                    integrationId={integrationId}
                    ticketId={ticketId}
                    isDraftOrder={isDraftOrder}
                />
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
                <Box mt="sm">
                    <BillingAddressSection
                        billingAddress={order.billing_address}
                    />
                </Box>
            </Box>
        </OverlayContent>
    )
}
