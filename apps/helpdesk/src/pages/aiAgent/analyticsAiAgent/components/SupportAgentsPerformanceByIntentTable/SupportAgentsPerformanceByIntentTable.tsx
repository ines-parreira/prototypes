import { ReportingMetricBreakdownTable } from '@repo/reporting'

import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type { DashboardSchema } from 'domains/reporting/pages/dashboards/types'
import {
    SUPPORT_AGENTS_PERFORMANCE_BY_INTENT_COLUMNS,
    SUPPORT_AGENTS_PERFORMANCE_BY_INTENT_NAME_COLUMNS,
} from 'pages/aiAgent/analyticsAiAgent/components/SupportAgentsPerformanceByIntentTable/columns'
import {
    DownloadSupportAgentsPerformanceByIntentButton,
    useDownloadSupportAgentsPerformanceByIntentAction,
} from 'pages/aiAgent/analyticsAiAgent/components/SupportAgentsPerformanceByIntentTable/DownloadSupportAgentsPerformanceByIntentButton'
import { useSupportAgentsPerformanceByIntentMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useSupportAgentsPerformanceByIntentMetrics'

type Props = {
    chartId?: string
    withChartMenu?: boolean
    dashboard?: DashboardSchema
    chartConfig?: { label: string }
    isCustomDashboard?: boolean
}

export const SupportAgentsPerformanceByIntentTable = ({
    chartId,
    withChartMenu,
    dashboard,
    chartConfig,
    isCustomDashboard,
}: Props) => {
    const { data = [], loadingStates } =
        useSupportAgentsPerformanceByIntentMetrics()
    const exportCsvAction = useDownloadSupportAgentsPerformanceByIntentAction()
    const withMenu = withChartMenu && chartId

    return (
        <ReportingMetricBreakdownTable
            data={data}
            metricColumns={SUPPORT_AGENTS_PERFORMANCE_BY_INTENT_COLUMNS}
            loadingStates={loadingStates}
            DownloadButton={
                !withMenu ? (
                    <DownloadSupportAgentsPerformanceByIntentButton />
                ) : undefined
            }
            nameColumns={SUPPORT_AGENTS_PERFORMANCE_BY_INTENT_NAME_COLUMNS}
            actionMenu={
                withMenu ? (
                    <ChartsActionMenu
                        chartId={chartId}
                        chartName="Intent"
                        dashboard={dashboard}
                        exportCsvAction={exportCsvAction}
                    />
                ) : undefined
            }
            chartId={chartId}
            isCustomDashboard={isCustomDashboard}
            name={chartConfig?.label}
        />
    )
}
