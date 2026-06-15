import { useMemo } from 'react'

import { ReportingMetricBreakdownTable } from '@repo/reporting'

import { useCustomDashboardTableColumns } from 'domains/reporting/hooks/dashboards/useCustomDashboardTableColumns'
import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type {
    DashboardChartSchema,
    DashboardSchema,
} from 'domains/reporting/pages/dashboards/types'
import {
    DownloadTableButton,
    useDownloadTableAction,
} from 'pages/aiAgent/analyticsOverview/components/shared/DownloadTableButton'
import { STORE_INTEGRATION_COLUMNS } from 'pages/aiAgent/analyticsOverview/components/StoreIntegrationTable/columns'
import { useDownloadStoreIntegrationData } from 'pages/aiAgent/analyticsOverview/hooks/useDownloadStoreIntegrationData'
import { useStoreIntegrationMetrics } from 'pages/aiAgent/analyticsOverview/hooks/useStoreIntegrationMetrics'

const SEGMENT_EVENT_NAME = 'ai-agent_overview_store-integration-table' as const

type Props = {
    chartId?: string
    withChartMenu?: boolean
    dashboard?: DashboardSchema
    chartConfig?: { label: string }
    customDashboardChartSchema?: DashboardChartSchema
}

export const StoreIntegrationTable = ({
    chartId,
    withChartMenu,
    dashboard,
    chartConfig,
    customDashboardChartSchema,
}: Props) => {
    const {
        data = [],
        loadingStates,
        displayNames,
    } = useStoreIntegrationMetrics()
    const downloadData = useDownloadStoreIntegrationData()
    const exportCsvAction = useDownloadTableAction({
        ...downloadData,
        segmentEventName: SEGMENT_EVENT_NAME,
    })
    const withMenu = withChartMenu && chartId
    const { onSaveColumns } = useCustomDashboardTableColumns({
        customDashboardChartSchema,
        dashboard,
    })

    const nameColumns = useMemo(
        () => [{ accessor: 'entity', label: 'Store', displayNames }],
        [displayNames],
    )

    return (
        <ReportingMetricBreakdownTable
            data={data}
            metricColumns={STORE_INTEGRATION_COLUMNS}
            loadingStates={loadingStates}
            DownloadButton={
                !withMenu ? (
                    <DownloadTableButton
                        {...downloadData}
                        segmentEventName={SEGMENT_EVENT_NAME}
                    />
                ) : undefined
            }
            nameColumns={nameColumns}
            actionMenu={
                withMenu ? (
                    <ChartsActionMenu
                        chartId={chartId}
                        chartName="Store"
                        dashboard={dashboard}
                        exportCsvAction={exportCsvAction}
                    />
                ) : undefined
            }
            chartId={chartId}
            name={chartConfig?.label}
            customDashboardChartSchema={customDashboardChartSchema}
            onSaveColumns={onSaveColumns}
        />
    )
}
