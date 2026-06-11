import { ReportingMetricBreakdownTable } from '@repo/reporting'

import { useCustomDashboardTableColumns } from 'domains/reporting/hooks/dashboards/useCustomDashboardTableColumns'
import type { DashboardBreakdownTableProps } from 'domains/reporting/pages/dashboards/types'
import { PERFORMANCE_OVERVIEW_AGENT_COLUMNS } from 'domains/reporting/pages/performance/overview/charts/breakdownTables/PerformanceOverviewAgentTable/columns'
import { useDownloadPerformanceOverviewAgentData } from 'domains/reporting/pages/performance/overview/hooks/agentBreakdown/useDownloadPerformanceOverviewAgentData'
import { usePerformanceOverviewAgentMetrics } from 'domains/reporting/pages/performance/overview/hooks/agentBreakdown/usePerformanceOverviewAgentMetrics'
import { useAgentNameColumns } from 'domains/reporting/pages/performance/utils/useAgentNameColumns'
import { useBreakdownTableActions } from 'domains/reporting/pages/performance/utils/useBreakdownTableActions'

const SEGMENT_EVENT_NAME = 'performance-overview_agent-breakdown-table' as const

export const PerformanceOverviewAgentTable = ({
    chartId,
    withChartMenu,
    dashboard,
    chartConfig,
    customDashboardChartSchema,
}: DashboardBreakdownTableProps) => {
    const { data, loadingStates } = usePerformanceOverviewAgentMetrics()
    const nameColumns = useAgentNameColumns()
    const { DownloadButton, actionMenu } = useBreakdownTableActions({
        chartId,
        withChartMenu,
        dashboard,
        chartName: chartConfig?.label ?? 'Agent',
        segmentEventName: SEGMENT_EVENT_NAME,
        useDownloadData: useDownloadPerformanceOverviewAgentData,
    })
    const { onSaveColumns } = useCustomDashboardTableColumns({
        customDashboardChartSchema,
        dashboard,
    })

    return (
        <ReportingMetricBreakdownTable
            data={data}
            metricColumns={PERFORMANCE_OVERVIEW_AGENT_COLUMNS}
            loadingStates={loadingStates}
            DownloadButton={DownloadButton}
            nameColumns={nameColumns}
            actionMenu={actionMenu}
            chartId={chartId}
            enableSearch
            name={chartConfig?.label}
            customDashboardChartSchema={customDashboardChartSchema}
            onSaveColumns={onSaveColumns}
        />
    )
}
