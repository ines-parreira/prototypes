import { ReportingMetricBreakdownTable } from '@repo/reporting'

import {
    ENTITY_DISPLAY_NAMES,
    ORDER_MANAGEMENT_COLUMNS,
} from 'pages/aiAgent/analyticsOverview/components/OrderManagementTable/columns'
import { DownloadOrderManagementButton } from 'pages/aiAgent/analyticsOverview/components/OrderManagementTable/DownloadOrderManagementButton'
import { useOrderManagementMetrics } from 'pages/aiAgent/analyticsOverview/hooks/useOrderManagementMetrics'

export const OrderManagementTable = () => {
    const { data = [], loadingStates } = useOrderManagementMetrics()

    return (
        <ReportingMetricBreakdownTable
            data={data}
            metricColumns={ORDER_MANAGEMENT_COLUMNS}
            loadingStates={loadingStates}
            getRowKey={(row) => row.entity}
            DownloadButton={<DownloadOrderManagementButton />}
            nameColumn={{
                accessor: 'entity',
                label: 'Feature name',
                displayNames: ENTITY_DISPLAY_NAMES,
            }}
        />
    )
}
