import { ReportingMetricBreakdownTable } from '@repo/reporting'

import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import {
    AI_AGENT_SALES_PERFORMANCE_BY_CHANNEL_COLUMNS,
    AI_AGENT_SALES_PERFORMANCE_BY_CHANNEL_NAME_COLUMNS,
} from 'pages/aiAgent/analyticsAiAgent/components/AiAgentSalesPerformanceByChannelTable/columns'
import { DownloadAiAgentSalesPerformanceByChannelButton } from 'pages/aiAgent/analyticsAiAgent/components/AiAgentSalesPerformanceByChannelTable/DownloadAiAgentSalesPerformanceByChannelButton'
import { useAiAgentSalesPerformanceByChannelMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentSalesPerformanceByChannelMetrics'

type Props = {
    chartId?: string
    withChartMenu?: boolean
}

export const AiAgentSalesPerformanceByChannelTable = ({
    chartId,
    withChartMenu,
}: Props) => {
    const { data = [], loadingStates } =
        useAiAgentSalesPerformanceByChannelMetrics()

    return (
        <ReportingMetricBreakdownTable
            data={data}
            metricColumns={AI_AGENT_SALES_PERFORMANCE_BY_CHANNEL_COLUMNS}
            loadingStates={loadingStates}
            DownloadButton={<DownloadAiAgentSalesPerformanceByChannelButton />}
            nameColumns={AI_AGENT_SALES_PERFORMANCE_BY_CHANNEL_NAME_COLUMNS}
            actionMenu={
                withChartMenu && chartId ? (
                    <ChartsActionMenu chartId={chartId} chartName="Channel" />
                ) : undefined
            }
            chartId={chartId}
        />
    )
}
