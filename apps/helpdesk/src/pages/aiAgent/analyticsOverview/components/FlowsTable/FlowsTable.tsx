import { useMemo } from 'react'

import { ReportingMetricBreakdownTable } from '@repo/reporting'

import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import { FLOWS_COLUMNS } from 'pages/aiAgent/analyticsOverview/components/FlowsTable/columns'
import {
    DownloadFlowsButton,
    useDownloadFlowsAction,
} from 'pages/aiAgent/analyticsOverview/components/FlowsTable/DownloadFlowsButton'
import { useFlowsMetrics } from 'pages/aiAgent/analyticsOverview/hooks/useFlowsMetrics'

type Props = {
    chartId?: string
    withChartMenu?: boolean
}

export const FlowsTable = ({ chartId, withChartMenu }: Props) => {
    const { data = [], loadingStates, displayNames } = useFlowsMetrics()
    const exportCsvAction = useDownloadFlowsAction()
    const withMenu = withChartMenu && chartId

    const nameColumns = useMemo(
        () => [{ accessor: 'entity', label: 'Flows', displayNames }],
        [displayNames],
    )

    return (
        <ReportingMetricBreakdownTable
            data={data}
            metricColumns={FLOWS_COLUMNS}
            loadingStates={loadingStates}
            DownloadButton={!withMenu ? <DownloadFlowsButton /> : undefined}
            nameColumns={nameColumns}
            actionMenu={
                withMenu ? (
                    <ChartsActionMenu
                        chartId={chartId}
                        chartName="Flows"
                        exportCsvAction={exportCsvAction}
                    />
                ) : undefined
            }
            chartId={chartId}
        />
    )
}
