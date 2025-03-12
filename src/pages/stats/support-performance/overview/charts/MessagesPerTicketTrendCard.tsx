import React from 'react'

import useLocalStorage from 'hooks/useLocalStorage'
import { TrendCard } from 'pages/stats/common/components/TrendCard'
import { DashboardChartProps } from 'pages/stats/dashboards/types'
import {
    OverviewMetric,
    OverviewMetricConfig,
    STATS_TIPS_VISIBILITY_KEY,
} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'
import { SupportPerformanceTip } from 'pages/stats/SupportPerformanceTip'
import { MetricName } from 'services/reporting/constants'

export const MessagesPerTicketTrendCard = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const [areTipsVisible] = useLocalStorage(STATS_TIPS_VISIBILITY_KEY, true)

    return (
        <TrendCard
            {...OverviewMetricConfig[OverviewMetric.MessagesPerTicket]}
            chartId={chartId}
            dashboard={dashboard}
            drillDownMetric={OverviewMetric.MessagesPerTicket}
            tip={
                areTipsVisible && (
                    <SupportPerformanceTip
                        metric={MetricName.MessagesPerTicket}
                        {...OverviewMetricConfig[
                            OverviewMetric.MessagesPerTicket
                        ]}
                    />
                )
            }
        />
    )
}
