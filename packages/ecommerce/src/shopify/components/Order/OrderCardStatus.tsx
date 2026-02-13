import { Box, CardFooter, Tag } from '@gorgias/axiom'

import type {
    FinancialStatusValue,
    FulfillmentStatusValue,
} from '../../types/order'
import { getFinancialStatusInfo, getFulfillmentStatusInfo } from '../../utils'

type OrderCardStatusProps = {
    financialStatus: FinancialStatusValue
    fulfillmentStatus: FulfillmentStatusValue | null
}

export function OrderCardStatus({
    financialStatus,
    fulfillmentStatus,
}: OrderCardStatusProps) {
    const { label: financialLabel, color: financialColor } =
        getFinancialStatusInfo(financialStatus)

    const { label: fulfillmentLabel, color: fulfillmentColor } =
        getFulfillmentStatusInfo(fulfillmentStatus)

    return (
        <CardFooter>
            <Box flexDirection="row" gap="xs">
                <Tag color={financialColor}>{financialLabel}</Tag>
                <Tag color={fulfillmentColor}>{fulfillmentLabel}</Tag>
            </Box>
        </CardFooter>
    )
}
