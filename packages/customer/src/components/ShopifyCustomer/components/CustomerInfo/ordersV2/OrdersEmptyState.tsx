import { Box, Text } from '@gorgias/axiom'

import { OrdersSectionHeader } from './OrdersSectionHeader'

import css from './OrdersEmptyState.less'

export function OrdersEmptyState() {
    return (
        <>
            <OrdersSectionHeader count={0} />
            <Box padding="md">
                <Text size="md" className={css.message}>
                    No orders
                </Text>
            </Box>
        </>
    )
}
