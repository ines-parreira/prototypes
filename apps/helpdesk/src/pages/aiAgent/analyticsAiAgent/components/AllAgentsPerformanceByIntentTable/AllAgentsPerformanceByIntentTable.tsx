import { ReportingMetricBreakdownTable } from '@repo/reporting'

import { ALL_AGENTS_PERFORMANCE_BY_INTENT_COLUMNS } from 'pages/aiAgent/analyticsAiAgent/components/AllAgentsPerformanceByIntentTable/columns'
import { DownloadAllAgentsPerformanceByIntentButton } from 'pages/aiAgent/analyticsAiAgent/components/AllAgentsPerformanceByIntentTable/DownloadAllAgentsPerformanceByIntentButton'
import { useAllAgentsPerformanceByIntentMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useAllAgentsPerformanceByIntentMetrics'

export const AllAgentsPerformanceByIntentTable = () => {
    const { data = [], loadingStates } =
        useAllAgentsPerformanceByIntentMetrics()

    return (
        <ReportingMetricBreakdownTable
            data={data}
            metricColumns={ALL_AGENTS_PERFORMANCE_BY_INTENT_COLUMNS}
            loadingStates={loadingStates}
            getRowKey={(row) => row.entity}
            DownloadButton={<DownloadAllAgentsPerformanceByIntentButton />}
            nameColumns={[
                { accessor: 'intentL1', label: 'Intent L1' },
                { accessor: 'intentL2', label: 'Intent L2' },
            ]}
        />
    )
}
