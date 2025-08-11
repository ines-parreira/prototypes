import { ReactNode } from 'react'

import classnames from 'classnames'

import { Card } from '@gorgias/analytics-ui-kit'
import { Skeleton } from '@gorgias/axiom'

import css from 'domains/reporting/pages/common/components/MetricCard.less'
import { HintTooltip } from 'domains/reporting/pages/common/HintTooltip'
import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { TooltipData } from 'domains/reporting/pages/types'

type Props = {
    children: ReactNode
    className?: string
    hint?: TooltipData
    isLoading?: boolean
    title: ReactNode
    tip?: ReactNode
    'data-candu-id'?: string
    titleExtra?: ReactNode
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
    titleExtra,
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
                    <div className={css.chartsActionMenu}>
                        {titleExtra}
                        {chartId && (
                            <ChartsActionMenu
                                chartId={chartId}
                                dashboard={dashboard}
                                chartName={title}
                            />
                        )}
                    </div>
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
