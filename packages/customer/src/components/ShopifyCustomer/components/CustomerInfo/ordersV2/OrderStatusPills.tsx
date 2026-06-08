import type {
    FinancialStatusValue,
    FulfillmentStatusValue,
} from '@repo/ecommerce/shopify/types'
import {
    getFinancialStatusInfo,
    getFulfillmentStatusInfo,
} from '@repo/ecommerce/shopify/utils'

import { Box, Icon, Tag } from '@gorgias/axiom'

import type { OrderData } from '../../../types'

type Props = {
    order: OrderData
    isDraft: boolean
}

export function OrderStatusPills({ order, isDraft }: Props) {
    if (isDraft) {
        return (
            <Box flexDirection="row" alignItems="center" gap="xxs">
                <Tag color="blue" leadingSlot={<Icon name="edit-pencil" />}>
                    Draft
                </Tag>
            </Box>
        )
    }

    const financial = getFinancialStatusInfo(
        order.financial_status as FinancialStatusValue,
    )
    const fulfillment = getFulfillmentStatusInfo(
        order.fulfillment_status as FulfillmentStatusValue | null,
    )

    return (
        <Box flexDirection="row" alignItems="center" gap="xxs">
            <Tag color={financial.color}>{financial.label}</Tag>
            <Tag color={fulfillment.color}>{fulfillment.label}</Tag>
        </Box>
    )
}
