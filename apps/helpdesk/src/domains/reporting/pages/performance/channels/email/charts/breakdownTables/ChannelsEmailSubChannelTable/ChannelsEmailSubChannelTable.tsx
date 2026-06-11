import { ReportingMetricBreakdownTable } from '@repo/reporting'

import { useCustomDashboardTableColumns } from 'domains/reporting/hooks/dashboards/useCustomDashboardTableColumns'
import type { DashboardBreakdownTableProps } from 'domains/reporting/pages/dashboards/types'
import {
    CHANNELS_EMAIL_SUB_CHANNEL_COLUMNS,
    CHANNELS_EMAIL_SUB_CHANNEL_NAME_COLUMNS,
} from 'domains/reporting/pages/performance/channels/email/charts/breakdownTables/ChannelsEmailSubChannelTable/columns'
import { useDownloadPerformanceChannelsEmailSubChannelData } from 'domains/reporting/pages/performance/channels/email/hooks/subChannelBreakdown/useDownloadPerformanceChannelsEmailSubChannelData'
import { usePerformanceChannelsEmailSubChannelMetrics } from 'domains/reporting/pages/performance/channels/email/hooks/subChannelBreakdown/usePerformanceChannelsEmailSubChannelMetrics'
import { useBreakdownTableActions } from 'domains/reporting/pages/performance/utils/useBreakdownTableActions'

const SEGMENT_EVENT_NAME =
    'performance-channels-email_sub-channel-breakdown-table' as const

export const ChannelsEmailSubChannelTable = ({
    chartId,
    withChartMenu,
    dashboard,
    chartConfig,
    customDashboardChartSchema,
}: DashboardBreakdownTableProps) => {
    const { data, loadingStates } =
        usePerformanceChannelsEmailSubChannelMetrics()
    const { DownloadButton, actionMenu } = useBreakdownTableActions({
        chartId,
        withChartMenu,
        dashboard,
        chartName: chartConfig?.label ?? 'Sub-channel',
        segmentEventName: SEGMENT_EVENT_NAME,
        useDownloadData: useDownloadPerformanceChannelsEmailSubChannelData,
    })
    const { onSaveColumns } = useCustomDashboardTableColumns({
        customDashboardChartSchema,
        dashboard,
    })

    return (
        <ReportingMetricBreakdownTable
            data={data}
            metricColumns={CHANNELS_EMAIL_SUB_CHANNEL_COLUMNS}
            loadingStates={loadingStates}
            DownloadButton={DownloadButton}
            nameColumns={CHANNELS_EMAIL_SUB_CHANNEL_NAME_COLUMNS}
            actionMenu={actionMenu}
            chartId={chartId}
            name={chartConfig?.label}
            customDashboardChartSchema={customDashboardChartSchema}
            onSaveColumns={onSaveColumns}
        />
    )
}
