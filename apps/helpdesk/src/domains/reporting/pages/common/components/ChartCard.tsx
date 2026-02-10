import type { ReactNode } from 'react'
import React from 'react'

import classnames from 'classnames'

import { Card } from '@gorgias/analytics-ui-kit'

import css from 'domains/reporting/pages/common/components/ChartCard.less'
import { HintTooltip } from 'domains/reporting/pages/common/HintTooltip'
import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import type { TooltipData } from 'domains/reporting/pages/types'

type Props = {
    children?: ReactNode
    className?: string
    hint?: TooltipData
    title: ReactNode
    titleExtra?: ReactNode
    headerSlot?: ReactNode
    noPadding?: boolean
    canduId?: string
} & DashboardChartProps

export default function ChartCard({
    children,
    className,
    hint,
    title,
    titleExtra,
    headerSlot,
    noPadding = false,
    chartId,
    dashboard,
    canduId,
}: Props) {
    return (
        <Card
            className={classnames(className, css.card, {
                [css.noPadding]: noPadding,
            })}
        >
            {headerSlot && <div>{headerSlot}</div>}
            <div
                className={css.titleWrapper}
                {...(canduId ? { 'data-candu-id': `${canduId}-title` } : {})}
            >
                <div className={css.title}>
                    <span>{title}</span>
                    {hint && (
                        <HintTooltip className={css.tooltipIcon} {...hint} />
                    )}
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
        </Card>
    )
}
