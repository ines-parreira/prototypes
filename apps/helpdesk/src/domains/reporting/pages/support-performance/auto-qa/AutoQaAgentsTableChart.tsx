import ChartCard from 'domains/reporting/pages/common/components/ChartCard'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { SECTION_TITLES } from 'domains/reporting/pages/support-performance/agents/constants'
import { AutoQAAgentsCardExtra } from 'domains/reporting/pages/support-performance/auto-qa/AutoQAAgentsCardExtra'
import { AutoQAAgentsTable } from 'domains/reporting/pages/support-performance/auto-qa/AutoQAAgentsTable'

export const AUTO_QA_TITLE_TOOLTIP =
    "An agent receives the ticket's scores if they are the assigned agent at the end of the period"

export const AutoQaAgentsTableChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    return (
        <ChartCard
            chartId={chartId}
            dashboard={dashboard}
            title={SECTION_TITLES.AGENT_PERFORMANCE}
            hint={{ title: AUTO_QA_TITLE_TOOLTIP }}
            titleExtra={<AutoQAAgentsCardExtra />}
            noPadding
        >
            <AutoQAAgentsTable />
        </ChartCard>
    )
}
