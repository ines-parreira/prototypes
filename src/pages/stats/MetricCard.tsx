import classnames from 'classnames'
import React, {ReactNode} from 'react'

import {Card} from '@gorgias/analytics-ui-kit'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import {HintTooltip} from 'pages/stats/common/HintTooltip'

import css from './MetricCard.less'
import {TooltipData} from './types'

type Props = {
    children: ReactNode
    className?: string
    hint?: TooltipData
    isLoading?: boolean
    title: ReactNode
    tip?: ReactNode
}

export default function MetricCard({
    children,
    className,
    hint,
    isLoading = false,
    title,
    tip,
}: Props) {
    return (
        <Card className={classnames(css.card, className)}>
            <div className={css.title}>
                {title}
                {hint && <HintTooltip {...hint} />}
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
