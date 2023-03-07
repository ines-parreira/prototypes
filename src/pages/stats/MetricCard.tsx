import classnames from 'classnames'
import React, {ReactNode} from 'react'

import IconTooltip from 'pages/common/forms/Label/IconTooltip'

import Card from './Card'
import css from './MetricCard.less'

type Props = {
    children: ReactNode
    className?: string
    hint?: ReactNode
    title: ReactNode
    tooltip?: ReactNode
    trendBadge?: ReactNode
}

export default function MetricCard({
    children,
    className,
    hint,
    title,
    tooltip,
    trendBadge,
}: Props) {
    return (
        <Card className={classnames(css.card, className)}>
            <div className={css.title}>
                {title}

                {hint && <IconTooltip>{hint}</IconTooltip>}

                <div className={css.trendBadge}>{trendBadge}</div>
            </div>

            {children}

            {tooltip && <div className={css.tooltip}>{tooltip}</div>}
        </Card>
    )
}
