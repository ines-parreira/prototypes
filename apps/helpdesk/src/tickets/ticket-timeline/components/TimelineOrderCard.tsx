import { OrderCard } from '@repo/ecommerce'

import { Box } from '@gorgias/axiom'

import type { Order, Product } from 'constants/integrations/types/shopify'

type Props = {
    order: Order
    displayedDate: string
    productsMap: Map<number, Product>
}

export function TimelineOrderCard({
    order,
    displayedDate,
    productsMap,
}: Props) {
    return (
        <Box marginBottom="xs" flexDirection="column">
            <OrderCard
                order={order}
                displayedDate={displayedDate}
                productsMap={productsMap}
            />
        </Box>
    )
}
