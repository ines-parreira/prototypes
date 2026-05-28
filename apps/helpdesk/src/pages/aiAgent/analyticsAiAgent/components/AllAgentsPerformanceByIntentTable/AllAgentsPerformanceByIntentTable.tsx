import { ReportingMetricBreakdownTable } from '@repo/reporting'

import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import {
    ALL_AGENTS_PERFORMANCE_BY_INTENT_COLUMNS,
    ALL_AGENTS_PERFORMANCE_BY_INTENT_NAME_COLUMNS,
} from 'pages/aiAgent/analyticsAiAgent/components/AllAgentsPerformanceByIntentTable/columns'
import {
    DownloadAllAgentsPerformanceByIntentButton,
    useDownloadAllAgentsPerformanceByIntentAction,
} from 'pages/aiAgent/analyticsAiAgent/components/AllAgentsPerformanceByIntentTable/DownloadAllAgentsPerformanceByIntentButton'
import { useAllAgentsPerformanceByIntentMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useAllAgentsPerformanceByIntentMetrics'

type Props = {
    chartId?: string
    withChartMenu?: boolean
}

export const AllAgentsPerformanceByIntentTable = ({
    chartId,
    withChartMenu,
}: Props) => {
    const { data = [], loadingStates } =
        useAllAgentsPerformanceByIntentMetrics()
    const exportCsvAction = useDownloadAllAgentsPerformanceByIntentAction()
    const withMenu = withChartMenu && chartId

    return (
        <ReportingMetricBreakdownTable
            data={data}
            metricColumns={ALL_AGENTS_PERFORMANCE_BY_INTENT_COLUMNS}
            loadingStates={loadingStates}
            DownloadButton={
                !withMenu ? (
                    <DownloadAllAgentsPerformanceByIntentButton />
                ) : undefined
            }
            nameColumns={ALL_AGENTS_PERFORMANCE_BY_INTENT_NAME_COLUMNS}
            actionMenu={
                withMenu ? (
                    <ChartsActionMenu
                        chartId={chartId}
                        chartName="Intent"
                        exportCsvAction={exportCsvAction}
                    />
                ) : undefined
            }
            chartId={chartId}
        />
    )
}
