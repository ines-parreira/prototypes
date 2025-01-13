import {Card} from '@gorgias/analytics-ui-kit'
import classnames from 'classnames'
import React, {ReactNode} from 'react'

import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import {HintTooltip} from 'pages/stats/common/HintTooltip'
import {ChartsActionMenu} from 'pages/stats/custom-reports/ChartsActionMenu/ChartsActionMenu'
import css from 'pages/stats/MetricCard.less'
import {TooltipData} from 'pages/stats/types'

type Props = {
    children: ReactNode
    className?: string
    hint?: TooltipData
    isLoading?: boolean
    title: ReactNode
    tip?: ReactNode
    chartId?: string
}

export default function MetricCard({
    children,
    className,
    hint,
    isLoading = false,
    chartId,
    title,
    tip,
}: Props) {
    return (
        <Card className={classnames(css.card, className)}>
            <div className={css.wrapper}>
                <div className={css.title}>
                    {title}
                    {hint && <HintTooltip {...hint} />}
                </div>
                {chartId && <ChartsActionMenu chartId={chartId} />}
            </div>

            {children}

            {tip &&
                (isLoading ? (
                    <Skeleton height={132} className={css.tip} inline />
                ) : (
                    <div className={css.tip}>{tip}</div>
                ))}
        </Card>
    )
}
