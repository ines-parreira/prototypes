import { ReactNode } from 'react'

import classnames from 'classnames'

import { Card } from '@gorgias/analytics-ui-kit'
import { Skeleton } from '@gorgias/merchant-ui-kit'

import css from 'pages/stats/common/components/MetricCard.less'
import { HintTooltip } from 'pages/stats/common/HintTooltip'
import { ChartsActionMenu } from 'pages/stats/dashboards/ChartsActionMenu/ChartsActionMenu'
import { DashboardChartProps } from 'pages/stats/dashboards/types'
import { TooltipData } from 'pages/stats/types'

type Props = {
    children: ReactNode
    className?: string
    hint?: TooltipData
    isLoading?: boolean
    title: ReactNode
    tip?: ReactNode
    'data-candu-id'?: string
} & DashboardChartProps

export default function MetricCard({
    children,
    className,
    hint,
    isLoading = false,
    dashboard,
    chartId,
    title,
    tip,
    ...props
}: Props) {
    return (
        <Card className={classnames(css.card, className)}>
            <div data-candu-id={props['data-candu-id']}>
                <div className={css.wrapper}>
                    <div className={css.title}>
                        {title}
                        {hint && <HintTooltip {...hint} />}
                    </div>
                    {chartId && (
                        <ChartsActionMenu
                            chartId={chartId}
                            dashboard={dashboard}
                            chartName={title}
                        />
                    )}
                </div>

                {children}

                {tip &&
                    (isLoading ? (
                        <Skeleton height={132} className={css.tip} inline />
                    ) : (
                        <div className={css.tip}>{tip}</div>
                    ))}
            </div>
        </Card>
    )
}
