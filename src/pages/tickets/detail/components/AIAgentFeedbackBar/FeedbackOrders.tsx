import React from 'react'
import classNames from 'classnames'

import css from './AIAgentFeedbackBar.less'

type Props = {
    orders?: {
        id: number
        url: string
    }[]
}

const FeedbackOrders: React.FC<Props> = ({orders}) => {
    if (!orders || !orders.length) {
        return null
    }

    return (
        <div className={css.sectionContainer}>
            <div className={css.subtitle}>Order Data</div>
            {orders.map((order) => (
                <a
                    href={order.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    key={order.id}
                    className={css.order}
                    data-testid="ticket-feedback-order"
                >
                    <div>#{order.id}</div>
                    <i className={classNames('material-icons', css.openIcon)}>
                        open_in_new
                    </i>
                </a>
            ))}
        </div>
    )
}

export default FeedbackOrders
