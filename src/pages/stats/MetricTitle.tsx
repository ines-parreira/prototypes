import classnames from 'classnames'
import React, {ReactNode} from 'react'

import IconTooltip from 'pages/common/forms/Label/IconTooltip'

import css from './MetricTitle.less'

type Props = {
    children: ReactNode
    className?: string
    hint?: ReactNode
    trendBadge?: ReactNode
}

export default function MetricTitle({
    children,
    className,
    hint,
    trendBadge,
}: Props) {
    return (
        <div className={classnames(className, css.title)}>
            {children}

            {hint && <IconTooltip>{hint}</IconTooltip>}

            {trendBadge}
        </div>
    )
}
