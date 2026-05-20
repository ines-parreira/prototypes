import { ReportingMetricBreakdownTable } from '@repo/reporting'

import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import {
    ALL_AGENTS_PERFORMANCE_BY_CHANNEL_COLUMNS,
    ALL_AGENTS_PERFORMANCE_BY_CHANNEL_NAME_COLUMNS,
} from 'pages/aiAgent/analyticsAiAgent/components/AllAgentsPerformanceByChannelTable/columns'
import { DownloadAllAgentsPerformanceByChannelButton } from 'pages/aiAgent/analyticsAiAgent/components/AllAgentsPerformanceByChannelTable/DownloadAllAgentsPerformanceByChannelButton'
import { useAllAgentsPerformanceByChannelMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useAllAgentsPerformanceByChannelMetrics'

type Props = {
    chartId?: string
    withChartMenu?: boolean
}

export const AllAgentsPerformanceByChannelTable = ({
    chartId,
    withChartMenu,
}: Props) => {
    const { data = [], loadingStates } =
        useAllAgentsPerformanceByChannelMetrics()

    return (
        <ReportingMetricBreakdownTable
            data={data}
            metricColumns={ALL_AGENTS_PERFORMANCE_BY_CHANNEL_COLUMNS}
            loadingStates={loadingStates}
            DownloadButton={<DownloadAllAgentsPerformanceByChannelButton />}
            nameColumns={ALL_AGENTS_PERFORMANCE_BY_CHANNEL_NAME_COLUMNS}
            actionMenu={
                withChartMenu && chartId ? (
                    <ChartsActionMenu chartId={chartId} chartName="Channel" />
                ) : undefined
            }
            chartId={chartId}
        />
    )
}
