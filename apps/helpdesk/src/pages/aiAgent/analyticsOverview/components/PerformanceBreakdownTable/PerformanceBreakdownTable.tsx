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
}

export const PerformanceBreakdownTable = ({ chartId }: Props) => {
    const { data = [], loadingStates } = usePerformanceMetricsPerFeature()

    return (
        <ReportingMetricBreakdownTable
            data={data}
            metricColumns={PERFORMANCE_BREAKDOWN_COLUMNS}
            loadingStates={loadingStates}
            DownloadButton={<DownloadPerformanceBreakdownButton />}
            nameColumns={PERFORMANCE_BREAKDOWN_NAME_COLUMNS}
            actionMenu={
                chartId ? (
                    <ChartsActionMenu
                        chartId={chartId}
                        chartName="All features"
                    />
                ) : undefined
            }
            chartId={chartId}
        />
    )
}
