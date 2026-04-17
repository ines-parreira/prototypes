import { ReportingMetricBreakdownTable } from '@repo/reporting'

import { AutomateEventType } from 'domains/reporting/hooks/automate/utils'
import {
    ENTITY_DISPLAY_NAMES,
    ORDER_MANAGEMENT_COLUMNS,
} from 'pages/aiAgent/analyticsOverview/components/OrderManagementTable/columns'
import { DownloadOrderManagementButton } from 'pages/aiAgent/analyticsOverview/components/OrderManagementTable/DownloadOrderManagementButton'
import { useOrderManagementMetrics } from 'pages/aiAgent/analyticsOverview/hooks/useOrderManagementMetrics'

import { ReturnOrdersDrillDown } from './drillDowns/ReturnOrdersDrillDown'
import { TopReportedIssuesDrillDown } from './drillDowns/TopReportedIssuesDrillDown'

export const OrderManagementTable = () => {
    const { data = [], loadingStates } = useOrderManagementMetrics()

    const renderDrilldown = (value: string) => {
        if (value === AutomateEventType.LOOP_RETURNS_STARTED)
            return <ReturnOrdersDrillDown />
        if (value === AutomateEventType.AUTOMATED_RESPONSE_STARTED)
            return <TopReportedIssuesDrillDown />
        return null
    }

    return (
        <ReportingMetricBreakdownTable
            data={data}
            metricColumns={ORDER_MANAGEMENT_COLUMNS}
            loadingStates={loadingStates}
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
