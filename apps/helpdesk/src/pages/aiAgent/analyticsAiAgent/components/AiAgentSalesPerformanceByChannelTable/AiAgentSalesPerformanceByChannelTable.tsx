import { ReportingMetricBreakdownTable } from '@repo/reporting'

import { AI_AGENT_SALES_PERFORMANCE_BY_CHANNEL_COLUMNS } from 'pages/aiAgent/analyticsAiAgent/components/AiAgentSalesPerformanceByChannelTable/columns'
import { DownloadAiAgentSalesPerformanceByChannelButton } from 'pages/aiAgent/analyticsAiAgent/components/AiAgentSalesPerformanceByChannelTable/DownloadAiAgentSalesPerformanceByChannelButton'
import { useAiAgentSalesPerformanceByChannelMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentSalesPerformanceByChannelMetrics'
import { formatChannelName } from 'pages/aiAgent/utils/aiAgentMetrics.utils'

export const AiAgentSalesPerformanceByChannelTable = () => {
    const { data = [], loadingStates } =
        useAiAgentSalesPerformanceByChannelMetrics()

    return (
        <ReportingMetricBreakdownTable
            data={data}
            metricColumns={AI_AGENT_SALES_PERFORMANCE_BY_CHANNEL_COLUMNS}
            loadingStates={loadingStates}
            getRowKey={(row) => row.entity}
            DownloadButton={<DownloadAiAgentSalesPerformanceByChannelButton />}
            nameColumns={[
                {
                    accessor: 'entity',
                    label: 'Channel',
                    formatName: formatChannelName,
                },
            ]}
        />
    )
}
