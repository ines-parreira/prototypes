import { ReportingMetricBreakdownTable } from '@repo/reporting'

import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import {
    SUPPORT_AGENTS_PERFORMANCE_BY_CHANNEL_COLUMNS,
    SUPPORT_AGENTS_PERFORMANCE_BY_CHANNEL_NAME_COLUMNS,
} from 'pages/aiAgent/analyticsAiAgent/components/SupportAgentsPerformanceByChannelTable/columns'
import {
    DownloadSupportAgentsPerformanceByChannelButton,
    useDownloadSupportAgentsPerformanceByChannelAction,
} from 'pages/aiAgent/analyticsAiAgent/components/SupportAgentsPerformanceByChannelTable/DownloadSupportAgentsPerformanceByChannelButton'
import { useSupportAgentsPerformanceByChannelMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useSupportAgentsPerformanceByChannelMetrics'

type Props = {
    chartId?: string
    withChartMenu?: boolean
}

export const SupportAgentsPerformanceByChannelTable = ({
    chartId,
    withChartMenu,
}: Props) => {
    const { data = [], loadingStates } =
        useSupportAgentsPerformanceByChannelMetrics()
    const exportCsvAction = useDownloadSupportAgentsPerformanceByChannelAction()
    const withMenu = withChartMenu && chartId

    return (
        <ReportingMetricBreakdownTable
            data={data}
            metricColumns={SUPPORT_AGENTS_PERFORMANCE_BY_CHANNEL_COLUMNS}
            loadingStates={loadingStates}
            DownloadButton={
                !withMenu ? (
                    <DownloadSupportAgentsPerformanceByChannelButton />
                ) : undefined
            }
            nameColumns={SUPPORT_AGENTS_PERFORMANCE_BY_CHANNEL_NAME_COLUMNS}
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
