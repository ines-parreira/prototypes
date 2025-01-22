import {Card} from '@gorgias/analytics-ui-kit'
import classnames from 'classnames'
import React, {ReactNode} from 'react'

import css from 'pages/stats/ChartCard.less'
import {HintTooltip} from 'pages/stats/common/HintTooltip'
import {ChartsActionMenu} from 'pages/stats/custom-reports/ChartsActionMenu/ChartsActionMenu'
import {DashboardChartProps} from 'pages/stats/custom-reports/types'
import {TooltipData} from 'pages/stats/types'

type Props = {
    children?: ReactNode
    className?: string
    hint?: TooltipData
    title: ReactNode
    titleExtra?: ReactNode
    noPadding?: boolean
} & DashboardChartProps

export default function ChartCard({
    children,
    className,
    hint,
    title,
    titleExtra,
    noPadding = false,
    chartId,
    dashboard,
}: Props) {
    return (
        <Card
            className={classnames(className, css.card, {
                [css.noPadding]: noPadding,
            })}
        >
            <div className={css.titleWrapper}>
                <div className={css.title}>
                    <span>{title}</span>
                    {hint && (
                        <HintTooltip
                            className={`${css.tooltipIcon}`}
                            {...hint}
                        />
                    )}
                </div>
                <div className={css.chartsActionMenu}>
                    {titleExtra}
                    {chartId && (
                        <ChartsActionMenu
                            chartId={chartId}
                            dashboard={dashboard}
                        />
                    )}
                </div>
            </div>

            {children}
        </Card>
    )
}
