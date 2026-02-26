import { OrderCard } from '@repo/ecommerce/shopify/components'
import type {
    FinancialStatusValue,
    FulfillmentStatusValue,
    OrderCardOrder,
    OrderCardProduct,
} from '@repo/ecommerce/shopify/types'
import { formatOrderDate } from '@repo/ecommerce/shopify/utils'

import { Box, Button, Heading, Tag, Text } from '@gorgias/axiom'

import type { Order } from 'constants/integrations/types/shopify'

type Props = {
    lastOrder: Order
    totalCount: number
    unfulfilledCount: number
    productsMap?: Map<number, OrderCardProduct>
    onShowAll: () => void
}

function toOrderCardOrder(order: Order): OrderCardOrder {
    return {
        name: order.name,
        currency: order.currency,
        total_price: order.total_price,
        financial_status: order.financial_status as FinancialStatusValue,
        fulfillment_status:
            order.fulfillment_status as FulfillmentStatusValue | null,
        line_items: order.line_items.map((item) => ({
            title: item.title,
            product_id: item.product_id,
            variant_id: item.variant_id,
        })),
    }
}

export function ShopifyOrdersWidget({
    lastOrder,
    totalCount,
    unfulfilledCount,
    productsMap,
    onShowAll,
}: Props) {
    return (
        <Box
            paddingLeft="xs"
            paddingRight="xs"
            paddingTop="md"
            paddingBottom="md"
            flexDirection="column"
            gap="xs"
        >
            <Heading size="md">
                <Box gap="xs" flexDirection="row" alignItems="center">
                    <Text size="md" variant="bold">
                        Orders
                    </Text>
                    <Box gap="xs" alignItems="center">
                        <Tag color="grey">{totalCount}</Tag>
                        {unfulfilledCount > 0 && (
                            <Tag color="grey">{`${unfulfilledCount} unfulfilled`}</Tag>
                        )}
                    </Box>
                </Box>
            </Heading>

            <OrderCard
                order={toOrderCardOrder(lastOrder)}
                displayedDate={formatOrderDate(lastOrder.created_at)}
                productsMap={productsMap}
            />

            <Box>
                <Button
                    variant="tertiary"
                    size="sm"
                    trailingSlot="arrow-chevron-right"
                    onClick={onShowAll}
                >
                    Show all
                </Button>
            </Box>
        </Box>
    )
}
