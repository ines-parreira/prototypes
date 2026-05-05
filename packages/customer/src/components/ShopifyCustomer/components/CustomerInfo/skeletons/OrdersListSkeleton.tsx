import { OrderCardSkeleton } from '@repo/ecommerce/shopify/components'

import { Box, Separator, Skeleton } from '@gorgias/axiom'

const ORDER_CARD_PLACEHOLDER_COUNT = 3

export function OrdersListSkeleton() {
    return (
        <>
            <Separator />
            <Box flexDirection="column" gap="xs" padding="md">
                <Box
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Box flexDirection="row" gap="xs" alignItems="center">
                        <Skeleton width={50} height={14} />
                        <Skeleton width={24} height={20} borderRadius={6} />
                    </Box>
                    <Skeleton width={108} height={32} borderRadius={6} />
                </Box>
                {Array.from({ length: ORDER_CARD_PLACEHOLDER_COUNT }).map(
                    (_, index) => (
                        <OrderCardSkeleton key={index} />
                    ),
                )}
            </Box>
        </>
    )
}
