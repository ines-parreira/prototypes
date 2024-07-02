import React from 'react'
import classNames from 'classnames'
import {MetricTrend} from 'hooks/reporting/useMetricTrend'
import {
    getTrendProps,
    toPercentage,
} from 'pages/automate/automate-metrics/utils'
import TrendBadge from 'pages/stats/TrendBadge'
import {WorkflowTrendMetrics} from 'hooks/reporting/automate/types'
import css from './WorkflowOverviewMetrics.less'
import {displayMetric} from './visualBuilder/utils'

interface Props {
    metrics: Record<WorkflowTrendMetrics, MetricTrend>
}

export const WorkflowOverviewMetrics = ({metrics}: Props) => {
    const {
        workflowTotalViews,
        workflowAutomatedInteractions,
        workflowAutomationRate,
        workflowDropoff,
        workflowTicketCreated,
    } = metrics

    const hasWorkflowAutomationRate =
        workflowAutomationRate.data?.value !== 0 &&
        workflowAutomationRate.data?.prevValue !== 0

    return (
        <div className={css.metricsContainer}>
            <div className={css.firstMetrics}>
                <div className={css.nodeMetric}>
                    <span className={css.metricLabel}>Total views</span>
                    <span className={css.metricValue}>
                        {displayMetric(workflowTotalViews.data?.value)}
                    </span>
                </div>

                <div className={css.nodeMetric}>
                    <span className={css.metricLabel}>Automation rate</span>
                    <div className={css.metricTrend}>
                        <span className={css.metricValue}>
                            {workflowAutomationRate.data?.value === 0
                                ? '-'
                                : toPercentage(
                                      workflowAutomationRate.data?.value ?? 0
                                  )}
                        </span>
                        {hasWorkflowAutomationRate && (
                            <TrendBadge
                                {...getTrendProps(workflowAutomationRate)}
                            />
                        )}
                    </div>
                </div>
            </div>
            <div className={css.secondMetrics}>
                <div className={css.nodeMetric}>
                    <span
                        className={classNames(
                            css.metricLabel,
                            css.metricLabelAutomated
                        )}
                    >
                        Automated
                    </span>
                    <span className={css.metricValue}>
                        {displayMetric(
                            workflowAutomatedInteractions.data?.value
                        )}
                    </span>
                </div>
                <div className={css.nodeMetric}>
                    <span
                        className={classNames(
                            css.metricLabel,
                            css.metricLabelDropoff
                        )}
                    >
                        Drop off
                    </span>
                    <span className={css.metricValue}>
                        {displayMetric(workflowDropoff.data?.value)}
                    </span>
                </div>
                <div className={css.nodeMetric}>
                    <span
                        className={classNames(
                            css.metricLabel,
                            css.metricLabelTicket
                        )}
                    >
                        Ticket created
                    </span>
                    <span className={css.metricValue}>
                        {displayMetric(workflowTicketCreated.data?.value)}
                    </span>
                </div>
            </div>
        </div>
    )
}
