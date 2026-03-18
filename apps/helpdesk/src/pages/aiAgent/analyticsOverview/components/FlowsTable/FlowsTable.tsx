import { ReportingMetricBreakdownTable } from '@repo/reporting'

import { FLOWS_COLUMNS } from 'pages/aiAgent/analyticsOverview/components/FlowsTable/columns'
import { DownloadFlowsButton } from 'pages/aiAgent/analyticsOverview/components/FlowsTable/DownloadFlowsButton'
import { useFlowsMetrics } from 'pages/aiAgent/analyticsOverview/hooks/useFlowsMetrics'

export const FlowsTable = () => {
    const { data = [], loadingStates, displayNames } = useFlowsMetrics()

    return (
        <ReportingMetricBreakdownTable
            data={data}
            metricColumns={FLOWS_COLUMNS}
            loadingStates={loadingStates}
            getRowKey={(row) => row.entity}
            DownloadButton={<DownloadFlowsButton />}
            nameColumn={{
                accessor: 'entity',
                label: 'Flows',
                displayNames,
            }}
        />
    )
}
