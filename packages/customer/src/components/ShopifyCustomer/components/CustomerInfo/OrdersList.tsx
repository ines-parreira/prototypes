import { formatOrderDate, OrderCard } from '@repo/ecommerce'
import type { OrderCardProduct } from '@repo/ecommerce'

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
}

export function OrdersList({
    orders,
    isLoadingOrders,
    productsMap,
    draftOrders,
    isLoadingDraftOrders,
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
                                />
                            ))}
                        </>
                    </Box>
                </>
            )}
        </>
    )
}
