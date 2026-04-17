import { ReportingMetricBreakdownTable } from '@repo/reporting'

import { ALL_AGENTS_PERFORMANCE_BY_CHANNEL_COLUMNS } from 'pages/aiAgent/analyticsAiAgent/components/AllAgentsPerformanceByChannelTable/columns'
import { DownloadAllAgentsPerformanceByChannelButton } from 'pages/aiAgent/analyticsAiAgent/components/AllAgentsPerformanceByChannelTable/DownloadAllAgentsPerformanceByChannelButton'
import { useAllAgentsPerformanceByChannelMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useAllAgentsPerformanceByChannelMetrics'
import { formatChannelName } from 'pages/aiAgent/utils/aiAgentMetrics.utils'

export const AllAgentsPerformanceByChannelTable = () => {
    const { data = [], loadingStates } =
        useAllAgentsPerformanceByChannelMetrics()

    return (
        <ReportingMetricBreakdownTable
            data={data}
            metricColumns={ALL_AGENTS_PERFORMANCE_BY_CHANNEL_COLUMNS}
            loadingStates={loadingStates}
            DownloadButton={<DownloadAllAgentsPerformanceByChannelButton />}
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
