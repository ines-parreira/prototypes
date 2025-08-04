import { useLocalStorage } from '@repo/hooks'

import { TrendCard } from 'domains/reporting/pages/common/components/TrendCard'
import { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { SupportPerformanceTip } from 'domains/reporting/pages/support-performance/components/SupportPerformanceTip'
import {
    OverviewMetric,
    OverviewMetricConfig,
    STATS_TIPS_VISIBILITY_KEY,
} from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewConfig'
import { MetricName } from 'domains/reporting/services/constants'

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
