import { ReportingMetricBreakdownTable } from '@repo/reporting'

import {
    ENTITY_DISPLAY_NAMES,
    ORDER_MANAGEMENT_COLUMNS,
} from 'pages/aiAgent/analyticsOverview/components/OrderManagementTable/columns'
import { DownloadOrderManagementButton } from 'pages/aiAgent/analyticsOverview/components/OrderManagementTable/DownloadOrderManagementButton'
import { useOrderManagementMetrics } from 'pages/aiAgent/analyticsOverview/hooks/useOrderManagementMetrics'

import { ReturnOrdersDrillDown } from './drillDowns/ReturnOrdersDrillDown'

export const OrderManagementTable = () => {
    const { data = [], loadingStates } = useOrderManagementMetrics()

    const renderDrilldown = (value: string) => {
        return value === 'loop_returns_started' ? (
            <ReturnOrdersDrillDown />
        ) : null
    }

    return (
        <ReportingMetricBreakdownTable
            data={data}
            metricColumns={ORDER_MANAGEMENT_COLUMNS}
            loadingStates={loadingStates}
            getRowKey={(row) => row.entity}
            DownloadButton={<DownloadOrderManagementButton />}
            nameColumns={[
                {
                    accessor: 'entity',
                    label: 'Feature name',
                    displayNames: ENTITY_DISPLAY_NAMES,
                    renderDrilldown,
                },
            ]}
        />
    )
}
