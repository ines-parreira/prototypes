import { ReportingMetricBreakdownTable } from '@repo/reporting'

import { useCustomDashboardTableColumns } from 'domains/reporting/hooks/dashboards/useCustomDashboardTableColumns'
import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type {
    DashboardChartSchema,
    DashboardSchema,
} from 'domains/reporting/pages/dashboards/types'
import {
    PERFORMANCE_OVERVIEW_CHANNEL_COLUMNS,
    PERFORMANCE_OVERVIEW_CHANNEL_NAME_COLUMNS,
} from 'domains/reporting/pages/performance/overview/charts/breakdownTables/PerformanceOverviewChannelTable/columns'
import { useDownloadPerformanceOverviewChannelData } from 'domains/reporting/pages/performance/overview/hooks/channelBreakdown/useDownloadPerformanceOverviewChannelData'
import { usePerformanceOverviewChannelMetrics } from 'domains/reporting/pages/performance/overview/hooks/channelBreakdown/usePerformanceOverviewChannelMetrics'
import {
    DownloadTableButton,
    useDownloadTableAction,
} from 'pages/aiAgent/analyticsOverview/components/shared/DownloadTableButton'

const SEGMENT_EVENT_NAME =
    'performance-overview_channel-breakdown-table' as const

type Props = {
    chartId?: string
    withChartMenu?: boolean
    dashboard?: DashboardSchema
    chartConfig?: { label: string }
    customDashboardChartSchema?: DashboardChartSchema
}

export const PerformanceOverviewChannelTable = ({
    chartId,
    withChartMenu,
    dashboard,
    chartConfig,
    customDashboardChartSchema,
}: Props) => {
    const { data, loadingStates } = usePerformanceOverviewChannelMetrics()
    const downloadData = useDownloadPerformanceOverviewChannelData()
    const exportCsvAction = useDownloadTableAction({
        ...downloadData,
        segmentEventName: SEGMENT_EVENT_NAME,
    })
    const withMenu = withChartMenu && chartId
    const { onSaveColumns } = useCustomDashboardTableColumns({
        customDashboardChartSchema,
        dashboard,
    })

    return (
        <ReportingMetricBreakdownTable
            data={data}
            metricColumns={PERFORMANCE_OVERVIEW_CHANNEL_COLUMNS}
            loadingStates={loadingStates}
            DownloadButton={
                !withMenu ? (
                    <DownloadTableButton
                        {...downloadData}
                        segmentEventName={SEGMENT_EVENT_NAME}
                    />
                ) : undefined
            }
            nameColumns={PERFORMANCE_OVERVIEW_CHANNEL_NAME_COLUMNS}
            actionMenu={
                withMenu ? (
                    <ChartsActionMenu
                        chartId={chartId}
                        chartName="Channel"
                        dashboard={dashboard}
                        exportCsvAction={exportCsvAction}
                    />
                ) : undefined
            }
            chartId={chartId}
            name={chartConfig?.label}
            customDashboardChartSchema={customDashboardChartSchema}
            onSaveColumns={onSaveColumns}
        />
    )
}
