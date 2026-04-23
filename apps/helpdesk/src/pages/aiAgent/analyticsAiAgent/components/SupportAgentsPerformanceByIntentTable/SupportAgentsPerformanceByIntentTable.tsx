import { ReportingMetricBreakdownTable } from '@repo/reporting'

import {
    SUPPORT_AGENTS_PERFORMANCE_BY_INTENT_COLUMNS,
    SUPPORT_AGENTS_PERFORMANCE_BY_INTENT_NAME_COLUMNS,
} from 'pages/aiAgent/analyticsAiAgent/components/SupportAgentsPerformanceByIntentTable/columns'
import { DownloadSupportAgentsPerformanceByIntentButton } from 'pages/aiAgent/analyticsAiAgent/components/SupportAgentsPerformanceByIntentTable/DownloadSupportAgentsPerformanceByIntentButton'
import { useSupportAgentsPerformanceByIntentMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useSupportAgentsPerformanceByIntentMetrics'

type Props = {
    chartId?: string
}

export const SupportAgentsPerformanceByIntentTable = ({ chartId }: Props) => {
    const { data = [], loadingStates } =
        useSupportAgentsPerformanceByIntentMetrics()

    return (
        <ReportingMetricBreakdownTable
            data={data}
            metricColumns={SUPPORT_AGENTS_PERFORMANCE_BY_INTENT_COLUMNS}
            loadingStates={loadingStates}
            DownloadButton={<DownloadSupportAgentsPerformanceByIntentButton />}
            nameColumns={SUPPORT_AGENTS_PERFORMANCE_BY_INTENT_NAME_COLUMNS}
            chartId={chartId}
        />
    )
}
