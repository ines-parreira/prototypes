import { ReportingMetricBreakdownTable } from '@repo/reporting'

import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type { DashboardSchema } from 'domains/reporting/pages/dashboards/types'
import {
    PERFORMANCE_BREAKDOWN_COLUMNS,
    PERFORMANCE_BREAKDOWN_NAME_COLUMNS,
} from 'pages/aiAgent/analyticsOverview/components/PerformanceBreakdownTable/columns'
import {
    DownloadPerformanceBreakdownButton,
    useDownloadPerformanceBreakdownAction,
} from 'pages/aiAgent/analyticsOverview/components/PerformanceBreakdownTable/DownloadPerformanceBreakdownButton'
import { usePerformanceMetricsPerFeature } from 'pages/aiAgent/analyticsOverview/hooks/usePerformanceMetricsPerFeature'

type Props = {
    chartId?: string
    withChartMenu?: boolean
    dashboard?: DashboardSchema
}

export const PerformanceBreakdownTable = ({
    chartId,
    withChartMenu,
    dashboard,
}: Props) => {
    const { data = [], loadingStates } = usePerformanceMetricsPerFeature()
    const exportCsvAction = useDownloadPerformanceBreakdownAction()
    const withMenu = withChartMenu && chartId

    return (
        <ReportingMetricBreakdownTable
            data={data}
            metricColumns={PERFORMANCE_BREAKDOWN_COLUMNS}
            loadingStates={loadingStates}
            DownloadButton={
                !withMenu ? <DownloadPerformanceBreakdownButton /> : undefined
            }
            actionMenu={
                withMenu ? (
                    <ChartsActionMenu
                        chartId={chartId}
                        chartName="All features"
                        dashboard={dashboard}
                        exportCsvAction={exportCsvAction}
                    />
                ) : undefined
            }
            chartId={chartId}
            nameColumns={PERFORMANCE_BREAKDOWN_NAME_COLUMNS}
        />
    )
}
