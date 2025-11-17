import type { ColorType } from '@gorgias/axiom'
import { Badge } from '@gorgias/axiom'

import type { FinancialStatus } from 'constants/integrations/types/shopify'

const OrderStatusBadge = ({ status }: { status: FinancialStatus }) => {
    let statusLabel = 'unknown status'
    let color: ColorType = 'light-error'

    switch (status) {
        case 'paid':
            statusLabel = status
            color = 'light-dark'
            break
        case 'pending':
        case 'partially_paid':
            statusLabel = status
            color = 'light-warning'
            break
    }

    return (
        <Badge corner="round" type={color}>
            {statusLabel}
        </Badge>
    )
}

export default OrderStatusBadge
