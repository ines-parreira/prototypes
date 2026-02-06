import { formatOrderDate, OrderCard } from '@repo/ecommerce'
import type { OrderCardProduct } from '@repo/ecommerce'

import { Box } from '@gorgias/axiom'

import type { OrderEcommerceData } from '../../types'
import { OrdersHeader } from './OrdersHeader'

type OrdersListProps = {
    orders: OrderEcommerceData[] | undefined
    isLoadingOrders: boolean
    productsMap: Map<number, OrderCardProduct> | undefined
}

export function OrdersList({
    orders,
    isLoadingOrders,
    productsMap,
}: OrdersListProps) {
    if (isLoadingOrders || !orders || orders.length === 0) {
        return null
    }

    return (
        <Box flexDirection="column" gap="xs">
            <OrdersHeader
                ordersCount={orders.length}
                isLoading={isLoadingOrders}
            />
            {orders.map((order) => (
                <OrderCard
                    key={order.id}
                    order={order.data}
                    displayedDate={formatOrderDate(order.data.created_at)}
                    productsMap={productsMap}
                />
            ))}
        </Box>
    )
}
