import { ReportingMetricBreakdownTable } from '@repo/reporting'

import {
    PERFORMANCE_BREAKDOWN_COLUMNS_V2,
    PERFORMANCE_BREAKDOWN_NAME_COLUMNS,
} from 'pages/aiAgent/analyticsOverview/components/PerformanceBreakdownTable/columns'
import { DownloadPerformanceBreakdownV2Button } from 'pages/aiAgent/analyticsOverview/components/PerformanceBreakdownTable/DownloadPerformanceBreakdownV2Button'
import { usePerformanceMetricsPerFeatureV2 } from 'pages/aiAgent/analyticsOverview/hooks/usePerformanceMetricsPerFeatureV2'

type Props = {
    chartId?: string
}

export const PerformanceBreakdownTableV2 = ({ chartId }: Props) => {
    const { data = [], loadingStates } = usePerformanceMetricsPerFeatureV2()

    return (
        <ReportingMetricBreakdownTable
            data={data}
            metricColumns={PERFORMANCE_BREAKDOWN_COLUMNS_V2}
            loadingStates={loadingStates}
            DownloadButton={<DownloadPerformanceBreakdownV2Button />}
            chartId={chartId}
            nameColumns={PERFORMANCE_BREAKDOWN_NAME_COLUMNS}
        />
    )
}
