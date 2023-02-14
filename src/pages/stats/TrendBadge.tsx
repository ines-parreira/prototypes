import classnames from 'classnames'
import React, {ReactNode} from 'react'

import Badge, {ColorType} from 'pages/common/components/Badge/Badge'

import css from './TrendBadge.less'

type Props = {
    children: ReactNode
    className?: string
    type?: 'up' | 'down' | 'flat'
}

export default function TrendBadge({children, className, type = 'up'}: Props) {
    return (
        <Badge
            className={classnames(css.trend, className)}
            type={
                type === 'up'
                    ? ColorType.LightSuccess
                    : type === 'down'
                    ? ColorType.LightError
                    : ColorType.Light
            }
        >
            <i className={classnames('material-icons', css.trendIcon)}>
                {`trending_${type}`}
            </i>

            {children}
        </Badge>
    )
}
