import classnames from 'classnames'
import React, {ReactNode} from 'react'

import css from './MetricTooltip.less'

type Props = {
    children: ReactNode
    className?: string
    title: ReactNode
    type?: 'neutral' | 'error' | 'success' | 'light-error' | 'light-success'
}

export default function MetricTooltip({
    children,
    className,
    title,
    type = 'neutral',
}: Props) {
    return (
        <div className={classnames(css.wrapper, className, css[type])}>
            <div className={classnames('body-semibold', css.title)}>
                {title}
            </div>

            <div className="body-regular">{children}</div>
        </div>
    )
}
