import { Box, Button } from '@gorgias/axiom'

import type { OrderData } from '../../../types'
import { isRefundedStatus } from '../orders/orderStatusUtils'
import { useCanEditOrder } from '../orders/useCanEditOrder'
import { useOrderActions } from './OrderActionsContext'

type Props = {
    order: OrderData
    integrationId?: number
    isDraft: boolean
}

export function OrderQuickActions({ order, integrationId, isDraft }: Props) {
    const actions = useOrderActions()
    const canEdit = useCanEditOrder(order)
    const isRefunded = isRefundedStatus(order.financial_status)
    const isCancelled = Boolean(order.cancelled_at)

    // Draft orders don't support these actions (matches OrderSidePanelContent).
    if (isDraft) return null
    if (integrationId == null) return null
    const id = integrationId

    function run(handler: (integrationId: number, order: OrderData) => void) {
        return () => handler(id, order)
    }

    return (
        <Box flexDirection="row" alignItems="center" gap="xxxs">
            <Button
                as="button"
                variant="secondary"
                size="sm"
                leadingSlot="edit"
                isDisabled={!canEdit}
                onClick={run(actions.onEdit)}
            >
                Edit
            </Button>
            <Button
                as="button"
                variant="secondary"
                size="sm"
                leadingSlot="select-multiple"
                onClick={run(actions.onDuplicate)}
            >
                Duplicate
            </Button>
            <Button
                as="button"
                variant="secondary"
                size="sm"
                leadingSlot="undo"
                isDisabled={isRefunded}
                onClick={run(actions.onRefund)}
            >
                Refund
            </Button>
            <Button
                as="button"
                variant="secondary"
                size="sm"
                intent="destructive"
                isDisabled={isCancelled}
                onClick={run(actions.onCancel)}
            >
                Cancel
            </Button>
        </Box>
    )
}
