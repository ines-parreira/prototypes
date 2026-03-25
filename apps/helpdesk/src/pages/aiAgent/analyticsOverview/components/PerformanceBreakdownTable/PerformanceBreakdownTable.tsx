import { ReportingMetricBreakdownTable } from '@repo/reporting'

import { PERFORMANCE_BREAKDOWN_COLUMNS } from 'pages/aiAgent/analyticsOverview/components/PerformanceBreakdownTable/columns'
import { DownloadPerformanceBreakdownButton } from 'pages/aiAgent/analyticsOverview/components/PerformanceBreakdownTable/DownloadPerformanceBreakdownButton'
import { usePerformanceMetricsPerFeature } from 'pages/aiAgent/analyticsOverview/hooks/usePerformanceMetricsPerFeature'

export const PerformanceBreakdownTable = () => {
    const { data = [], loadingStates } = usePerformanceMetricsPerFeature()

    return (
        <ReportingMetricBreakdownTable
            data={data}
            metricColumns={PERFORMANCE_BREAKDOWN_COLUMNS}
            loadingStates={loadingStates}
            getRowKey={(row) => row.feature}
            DownloadButton={<DownloadPerformanceBreakdownButton />}
            nameColumns={[
                {
                    accessor: 'feature',
                    label: 'Feature',
                },
            ]}
        />
    )
}
