import { ReportingMetricBreakdownTable } from '@repo/reporting'

import { useCustomDashboardTableColumns } from 'domains/reporting/hooks/dashboards/useCustomDashboardTableColumns'
import type { DashboardBreakdownTableProps } from 'domains/reporting/pages/dashboards/types'
import { CHANNELS_VOICE_AGENT_COLUMNS } from 'domains/reporting/pages/performance/channels/voice/charts/breakdownTables/ChannelsVoiceAgentTable/columns'
import { useChannelsVoiceAgentMetrics } from 'domains/reporting/pages/performance/channels/voice/hooks/agentBreakdown/useChannelsVoiceAgentMetrics'
import { useDownloadChannelsVoiceAgentData } from 'domains/reporting/pages/performance/channels/voice/hooks/agentBreakdown/useDownloadChannelsVoiceAgentData'
import { useAgentNameColumns } from 'domains/reporting/pages/performance/utils/useAgentNameColumns'
import { useBreakdownTableActions } from 'domains/reporting/pages/performance/utils/useBreakdownTableActions'

const SEGMENT_EVENT_NAME =
    'performance-channels-voice_agent-breakdown-table' as const

export const ChannelsVoiceAgentTable = ({
    chartId,
    withChartMenu,
    dashboard,
    chartConfig,
    customDashboardChartSchema,
}: DashboardBreakdownTableProps) => {
    const { data, loadingStates } = useChannelsVoiceAgentMetrics()
    const nameColumns = useAgentNameColumns()
    const { DownloadButton, actionMenu } = useBreakdownTableActions({
        chartId,
        withChartMenu,
        dashboard,
        chartName: chartConfig?.label ?? 'Agent',
        segmentEventName: SEGMENT_EVENT_NAME,
        useDownloadData: useDownloadChannelsVoiceAgentData,
    })
    const { onSaveColumns } = useCustomDashboardTableColumns({
        customDashboardChartSchema,
        dashboard,
    })

    return (
        <ReportingMetricBreakdownTable
            data={data}
            metricColumns={CHANNELS_VOICE_AGENT_COLUMNS}
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
