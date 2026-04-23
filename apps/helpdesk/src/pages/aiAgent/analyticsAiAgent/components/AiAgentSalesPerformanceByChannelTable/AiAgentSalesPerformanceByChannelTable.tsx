import { ReportingMetricBreakdownTable } from '@repo/reporting'

import {
    AI_AGENT_SALES_PERFORMANCE_BY_CHANNEL_COLUMNS,
    AI_AGENT_SALES_PERFORMANCE_BY_CHANNEL_NAME_COLUMNS,
} from 'pages/aiAgent/analyticsAiAgent/components/AiAgentSalesPerformanceByChannelTable/columns'
import { DownloadAiAgentSalesPerformanceByChannelButton } from 'pages/aiAgent/analyticsAiAgent/components/AiAgentSalesPerformanceByChannelTable/DownloadAiAgentSalesPerformanceByChannelButton'
import { useAiAgentSalesPerformanceByChannelMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentSalesPerformanceByChannelMetrics'

type Props = {
    chartId?: string
}

export const AiAgentSalesPerformanceByChannelTable = ({ chartId }: Props) => {
    const { data = [], loadingStates } =
        useAiAgentSalesPerformanceByChannelMetrics()

    return (
        <ReportingMetricBreakdownTable
            data={data}
            metricColumns={AI_AGENT_SALES_PERFORMANCE_BY_CHANNEL_COLUMNS}
            loadingStates={loadingStates}
            DownloadButton={<DownloadAiAgentSalesPerformanceByChannelButton />}
            nameColumns={AI_AGENT_SALES_PERFORMANCE_BY_CHANNEL_NAME_COLUMNS}
            chartId={chartId}
        />
    )
}
