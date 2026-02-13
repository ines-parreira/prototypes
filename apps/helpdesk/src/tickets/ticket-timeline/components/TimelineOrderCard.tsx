import { OrderCard } from '@repo/ecommerce'
import { useHelpdeskV2MS2Flag } from '@repo/feature-flags'

import { Box } from '@gorgias/axiom'

import type { Order, Product } from 'constants/integrations/types/shopify'

type Props = {
    order: Order
    displayedDate: string
    productsMap: Map<number, Product>
    onSelect?: (order: Order) => void
}

export function TimelineOrderCard({
    order,
    displayedDate,
    productsMap,
    onSelect,
}: Props) {
    const hasUIVisionMilestone2 = useHelpdeskV2MS2Flag()

    return (
        <Box marginBottom="xs" flexDirection="column">
            <OrderCard
                order={order}
                displayedDate={displayedDate}
                productsMap={productsMap}
                onClick={
                    onSelect && hasUIVisionMilestone2
                        ? () => onSelect(order)
                        : undefined
                }
            />
        </Box>
    )
}
