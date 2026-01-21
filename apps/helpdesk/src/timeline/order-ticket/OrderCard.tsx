import { getMoneySymbol } from '@repo/utils'
import cn from 'classnames'

import logo from 'assets/img/infobar/shopify.svg'
import type { Order } from 'constants/integrations/types/shopify'

import CardHeaderIcon from './CardHeaderIcon'
import OrderStatusBadge from './OrderStatusBadge'

import css from './OrderCard.less'

type Props = {
    className?: string
    order: Order
    displayedDate: JSX.Element
}

const OrderCard = ({ className, order, displayedDate }: Props) => {
    const moneySymbol = getMoneySymbol(order.currency, true)
    return (
        <div className={cn(css.card, className)}>
            <CardHeaderIcon src={logo} alt="Shopify" />
            <div className={css.content}>
                <div className={css.heading}>
                    <span className={css.title}>
                        <span
                            className={css.subject}
                        >{`Order: ${order.name}`}</span>
                        <OrderStatusBadge status={order.financial_status} />
                    </span>
                    <span className={css.date}>{displayedDate}</span>
                </div>
                <ul className={css.orderTicketFields}>
                    <li>
                        {moneySymbol}
                        {order.total_price}
                    </li>
                    <span className={css.separator}>•</span>
                    <li>{`${order.line_items.length} items`}</li>
                    <span className={css.separator}>•</span>
                    <li>{`ID: ${order.id}`}</li>
                </ul>
            </div>
        </div>
    )
}

export default OrderCard
