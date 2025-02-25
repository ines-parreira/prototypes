import React from 'react'

import classNames from 'classnames'
import moment from 'moment'

import { WorkflowTrendMetrics } from 'hooks/reporting/automate/types'
import { MetricTrend } from 'hooks/reporting/useMetricTrend'
import { Period } from 'models/stat/types'
import { getTrendPropsToPercent } from 'pages/automate/automate-metrics/utils'
import TrendBadge from 'pages/stats/common/components/TrendBadge'
import { comparedPeriodString } from 'pages/stats/common/utils'

import {
    displayMetric,
    displayPercentMetric,
    isValidNumber,
} from './visualBuilder/utils'

import css from './WorkflowOverviewMetrics.less'

interface Props {
    metrics: Record<WorkflowTrendMetrics, MetricTrend>
    previousPeriod: Period
    workflowUpdateDatetime: string
}

export const WorkflowOverviewMetrics = ({
    metrics,
    previousPeriod,
    workflowUpdateDatetime,
}: Props) => {
    const {
        workflowTotalViews,
        workflowAutomatedInteractions,
        workflowAutomationRate,
        workflowDropoff,
        workflowTicketCreated,
    } = metrics

    const hasWorkflowAutomationRate =
        workflowAutomationRate.data?.prevValue !== 0 ||
        moment(workflowUpdateDatetime).isBefore(
            moment(previousPeriod.start_datetime),
        )

    const shouldDisplayZero = isValidNumber(workflowTotalViews.data?.value)

    return (
        <div className={css.metricsContainer}>
            <div className={css.firstMetrics}>
                <div className={css.nodeMetric}>
                    <span className={css.metricLabel}>Total starts</span>
                    <span className={css.metricValue}>
                        {displayMetric(
                            workflowTotalViews.data?.value,
                            shouldDisplayZero,
                        )}
                    </span>
                </div>

                <div className={css.nodeMetric}>
                    <span className={css.metricLabel}>Automation rate</span>
                    <div className={css.metricTrend}>
                        <span className={css.metricValue}>
                            {displayPercentMetric(
                                workflowAutomationRate.data?.value,
                                shouldDisplayZero,
                            )}
                        </span>
                        {hasWorkflowAutomationRate && (
                            <TrendBadge
                                {...getTrendPropsToPercent(
                                    workflowAutomationRate,
                                )}
                                tooltipData={
                                    workflowAutomationRate.data?.value !==
                                    workflowAutomationRate.data?.prevValue
                                        ? {
                                              period: comparedPeriodString(
                                                  moment(
                                                      previousPeriod.start_datetime,
                                                  ),
                                                  moment(
                                                      previousPeriod.end_datetime,
                                                  ),
                                              ),
                                          }
                                        : undefined
                                }
                                metricFormat="percent"
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
                            css.metricLabelAutomated,
                        )}
                    >
                        Automated
                    </span>
                    <span className={css.metricValue}>
                        {displayMetric(
                            workflowAutomatedInteractions.data?.value,
                            shouldDisplayZero,
                        )}
                    </span>
                </div>
                <div className={css.nodeMetric}>
                    <span
                        className={classNames(
                            css.metricLabel,
                            css.metricLabelDropoff,
                        )}
                    >
                        Drop off
                    </span>
                    <span className={css.metricValue}>
                        {displayMetric(
                            workflowDropoff.data?.value,
                            shouldDisplayZero,
                        )}
                    </span>
                </div>
                <div className={css.nodeMetric}>
                    <span
                        className={classNames(
                            css.metricLabel,
                            css.metricLabelTicket,
                        )}
                    >
                        Tickets created
                    </span>
                    <span className={css.metricValue}>
                        {displayMetric(
                            workflowTicketCreated.data?.value,
                            shouldDisplayZero,
                        )}
                    </span>
                </div>
            </div>
        </div>
    )
}
