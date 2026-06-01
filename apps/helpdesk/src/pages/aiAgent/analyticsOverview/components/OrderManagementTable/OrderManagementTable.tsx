import { ReportingMetricBreakdownTable } from '@repo/reporting'

import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type { DashboardSchema } from 'domains/reporting/pages/dashboards/types'
import {
    ORDER_MANAGEMENT_COLUMNS,
    ORDER_MANAGEMENT_NAME_COLUMNS,
} from 'pages/aiAgent/analyticsOverview/components/OrderManagementTable/columns'
import {
    DownloadOrderManagementButton,
    useDownloadOrderManagementAction,
} from 'pages/aiAgent/analyticsOverview/components/OrderManagementTable/DownloadOrderManagementButton'
import { useOrderManagementMetrics } from 'pages/aiAgent/analyticsOverview/hooks/useOrderManagementMetrics'

type Props = {
    chartId?: string
    withChartMenu?: boolean
    dashboard?: DashboardSchema
    chartConfig?: { label: string }
    isCustomDashboard?: boolean
}

export const OrderManagementTable = ({
    chartId,
    withChartMenu,
    dashboard,
    chartConfig,
    isCustomDashboard,
}: Props) => {
    const { data = [], loadingStates } = useOrderManagementMetrics()
    const exportCsvAction = useDownloadOrderManagementAction()
    const withMenu = withChartMenu && chartId

    return (
        <ReportingMetricBreakdownTable
            data={data}
            metricColumns={ORDER_MANAGEMENT_COLUMNS}
            loadingStates={loadingStates}
            DownloadButton={
                !withMenu ? <DownloadOrderManagementButton /> : undefined
            }
            nameColumns={ORDER_MANAGEMENT_NAME_COLUMNS}
            actionMenu={
                withMenu ? (
                    <ChartsActionMenu
                        chartId={chartId}
                        chartName="Order Management"
                        dashboard={dashboard}
                        exportCsvAction={exportCsvAction}
                    />
                ) : undefined
            }
            chartId={chartId}
            isCustomDashboard={isCustomDashboard}
            name={chartConfig?.label}
        />
    )
}
