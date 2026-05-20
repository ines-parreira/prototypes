import { ReportingMetricBreakdownTable } from '@repo/reporting'

import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import {
    PERFORMANCE_BREAKDOWN_COLUMNS_V2,
    PERFORMANCE_BREAKDOWN_NAME_COLUMNS,
} from 'pages/aiAgent/analyticsOverview/components/PerformanceBreakdownTable/columns'
import { DownloadPerformanceBreakdownV2Button } from 'pages/aiAgent/analyticsOverview/components/PerformanceBreakdownTable/DownloadPerformanceBreakdownV2Button'
import { usePerformanceMetricsPerFeatureV2 } from 'pages/aiAgent/analyticsOverview/hooks/usePerformanceMetricsPerFeatureV2'

type Props = {
    chartId?: string
    withChartMenu?: boolean
}

export const PerformanceBreakdownTableV2 = ({
    chartId,
    withChartMenu,
}: Props) => {
    const { data = [], loadingStates } = usePerformanceMetricsPerFeatureV2()

    return (
        <ReportingMetricBreakdownTable
            data={data}
            metricColumns={PERFORMANCE_BREAKDOWN_COLUMNS_V2}
            loadingStates={loadingStates}
            DownloadButton={<DownloadPerformanceBreakdownV2Button />}
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
