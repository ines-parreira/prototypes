import {data} from 'browserslist'
import classnames from 'classnames'
import React, {ReactNode} from 'react'

import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import {HintTooltip} from 'pages/stats/common/HintTooltip'

import Card from './Card'
import css from './MetricCard.less'
import {TooltipData} from './types'

type Props = {
    children: ReactNode
    className?: string
    hint?: TooltipData
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
                {hint && <HintTooltip {...hint} />}
                <div className={css.trendBadge}>{trendBadge}</div>
            </div>

            {children}

            {tip &&
                (!data || isLoading ? (
                    <Skeleton height={132} className={css.tip} inline />
                ) : (
                    <div className={css.tip}>{tip}</div>
                ))}
        </Card>
    )
}
