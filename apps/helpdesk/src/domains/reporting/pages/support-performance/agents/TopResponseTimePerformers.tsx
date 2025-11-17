import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import AgentsShoutOut from 'domains/reporting/pages/support-performance/agents/AgentsShoutOut'
import {
    AgentsShoutOutsConfig,
    TopPerformersChart,
} from 'domains/reporting/pages/support-performance/agents/AgentsShoutOutsConfig'

export const TopResponseTimePerformers = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const config =
        AgentsShoutOutsConfig[TopPerformersChart.TopResponseTimePerformers]
    return (
        <AgentsShoutOut {...config} chartId={chartId} dashboard={dashboard} />
    )
}
