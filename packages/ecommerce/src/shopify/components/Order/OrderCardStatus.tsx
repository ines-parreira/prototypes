import { Box, CardFooter, Tag } from '@gorgias/axiom'

import type {
    FinancialStatusValue,
    FulfillmentStatusValue,
} from '../../types/order'
import { getFinancialStatusInfo, getFulfillmentStatusInfo } from '../../utils'

type OrderCardStatusProps = {
    financialStatus: FinancialStatusValue
    fulfillmentStatus: FulfillmentStatusValue | null
    cancelledAt?: string | null
}

export function OrderCardStatus({
    financialStatus,
    fulfillmentStatus,
    cancelledAt,
}: OrderCardStatusProps) {
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
