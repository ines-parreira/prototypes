import { ReportingMetricBreakdownTable } from '@repo/reporting'

import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type { DashboardSchema } from 'domains/reporting/pages/dashboards/types'
import {
    ALL_AGENTS_PERFORMANCE_BY_CHANNEL_COLUMNS,
    ALL_AGENTS_PERFORMANCE_BY_CHANNEL_NAME_COLUMNS,
} from 'pages/aiAgent/analyticsAiAgent/components/AllAgentsPerformanceByChannelTable/columns'
import {
    DownloadAllAgentsPerformanceByChannelButton,
    useDownloadAllAgentsPerformanceByChannelAction,
} from 'pages/aiAgent/analyticsAiAgent/components/AllAgentsPerformanceByChannelTable/DownloadAllAgentsPerformanceByChannelButton'
import { useAllAgentsPerformanceByChannelMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useAllAgentsPerformanceByChannelMetrics'

type Props = {
    chartId?: string
    withChartMenu?: boolean
    dashboard?: DashboardSchema
}

export const AllAgentsPerformanceByChannelTable = ({
    chartId,
    withChartMenu,
    dashboard,
}: Props) => {
    const { data = [], loadingStates } =
        useAllAgentsPerformanceByChannelMetrics()
    const exportCsvAction = useDownloadAllAgentsPerformanceByChannelAction()
    const withMenu = withChartMenu && chartId

    return (
        <ReportingMetricBreakdownTable
            data={data}
            metricColumns={ALL_AGENTS_PERFORMANCE_BY_CHANNEL_COLUMNS}
            loadingStates={loadingStates}
            DownloadButton={
                !withMenu ? (
                    <DownloadAllAgentsPerformanceByChannelButton />
                ) : undefined
            }
            nameColumns={ALL_AGENTS_PERFORMANCE_BY_CHANNEL_NAME_COLUMNS}
            actionMenu={
                withMenu ? (
                    <ChartsActionMenu
                        chartId={chartId}
                        chartName="Channel"
                        dashboard={dashboard}
                        exportCsvAction={exportCsvAction}
                    />
                ) : undefined
            }
            chartId={chartId}
        />
    )
}
