import { ReportingMetricBreakdownTable } from '@repo/reporting'

import { SUPPORT_AGENTS_PERFORMANCE_BY_INTENT_COLUMNS } from 'pages/aiAgent/analyticsAiAgent/components/SupportAgentsPerformanceByIntentTable/columns'
import { DownloadSupportAgentsPerformanceByIntentButton } from 'pages/aiAgent/analyticsAiAgent/components/SupportAgentsPerformanceByIntentTable/DownloadSupportAgentsPerformanceByIntentButton'
import { useSupportAgentsPerformanceByIntentMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useSupportAgentsPerformanceByIntentMetrics'

export const SupportAgentsPerformanceByIntentTable = () => {
    const { data = [], loadingStates } =
        useSupportAgentsPerformanceByIntentMetrics()

    return (
        <ReportingMetricBreakdownTable
            data={data}
            metricColumns={SUPPORT_AGENTS_PERFORMANCE_BY_INTENT_COLUMNS}
            loadingStates={loadingStates}
            getRowKey={(row) => row.entity}
            DownloadButton={<DownloadSupportAgentsPerformanceByIntentButton />}
            nameColumns={[
                { accessor: 'intentL1', label: 'Intent L1' },
                { accessor: 'intentL2', label: 'Intent L2' },
            ]}
        />
    )
}
