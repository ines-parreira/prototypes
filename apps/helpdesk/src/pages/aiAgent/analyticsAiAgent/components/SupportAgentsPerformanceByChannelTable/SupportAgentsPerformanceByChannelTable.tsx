import { ReportingMetricBreakdownTable } from '@repo/reporting'

import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import {
    SUPPORT_AGENTS_PERFORMANCE_BY_CHANNEL_COLUMNS,
    SUPPORT_AGENTS_PERFORMANCE_BY_CHANNEL_NAME_COLUMNS,
} from 'pages/aiAgent/analyticsAiAgent/components/SupportAgentsPerformanceByChannelTable/columns'
import { DownloadSupportAgentsPerformanceByChannelButton } from 'pages/aiAgent/analyticsAiAgent/components/SupportAgentsPerformanceByChannelTable/DownloadSupportAgentsPerformanceByChannelButton'
import { useSupportAgentsPerformanceByChannelMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useSupportAgentsPerformanceByChannelMetrics'

type Props = {
    chartId?: string
    withChartMenu?: boolean
}

export const SupportAgentsPerformanceByChannelTable = ({
    chartId,
    withChartMenu,
}: Props) => {
    const { data = [], loadingStates } =
        useSupportAgentsPerformanceByChannelMetrics()

    return (
        <ReportingMetricBreakdownTable
            data={data}
            metricColumns={SUPPORT_AGENTS_PERFORMANCE_BY_CHANNEL_COLUMNS}
            loadingStates={loadingStates}
            DownloadButton={<DownloadSupportAgentsPerformanceByChannelButton />}
            nameColumns={SUPPORT_AGENTS_PERFORMANCE_BY_CHANNEL_NAME_COLUMNS}
            actionMenu={
                withChartMenu && chartId ? (
                    <ChartsActionMenu chartId={chartId} chartName="Channel" />
                ) : undefined
            }
            chartId={chartId}
        />
    )
}
