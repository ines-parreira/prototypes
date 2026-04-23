import { ReportingMetricBreakdownTable } from '@repo/reporting'

import {
    ALL_AGENTS_PERFORMANCE_BY_INTENT_COLUMNS,
    ALL_AGENTS_PERFORMANCE_BY_INTENT_NAME_COLUMNS,
} from 'pages/aiAgent/analyticsAiAgent/components/AllAgentsPerformanceByIntentTable/columns'
import { DownloadAllAgentsPerformanceByIntentButton } from 'pages/aiAgent/analyticsAiAgent/components/AllAgentsPerformanceByIntentTable/DownloadAllAgentsPerformanceByIntentButton'
import { useAllAgentsPerformanceByIntentMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useAllAgentsPerformanceByIntentMetrics'

type Props = {
    chartId?: string
}

export const AllAgentsPerformanceByIntentTable = ({ chartId }: Props) => {
    const { data = [], loadingStates } =
        useAllAgentsPerformanceByIntentMetrics()

    return (
        <ReportingMetricBreakdownTable
            data={data}
            metricColumns={ALL_AGENTS_PERFORMANCE_BY_INTENT_COLUMNS}
            loadingStates={loadingStates}
            DownloadButton={<DownloadAllAgentsPerformanceByIntentButton />}
            nameColumns={ALL_AGENTS_PERFORMANCE_BY_INTENT_NAME_COLUMNS}
            chartId={chartId}
        />
    )
}
