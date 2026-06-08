import type { ReactNode } from 'react'

import type { FullShopifyMetafield } from '@repo/ecommerce/shopify/components'
import type { OrderCardProduct } from '@repo/ecommerce/shopify/types'
import { formatOrderDate } from '@repo/ecommerce/shopify/utils'
import { useUserDateTimePreferences } from '@repo/preferences'
import { getMoneySymbol } from '@repo/utils'

import { Box, Text } from '@gorgias/axiom'

import { CustomActions, TemplateResolverProvider } from '../CustomActions'
import type { OrderDetailsData, OrderFieldRenderContext } from '../types'
import { useOrderFieldPreferences } from '../widget/useOrderFieldPreferences'
import { formatTotal } from './money'
import { OrderQuickActions } from './OrderQuickActions'
import { OrderStatusPills } from './OrderStatusPills'
import { BillingAddressSection } from './sections/BillingAddressSection'
import { OrderDetailsSection } from './sections/OrderDetailsSection'
import { OrderLineItemsSection } from './sections/OrderLineItemsSection'
import { OrderShipmentSection } from './sections/OrderShipmentSection'
import type { EditShippingAddressModalRenderProps } from './sections/ShippingAddressSection'
import { ShippingAddressSection } from './sections/ShippingAddressSection'
import type { OrdersV2Order } from './types'

import css from './OrderDetail.less'

type Props = {
    order: OrdersV2Order
    productsMap?: Map<number, OrderCardProduct>
    integrationId?: number
    ticketId?: string
    ticketCustomerId?: number
    storeName?: string
    customerExternalId?: string
    hideSummary?: boolean
    renderEditShippingAddressModal?: (
        props: EditShippingAddressModalRenderProps,
    ) => ReactNode
}

export function OrderDetail({
    order,
    productsMap,
    integrationId,
    ticketId,
    ticketCustomerId,
    storeName,
    customerExternalId,
    hideSummary,
    renderEditShippingAddressModal,
}: Props) {
    const { data, isDraft } = order
    const { dateFormat, timeFormat, timezone } = useUserDateTimePreferences()
    const { getVisibleFields } = useOrderFieldPreferences()

    const tagsContext: OrderFieldRenderContext = {
        order: data as OrderDetailsData,
        isDraftOrder: isDraft,
        integrationId,
        ticketId,
        storeName,
        dateFormat,
        timeFormat,
        timezone,
    }
    const tagsField = getVisibleFields('orderDetails').find(
        (f) => f.id === 'tags',
    )
    const renderedTags =
        tagsField?.type === 'component' ? tagsField.render(tagsContext) : null

    const dateLabel = data.created_at
        ? formatOrderDate(data.created_at, dateFormat, timeFormat, timezone)
        : '—'
    const itemCount = (data.line_items ?? []).length

    return (
        <TemplateResolverProvider
            order={data as unknown as Record<string, unknown>}
        >
            <Box flexDirection="column" pt={0} px="sm" pb="sm">
                {!hideSummary && (
                    <Box flexDirection="column" gap="xs">
                        <Text size="md">
                            {`${dateLabel} · ${itemCount} ${itemCount === 1 ? 'item' : 'items'} · `}
                            <Text as="span" size="md" variant="bold">
                                {formatTotal(data.currency, data.total_price)}
                            </Text>
                        </Text>

                        <OrderStatusPills order={data} isDraft={isDraft} />
                    </Box>
                )}

                <Box gap="xs" flexDirection="column" mb="sm">
                    <CustomActions
                        widgetPath="order"
                        integrationId={integrationId}
                        customerId={ticketCustomerId}
                        ticketId={ticketId}
                        compact
                    />
                    <OrderQuickActions
                        order={data}
                        integrationId={integrationId}
                        isDraft={isDraft}
                    />
                </Box>

                <div className={css.actionDataDivider} />

                <Box flexDirection="column" className={css.sections}>
                    {renderedTags && (
                        <Box pt="sm" pb="sm">
                            {renderedTags}
                        </Box>
                    )}
                    {data.discount_codes && data.discount_codes.length > 0 && (
                        <Box
                            p="sm"
                            flexDirection="row"
                            justifyContent="space-between"
                            gap="xs"
                        >
                            <Text size="md" className={css.label}>
                                Discount codes
                            </Text>
                            <Text size="md">
                                {data.discount_codes
                                    .map((c) => c.code)
                                    .join(', ')}
                            </Text>
                        </Box>
                    )}
                    <OrderDetailsSection
                        order={
                            data as OrderDetailsData & {
                                metafields?: FullShopifyMetafield[]
                            }
                        }
                        isDraftOrder={isDraft}
                        integrationId={integrationId}
                        ticketId={ticketId}
                        storeName={storeName}
                    />
                    <OrderLineItemsSection
                        lineItems={data.line_items ?? []}
                        productsMap={productsMap}
                        moneySymbol={
                            data.currency
                                ? getMoneySymbol(data.currency, true)
                                : ''
                        }
                        subtotalPrice={
                            data.total_line_items_price ?? data.subtotal_price
                        }
                        totalShippingPrice={
                            data.total_shipping_price_set?.shop_money?.amount ??
                            data.total_shipping_price
                        }
                        totalDiscounts={data.total_discounts}
                        totalTax={data.total_tax}
                        totalPrice={data.total_price}
                        currentTotalPrice={data.current_total_price}
                        refunds={data.refunds}
                        returns={data.returns}
                    />
                    <OrderShipmentSection
                        order={data as OrderDetailsData}
                        storeName={storeName}
                        integrationId={integrationId}
                        ticketId={ticketId}
                        isDraftOrder={isDraft}
                    />
                    <ShippingAddressSection
                        shippingAddress={data.shipping_address}
                        orderId={String(data.id)}
                        customerId={customerExternalId}
                        integrationId={integrationId}
                        renderEditShippingAddressModal={
                            renderEditShippingAddressModal
                        }
                    />
                    <BillingAddressSection
                        billingAddress={data.billing_address}
                    />
                </Box>
            </Box>
        </TemplateResolverProvider>
    )
}
