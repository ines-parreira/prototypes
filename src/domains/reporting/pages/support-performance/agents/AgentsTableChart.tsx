import ChartCard from 'domains/reporting/pages/common/components/ChartCard'
import { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { AgentsPerformanceCardExtra } from 'domains/reporting/pages/support-performance/agents/AgentsPerformanceCardExtra'
import { AgentsTableWithDefaultState } from 'domains/reporting/pages/support-performance/agents/AgentsTable'

export const AGENT_PERFORMANCE_SECTION_TITLE = 'Agent Performance'

export const AgentsTableChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    return (
        <ChartCard
            title={AGENT_PERFORMANCE_SECTION_TITLE}
            titleExtra={<AgentsPerformanceCardExtra />}
            chartId={chartId}
            dashboard={dashboard}
            noPadding
        >
            <AgentsTableWithDefaultState />
        </ChartCard>
    )
}
