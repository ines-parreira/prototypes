import { OrderCard } from '@repo/ecommerce/shopify/components'
import type { OrderCardProduct } from '@repo/ecommerce/shopify/types'
import { formatOrderDate } from '@repo/ecommerce/shopify/utils'

import { Box, Separator } from '@gorgias/axiom'

import type { OrderEcommerceData } from '../../types'
import { DraftOrdersHeader } from './DraftOrdersHeader'
import { OrdersHeader } from './OrdersHeader'

type OrdersListProps = {
    orders: OrderEcommerceData[] | undefined
    isLoadingOrders: boolean
    productsMap: Map<number, OrderCardProduct> | undefined
    draftOrders: OrderEcommerceData[] | undefined
    isLoadingDraftOrders: boolean
    onSelectOrder?: (order: OrderEcommerceData) => void
    onCreateOrder?: () => void
}

export function OrdersList({
    orders,
    isLoadingOrders,
    productsMap,
    draftOrders,
    isLoadingDraftOrders,
    onSelectOrder,
    onCreateOrder,
}: OrdersListProps) {
    if (isLoadingOrders || isLoadingDraftOrders) {
        return null
    }

    const hasOrders = orders && orders.length > 0
    const hasDraftOrders = draftOrders && draftOrders.length > 0

    if (!hasOrders && !hasDraftOrders) {
        return null
    }

    return (
        <>
            <Separator />
            <Box flexDirection="column" gap="xs" padding="md">
                <OrdersHeader
                    ordersCount={orders?.length ?? 0}
                    isLoading={isLoadingOrders}
                    onCreateOrder={onCreateOrder}
                />

                {hasOrders && (
                    <>
                        {orders.map((order) => (
                            <OrderCard
                                key={order.id}
                                order={order.data}
                                displayedDate={formatOrderDate(
                                    order.data.created_at,
                                )}
                                productsMap={productsMap}
                                onClick={
                                    onSelectOrder
                                        ? () => onSelectOrder(order)
                                        : undefined
                                }
                            />
                        ))}
                    </>
                )}
            </Box>
            {hasDraftOrders && (
                <>
                    <Separator />
                    <Box flexDirection="column" gap="xs" padding="md">
                        <>
                            <DraftOrdersHeader
                                ordersCount={draftOrders.length}
                                isLoading={isLoadingDraftOrders}
                            />
                            {draftOrders.map((draftOrder) => (
                                <OrderCard
                                    key={draftOrder.id}
                                    order={draftOrder.data}
                                    displayedDate={formatOrderDate(
                                        draftOrder.data.created_at,
                                    )}
                                    productsMap={productsMap}
                                    onClick={
                                        onSelectOrder
                                            ? () => onSelectOrder(draftOrder)
                                            : undefined
                                    }
                                />
                            ))}
                        </>
                    </Box>
                </>
            )}
        </>
    )
}
