import React, {ReactNode} from 'react'
import classnames from 'classnames'

import css from './BillingHeader.less'

type Props = {
    className?: string
    children: ReactNode
    icon: string
}

export default function BillingHeader({className, children, icon}: Props) {
    return (
        <h4 className={classnames(css.header, className)}>
            <i className={classnames(css.icon, 'material-icons')}>{icon}</i>
            {children}
        </h4>
    )
}
