import classnames from 'classnames'
import React, {ReactNode} from 'react'

import css from './TrendBadge.less'

type Props = {
    children: ReactNode
    className?: string
    color?: 'positive' | 'negative' | 'neutral'
}

export default function TrendBadge({
    children,
    className,
    color = 'positive',
}: Props) {
    return (
        <div className={classnames(css.trend, css[color], className)}>
            {children}
        </div>
    )
}
