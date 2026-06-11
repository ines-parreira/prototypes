import { ReportingMetricBreakdownTable } from '@repo/reporting'

import { useCustomDashboardTableColumns } from 'domains/reporting/hooks/dashboards/useCustomDashboardTableColumns'

import type { DashboardBreakdownTableProps } from 'domains/reporting/pages/dashboards/types'
import { CHANNELS_EMAIL_AGENT_COLUMNS } from 'domains/reporting/pages/performance/channels/email/charts/breakdownTables/ChannelsEmailAgentTable/columns'
import { useDownloadPerformanceChannelsEmailAgentData } from 'domains/reporting/pages/performance/channels/email/hooks/agentBreakdown/useDownloadPerformanceChannelsEmailAgentData'
import { usePerformanceChannelsEmailAgentMetrics } from 'domains/reporting/pages/performance/channels/email/hooks/agentBreakdown/usePerformanceChannelsEmailAgentMetrics'
import { useAgentNameColumns } from 'domains/reporting/pages/performance/utils/useAgentNameColumns'
import { useBreakdownTableActions } from 'domains/reporting/pages/performance/utils/useBreakdownTableActions'

const SEGMENT_EVENT_NAME =
    'performance-channels-email_agent-breakdown-table' as const

export const ChannelsEmailAgentTable = ({
    chartId,
    withChartMenu,
    dashboard,
    chartConfig,
    customDashboardChartSchema,
}: DashboardBreakdownTableProps) => {
    const { data, loadingStates } = usePerformanceChannelsEmailAgentMetrics()
    const nameColumns = useAgentNameColumns()
    const { DownloadButton, actionMenu } = useBreakdownTableActions({
        chartId,
        withChartMenu,
        dashboard,
        chartName: chartConfig?.label ?? 'Agent',
        segmentEventName: SEGMENT_EVENT_NAME,
        useDownloadData: useDownloadPerformanceChannelsEmailAgentData,
    })
    const { onSaveColumns } = useCustomDashboardTableColumns({
        customDashboardChartSchema,
        dashboard,
    })

    return (
        <ReportingMetricBreakdownTable
            data={data}
            metricColumns={CHANNELS_EMAIL_AGENT_COLUMNS}
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
