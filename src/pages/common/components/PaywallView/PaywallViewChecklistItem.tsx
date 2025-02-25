import React, { ReactNode } from 'react'

import classNames from 'classnames'

import css from './PaywallViewChecklistItem.less'

type Props = {
    children: ReactNode
}

export default function PaywallViewChecklistItem({ children }: Props) {
    return (
        <div className={css.container}>
            <i className={classNames('material-icons', css.checkIcon)}>check</i>
            <div>{children}</div>
        </div>
    )
}
