import cn from 'classnames'

import logo from 'assets/img/infobar/shopify.svg'
import { Order } from 'constants/integrations/types/shopify'

import CardHeaderIcon from './CardHeaderIcon'
import OrderStatusBadge from './OrderStatusBadge'

import css from './OrderTicket.less'

type Props = {
    className?: string
    isHighlighted?: boolean
    order: Order
    displayedDate: JSX.Element
}

const OrderTicketCard = ({
    className,
    isHighlighted = false,
    order,
    displayedDate,
}: Props) => {
    return (
        <div
            className={cn(css.card, className, {
                [css.highlight]: isHighlighted,
            })}
        >
            <CardHeaderIcon src={logo} alt="Shopify" />
            <div className={css.content}>
                <div className={css.heading}>
                    <span className={css.title}>
                        <span className={css.subject}>{order.id}</span>
                        <OrderStatusBadge status={order.financial_status} />
                    </span>
                    <span className={css.date}>{displayedDate}</span>
                </div>
                <ul className={css.orderTicketFields}>
                    <li>${order.total_price}</li>
                    <span className={css.separator}>•</span>
                    <li>{`${order.line_items.length} items`}</li>
                </ul>
            </div>
        </div>
    )
}

export default OrderTicketCard
