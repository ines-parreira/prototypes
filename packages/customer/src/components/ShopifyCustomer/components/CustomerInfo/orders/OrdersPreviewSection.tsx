import type { ReactNode } from 'react'

import { OrderCard } from '@repo/ecommerce/shopify/components'
import type { OrderCardOrder } from '@repo/ecommerce/shopify/types'
import {
    FinancialStatus,
    FulfillmentStatus,
} from '@repo/ecommerce/shopify/types'

import { Box, Button, Text } from '@gorgias/axiom'

import css from '../editPanels/IntermediateEditPanel.less'

const placeholderOrder: OrderCardOrder = {
    name: '#XXXXXXX',
    currency: 'USD',
    total_price: 'XX.XX',
    financial_status: FinancialStatus.Paid,
    fulfillment_status: FulfillmentStatus.Fulfilled,
    line_items: [
        { title: 'Placeholder item', product_id: null, variant_id: null },
    ],
}

type OrdersPreviewSectionProps = {
    onEditOrderClick: () => void
    addMenu?: ReactNode
    actionsList?: ReactNode
    showOrderCard?: boolean
}

export function OrdersPreviewSection({
    onEditOrderClick,
    addMenu,
    actionsList,
    showOrderCard = true,
}: OrdersPreviewSectionProps) {
    return (
        <div className={css.section}>
            <Box flexDirection="column" gap="xs">
                <Box
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Text size="md" variant="bold">
                        Orders
                    </Text>
                    <Box flexDirection="row" alignItems="center" gap="xs">
                        <Button
                            variant="secondary"
                            leadingSlot="edit"
                            onClick={onEditOrderClick}
                        >
                            Edit order details
                        </Button>
                        {addMenu}
                    </Box>
                </Box>

                {actionsList}

                {showOrderCard && <OrderCard order={placeholderOrder} />}
            </Box>
        </div>
    )
}
