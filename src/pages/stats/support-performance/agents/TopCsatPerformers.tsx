import { DashboardChartProps } from 'pages/stats/dashboards/types'
import AgentsShoutOut from 'pages/stats/support-performance/agents/AgentsShoutOut'
import {
    AgentsShoutOutsConfig,
    TopPerformersChart,
} from 'pages/stats/support-performance/agents/AgentsShoutOutsConfig'

export const TopCsatPerformers = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const config = AgentsShoutOutsConfig[TopPerformersChart.TopCSATPerformers]
    return (
        <AgentsShoutOut {...config} chartId={chartId} dashboard={dashboard} />
    )
}
