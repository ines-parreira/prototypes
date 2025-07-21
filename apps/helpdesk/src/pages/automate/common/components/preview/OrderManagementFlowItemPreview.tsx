import React, { ReactNode } from 'react'

import classnames from 'classnames'

import css from './SelfServiceHelpCenterHomePage.less'

const OrderManagementFlowItemPreview = ({
    isHighlighted,
    icon,
    children,
}: {
    isHighlighted: boolean
    icon: string
    children: ReactNode
}) => {
    return (
        <div
            className={classnames(css.orderManagementItem, {
                [css.isHighlighted]: isHighlighted,
            })}
        >
            <img src={icon} alt="" />
            <div className={css.flowLabel}>{children}</div>
            <i className={classnames('material-icons', css.flowChevron)}>
                keyboard_arrow_right
            </i>
        </div>
    )
}

export default OrderManagementFlowItemPreview
