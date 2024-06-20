import React from 'react'
import classNames from 'classnames'
import {MetricTrend} from 'hooks/reporting/useMetricTrend'
import {getTrendProps} from 'pages/automate/automate-metrics/utils'
import TrendBadge from 'pages/stats/TrendBadge'
import css from './WorkflowOverviewMetrics.less'

interface Props {
    views: number
    automationRate: number
    trendAutomationRate: MetricTrend
    automated: number
    dropOff: number
    ticketCreated: number
}

export const WorkflowOverviewMetrics = ({
    views,
    automationRate,
    trendAutomationRate,
    automated,
    dropOff,
    ticketCreated,
}: Props) => {
    return (
        <div className={css.metricsContainer}>
            <div className={css.firstMetrics}>
                <div className={css.nodeMetric}>
                    <span className={css.metricLabel}>Total views</span>
                    <span className={css.metricValue}>{views}</span>
                </div>

                <div className={css.nodeMetric}>
                    <span className={css.metricLabel}>Automation rate</span>
                    <div className={css.metricTrend}>
                        <span className={css.metricValue}>
                            {automationRate}%
                        </span>
                        <TrendBadge {...getTrendProps(trendAutomationRate)} />
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
                    <span className={css.metricValue}>{automated}</span>
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
                    <span className={css.metricValue}>{dropOff}</span>
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
                    <span className={css.metricValue}>{ticketCreated}</span>
                </div>
            </div>
        </div>
    )
}
