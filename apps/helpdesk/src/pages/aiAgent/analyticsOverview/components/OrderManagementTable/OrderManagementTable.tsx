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
    withChartMenu?: boolean
}

export const OrderManagementTable = ({ chartId, withChartMenu }: Props) => {
    const { data = [], loadingStates } = useOrderManagementMetrics()

    return (
        <ReportingMetricBreakdownTable
            data={data}
            metricColumns={ORDER_MANAGEMENT_COLUMNS}
            loadingStates={loadingStates}
            DownloadButton={<DownloadOrderManagementButton />}
            nameColumns={ORDER_MANAGEMENT_NAME_COLUMNS}
            actionMenu={
                withChartMenu && chartId ? (
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
