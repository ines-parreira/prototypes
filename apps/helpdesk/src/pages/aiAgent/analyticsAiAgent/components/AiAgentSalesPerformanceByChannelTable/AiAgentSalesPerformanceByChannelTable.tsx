import { ReportingMetricBreakdownTable } from '@repo/reporting'

import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import {
    AI_AGENT_SALES_PERFORMANCE_BY_CHANNEL_COLUMNS,
    AI_AGENT_SALES_PERFORMANCE_BY_CHANNEL_NAME_COLUMNS,
} from 'pages/aiAgent/analyticsAiAgent/components/AiAgentSalesPerformanceByChannelTable/columns'
import {
    DownloadAiAgentSalesPerformanceByChannelButton,
    useDownloadAiAgentSalesPerformanceByChannelAction,
} from 'pages/aiAgent/analyticsAiAgent/components/AiAgentSalesPerformanceByChannelTable/DownloadAiAgentSalesPerformanceByChannelButton'
import { useAiAgentSalesPerformanceByChannelMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentSalesPerformanceByChannelMetrics'

type Props = {
    chartId?: string
    withChartMenu?: boolean
}

export const AiAgentSalesPerformanceByChannelTable = ({
    chartId,
    withChartMenu,
}: Props) => {
    const { data = [], loadingStates } =
        useAiAgentSalesPerformanceByChannelMetrics()
    const exportCsvAction = useDownloadAiAgentSalesPerformanceByChannelAction()
    const withMenu = withChartMenu && chartId

    return (
        <ReportingMetricBreakdownTable
            data={data}
            metricColumns={AI_AGENT_SALES_PERFORMANCE_BY_CHANNEL_COLUMNS}
            loadingStates={loadingStates}
            DownloadButton={
                !withMenu ? (
                    <DownloadAiAgentSalesPerformanceByChannelButton />
                ) : undefined
            }
            nameColumns={AI_AGENT_SALES_PERFORMANCE_BY_CHANNEL_NAME_COLUMNS}
            actionMenu={
                withMenu ? (
                    <ChartsActionMenu
                        chartId={chartId}
                        chartName="Channel"
                        exportCsvAction={exportCsvAction}
                    />
                ) : undefined
            }
            chartId={chartId}
        />
    )
}
