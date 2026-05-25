import { ReportingMetricBreakdownTable } from '@repo/reporting'

import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import {
    PERFORMANCE_BREAKDOWN_COLUMNS,
    PERFORMANCE_BREAKDOWN_NAME_COLUMNS,
} from 'pages/aiAgent/analyticsOverview/components/PerformanceBreakdownTable/columns'
import { DownloadPerformanceBreakdownButton } from 'pages/aiAgent/analyticsOverview/components/PerformanceBreakdownTable/DownloadPerformanceBreakdownButton'
import { usePerformanceMetricsPerFeature } from 'pages/aiAgent/analyticsOverview/hooks/usePerformanceMetricsPerFeature'

type Props = {
    chartId?: string
    withChartMenu?: boolean
}

export const PerformanceBreakdownTable = ({
    chartId,
    withChartMenu,
}: Props) => {
    const { data = [], loadingStates } = usePerformanceMetricsPerFeature()

    return (
        <ReportingMetricBreakdownTable
            data={data}
            metricColumns={PERFORMANCE_BREAKDOWN_COLUMNS}
            loadingStates={loadingStates}
            DownloadButton={<DownloadPerformanceBreakdownButton />}
            actionMenu={
                withChartMenu && chartId ? (
                    <ChartsActionMenu
                        chartId={chartId}
                        chartName="All features"
                    />
                ) : undefined
            }
            chartId={chartId}
            nameColumns={PERFORMANCE_BREAKDOWN_NAME_COLUMNS}
        />
    )
}
