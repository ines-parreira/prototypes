import React, {MouseEvent, ReactNode} from 'react'
import classnames from 'classnames'

import css from './EdgeLabel.less'

type Props = {
    children: ReactNode
    onClick?: (event: MouseEvent<HTMLDivElement>) => void
    isSelected?: boolean
    type:
        | 'choice'
        | 'condition'
        | 'http_request'
        | 'cancel_order'
        | 'refund_order'
        | 'update_shipping_address'
        | 'cancel_subscription'
        | 'skip_charge'
}

const EdgeLabel = ({children, onClick, isSelected, type}: Props) => {
    return (
        <div
            className={classnames(css[type], {
                [css.isSelected]: isSelected,
            })}
            onClick={onClick}
        >
            {children}
        </div>
    )
}

export default EdgeLabel
