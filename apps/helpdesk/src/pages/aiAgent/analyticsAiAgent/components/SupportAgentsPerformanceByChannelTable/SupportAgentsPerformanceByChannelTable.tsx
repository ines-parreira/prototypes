import { ReportingMetricBreakdownTable } from '@repo/reporting'

import { SUPPORT_AGENTS_PERFORMANCE_BY_CHANNEL_COLUMNS } from 'pages/aiAgent/analyticsAiAgent/components/SupportAgentsPerformanceByChannelTable/columns'
import { DownloadSupportAgentsPerformanceByChannelButton } from 'pages/aiAgent/analyticsAiAgent/components/SupportAgentsPerformanceByChannelTable/DownloadSupportAgentsPerformanceByChannelButton'
import { useSupportAgentsPerformanceByChannelMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useSupportAgentsPerformanceByChannelMetrics'
import { formatChannelName } from 'pages/aiAgent/utils/aiAgentMetrics.utils'

export const SupportAgentsPerformanceByChannelTable = () => {
    const { data = [], loadingStates } =
        useSupportAgentsPerformanceByChannelMetrics()

    return (
        <ReportingMetricBreakdownTable
            data={data}
            metricColumns={SUPPORT_AGENTS_PERFORMANCE_BY_CHANNEL_COLUMNS}
            loadingStates={loadingStates}
            DownloadButton={<DownloadSupportAgentsPerformanceByChannelButton />}
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
