import React, { MouseEvent, ReactNode } from 'react'

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
        | 'remove_item'
        | 'replace_item'
        | 'create_discount_code'
        | 'reship_for_free'
        | 'refund_shipping_costs'
        | 'cancel_subscription'
        | 'skip_charge'
        | 'reusable_llm_prompt_call'
}

const EdgeLabel = ({ children, onClick, isSelected, type }: Props) => {
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
