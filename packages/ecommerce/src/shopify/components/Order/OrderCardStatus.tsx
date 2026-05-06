import { Box, CardFooter, Tag } from '@gorgias/axiom'

import type {
    DraftStatusValue,
    FinancialStatusValue,
    FulfillmentStatusValue,
} from '../../types/order'
import {
    getDraftOrderStatusInfo,
    getFinancialStatusInfo,
    getFulfillmentStatusInfo,
} from '../../utils'

type OrderCardStatusProps = {
    financialStatus: FinancialStatusValue
    fulfillmentStatus: FulfillmentStatusValue | null
    cancelledAt?: string | null
    isDraftOrder?: boolean
    draftStatus?: DraftStatusValue
    invoiceSentAt?: string | null
}

export function OrderCardStatus({
    financialStatus,
    fulfillmentStatus,
    cancelledAt,
    isDraftOrder,
    draftStatus,
    invoiceSentAt,
}: OrderCardStatusProps) {
    if (isDraftOrder) {
        const { label, color } = getDraftOrderStatusInfo(
            draftStatus,
            invoiceSentAt,
        )

        return (
            <CardFooter>
                <Box flexDirection="row" gap="xs">
                    <Tag color="grey">Draft</Tag>
                    <Tag color={color}>{label}</Tag>
                </Box>
            </CardFooter>
        )
    }

    const { label: financialLabel, color: financialColor } =
        getFinancialStatusInfo(financialStatus)

    const { label: fulfillmentLabel, color: fulfillmentColor } =
        getFulfillmentStatusInfo(fulfillmentStatus)

    return (
        <CardFooter>
            <Box flexDirection="row" gap="xs">
                {cancelledAt && <Tag color="red">Cancelled</Tag>}
                <Tag color={financialColor}>{financialLabel}</Tag>
                <Tag color={fulfillmentColor}>{fulfillmentLabel}</Tag>
            </Box>
        </CardFooter>
    )
}
