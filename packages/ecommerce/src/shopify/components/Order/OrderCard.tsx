import { getMoneySymbol } from '@repo/utils'

import { Card } from '@gorgias/axiom'

import type { OrderCardOrder, OrderCardProduct } from '../../types'
import { OrderCardHeader } from './OrderCardHeader'
import { OrderCardProducts } from './OrderCardProducts'
import { OrderCardStatus } from './OrderCardStatus'

import css from './OrderCard.less'

type OrderCardProps = {
    order: OrderCardOrder
    displayedDate: string
    productsMap?: Map<number, OrderCardProduct>
    onClick?: () => void
    isDraftOrder?: boolean
}

export function OrderCard({
    order,
    displayedDate,
    productsMap,
    onClick,
    isDraftOrder,
}: OrderCardProps) {
    const moneySymbol = getMoneySymbol(order.currency, true)

    return (
        <div onClick={onClick}>
            <Card
                className={css.orderCard}
                gap="xxxs"
                withHoverEffect={!!onClick}
            >
                <OrderCardHeader
                    orderName={order.name}
                    displayedDate={displayedDate}
                />
                <OrderCardProducts
                    lineItems={order.line_items}
                    productsMap={productsMap}
                    moneySymbol={moneySymbol}
                    totalPrice={order.total_price}
                />
                <OrderCardStatus
                    financialStatus={order.financial_status}
                    fulfillmentStatus={order.fulfillment_status}
                    cancelledAt={order.cancelled_at}
                    isDraftOrder={isDraftOrder}
                    draftStatus={order.status}
                    invoiceSentAt={order.invoice_sent_at}
                />
            </Card>
        </div>
    )
}
