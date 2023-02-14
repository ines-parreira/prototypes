import classnames from 'classnames'
import React, {ReactNode} from 'react'

import css from './DashboardGrid.less'

type Props = {
    children: ReactNode
    className?: string
}

export default function DashboardGrid({children, className}: Props) {
    return <div className={classnames(css.wrapper, className)}>{children}</div>
}
