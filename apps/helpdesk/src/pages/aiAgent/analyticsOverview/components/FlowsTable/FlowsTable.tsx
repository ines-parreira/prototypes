import { useMemo } from 'react'

import { ReportingMetricBreakdownTable } from '@repo/reporting'

import { FLOWS_COLUMNS } from 'pages/aiAgent/analyticsOverview/components/FlowsTable/columns'
import { DownloadFlowsButton } from 'pages/aiAgent/analyticsOverview/components/FlowsTable/DownloadFlowsButton'
import { useFlowsMetrics } from 'pages/aiAgent/analyticsOverview/hooks/useFlowsMetrics'

type Props = {
    chartId?: string
}

export const FlowsTable = ({ chartId }: Props) => {
    const { data = [], loadingStates, displayNames } = useFlowsMetrics()

    const nameColumns = useMemo(
        () => [{ accessor: 'entity', label: 'Flows', displayNames }],
        [displayNames],
    )

    return (
        <ReportingMetricBreakdownTable
            data={data}
            metricColumns={FLOWS_COLUMNS}
            loadingStates={loadingStates}
            DownloadButton={<DownloadFlowsButton />}
            nameColumns={nameColumns}
            chartId={chartId}
        />
    )
}
