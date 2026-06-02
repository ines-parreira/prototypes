import { ReportingMetricBreakdownTable } from '@repo/reporting'

import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import {
    PERFORMANCE_OVERVIEW_CHANNEL_COLUMNS,
    PERFORMANCE_OVERVIEW_CHANNEL_NAME_COLUMNS,
} from 'domains/reporting/pages/performance/overview/charts/breakdownTables/PerformanceOverviewChannelTable/columns'
import { DownloadPerformanceOverviewChannelButton } from 'domains/reporting/pages/performance/overview/charts/breakdownTables/PerformanceOverviewChannelTable/DownloadPerformanceOverviewChannelButton'
import { usePerformanceOverviewChannelMetrics } from 'domains/reporting/pages/performance/overview/hooks/channelBreakdown/usePerformanceOverviewChannelMetrics'

type Props = {
    chartId?: string
    withChartMenu?: boolean
}

export const PerformanceOverviewChannelTable = ({
    chartId,
    withChartMenu,
}: Props) => {
    const { data, loadingStates } = usePerformanceOverviewChannelMetrics()

    return (
        <ReportingMetricBreakdownTable
            data={data}
            metricColumns={PERFORMANCE_OVERVIEW_CHANNEL_COLUMNS}
            loadingStates={loadingStates}
            DownloadButton={<DownloadPerformanceOverviewChannelButton />}
            nameColumns={PERFORMANCE_OVERVIEW_CHANNEL_NAME_COLUMNS}
            actionMenu={
                withChartMenu && chartId ? (
                    <ChartsActionMenu chartId={chartId} chartName="Channel" />
                ) : undefined
            }
            chartId={chartId}
        />
    )
}
