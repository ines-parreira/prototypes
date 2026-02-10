import ChartCard from 'domains/reporting/pages/common/components/ChartCard'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { AgentsPerformanceCardExtra } from 'domains/reporting/pages/support-performance/agents/AgentsPerformanceCardExtra'
import { AgentsTableWithDefaultState } from 'domains/reporting/pages/support-performance/agents/AgentsTable'
import { SECTION_TITLES } from 'domains/reporting/pages/support-performance/agents/constants'

export const AgentsTableChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    return (
        <ChartCard
            title={SECTION_TITLES.AGENT_PERFORMANCE}
            titleExtra={<AgentsPerformanceCardExtra />}
            chartId={chartId}
            dashboard={dashboard}
            noPadding
        >
            <AgentsTableWithDefaultState />
        </ChartCard>
    )
}
