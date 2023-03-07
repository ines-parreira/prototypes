import classnames from 'classnames'
import React, {ReactNode} from 'react'

import css from './TrendBadge.less'

type Props = {
    children: ReactNode
    className?: string
    direction?: 'up' | 'down' | 'flat'
    color?: 'positive' | 'negative' | 'neutral'
}

export default function TrendBadge({
    children,
    className,
    direction = 'up',
    color = 'positive',
}: Props) {
    return (
        <div className={classnames(css.trend, css[color], className)}>
            <i className={classnames('material-icons', css.trendIcon)}>
                {`trending_${direction}`}
            </i>
            {children}
        </div>
    )
}
