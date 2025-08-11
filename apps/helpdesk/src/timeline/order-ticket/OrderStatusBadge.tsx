import { Badge } from '@gorgias/axiom'

import { FinancialStatus } from 'constants/integrations/types/shopify'

const OrderStatusBadge = ({ status }: { status: FinancialStatus }) => {
    switch (status) {
        case 'paid':
        case 'pending':
            return (
                <Badge corner="round" type="light-warning">
                    {status}
                </Badge>
            )
        case 'partially_paid':
            return (
                <Badge corner="round" type="light-warning">
                    {status}
                </Badge>
            )

        default:
            return (
                <Badge corner="round" type="light-error">
                    unknown status
                </Badge>
            )
    }
}

export default OrderStatusBadge
