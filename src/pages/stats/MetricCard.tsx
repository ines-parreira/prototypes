import {data} from 'browserslist'
import classnames from 'classnames'
import React, {ReactNode} from 'react'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'

import IconTooltip from 'pages/common/forms/Label/IconTooltip'

import Card from './Card'
import css from './MetricCard.less'

type Props = {
    children: ReactNode
    className?: string
    hint?: ReactNode
    isLoading?: boolean
    title: ReactNode
    tip?: ReactNode
    trendBadge?: ReactNode
}

export default function MetricCard({
    children,
    className,
    hint,
    isLoading = false,
    title,
    tip,
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

            {tip &&
                (!data || isLoading ? (
                    <Skeleton height={132} className={css.tooltip} />
                ) : (
                    <div className={css.tooltip}>{tip}</div>
                ))}
        </Card>
    )
}
