import { ReportingMetricBreakdownTable } from '@repo/reporting'

import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import {
    ORDER_MANAGEMENT_COLUMNS,
    ORDER_MANAGEMENT_NAME_COLUMNS,
} from 'pages/aiAgent/analyticsOverview/components/OrderManagementTable/columns'
import { DownloadOrderManagementButton } from 'pages/aiAgent/analyticsOverview/components/OrderManagementTable/DownloadOrderManagementButton'
import { useOrderManagementMetrics } from 'pages/aiAgent/analyticsOverview/hooks/useOrderManagementMetrics'

type Props = {
    chartId?: string
}

export const OrderManagementTable = ({ chartId }: Props) => {
    const { data = [], loadingStates } = useOrderManagementMetrics()

    return (
        <ReportingMetricBreakdownTable
            data={data}
            metricColumns={ORDER_MANAGEMENT_COLUMNS}
            loadingStates={loadingStates}
            DownloadButton={<DownloadOrderManagementButton />}
            nameColumns={ORDER_MANAGEMENT_NAME_COLUMNS}
            actionMenu={
                chartId ? (
                    <ChartsActionMenu
                        chartId={chartId}
                        chartName="Order Management"
                    />
                ) : undefined
            }
            chartId={chartId}
        />
    )
}
