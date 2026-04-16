import { ReportingMetricBreakdownTable } from '@repo/reporting'

import { PERFORMANCE_BREAKDOWN_COLUMNS_V2 } from 'pages/aiAgent/analyticsOverview/components/PerformanceBreakdownTable/columns'
import { DownloadPerformanceBreakdownV2Button } from 'pages/aiAgent/analyticsOverview/components/PerformanceBreakdownTable/DownloadPerformanceBreakdownV2Button'
import { usePerformanceMetricsPerFeatureV2 } from 'pages/aiAgent/analyticsOverview/hooks/usePerformanceMetricsPerFeatureV2'

export const PerformanceBreakdownTableV2 = () => {
    const { data = [], loadingStates } = usePerformanceMetricsPerFeatureV2()

    return (
        <ReportingMetricBreakdownTable
            data={data}
            metricColumns={PERFORMANCE_BREAKDOWN_COLUMNS_V2}
            loadingStates={loadingStates}
            getRowKey={(row) => row.feature}
            DownloadButton={<DownloadPerformanceBreakdownV2Button />}
            nameColumns={[
                {
                    accessor: 'feature',
                    label: 'Feature',
                },
            ]}
        />
    )
}
