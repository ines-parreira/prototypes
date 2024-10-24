import classNames from 'classnames'
import React from 'react'

import css from './AIAgentFeedbackBar.less'

type Props = {
    orders?: {
        id: number
        name: string
        url: string
    }[]
}

const FeedbackOrders: React.FC<Props> = ({orders}) => {
    if (!orders || !orders.length) {
        return null
    }

    return (
        <div className={css.metadataField}>
            <div className={css.metadataTitle}>Order</div>
            {orders.map((order) => (
                <a
                    href={order.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    key={order.id}
                    className={classNames(css.order, {
                        [css.noHref]: !order.url,
                    })}
                    data-testid="ticket-feedback-order"
                >
                    <div className={css.orderTitle}>{order.name}</div>
                    <i className={classNames('material-icons', css.openIcon)}>
                        open_in_new
                    </i>
                </a>
            ))}
        </div>
    )
}

export default FeedbackOrders
