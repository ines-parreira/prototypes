import type { MetricColumnConfig, NameColumnConfig } from '@repo/reporting'

import { METRIC_TOOLTIPS } from 'domains/reporting/config/metricTooltipDefinitions'
import { AutomateEventType } from 'domains/reporting/hooks/automate/utils'
import type { OrderManagementEntityName } from 'pages/aiAgent/analyticsOverview/hooks/useOrderManagementMetrics'

import { ReturnOrdersDrillDown } from './drillDowns/ReturnOrdersDrillDown'
import { TopReportedIssuesDrillDown } from './drillDowns/TopReportedIssuesDrillDown'

export const ENTITY_DISPLAY_NAMES: Record<OrderManagementEntityName, string> = {
    cancel_order: 'Cancel order',
    track_order: 'Track order',
    loop_returns_started: 'Return orders',
    automated_response_started: 'Report order issue',
}

const renderDrilldown = (value: string) => {
    if (value === AutomateEventType.LOOP_RETURNS_STARTED)
        return <ReturnOrdersDrillDown />
    if (value === AutomateEventType.AUTOMATED_RESPONSE_STARTED)
        return <TopReportedIssuesDrillDown />
    return null
}

export const ORDER_MANAGEMENT_NAME_COLUMNS: NameColumnConfig[] = [
    {
        accessor: 'entity',
        label: 'Feature name',
        displayNames: ENTITY_DISPLAY_NAMES,
        renderDrilldown,
    },
]

export const ORDER_MANAGEMENT_TABLE = {
    title: 'Order Management',
    description:
        'Automation performance metrics per order management entity, including automation rate, automated interactions, handovers, cost saved, and time saved.',
}

export const ORDER_MANAGEMENT_COLUMNS: MetricColumnConfig[] = [
    {
        accessorKey: 'automationRate',
        label: 'Overall automation rate',
        tooltipConfig: METRIC_TOOLTIPS.overallAutomationRate,
        metricFormat: 'decimal-to-percent',
        loadingStateKeys: ['automationRate'],
    },
    {
        accessorKey: 'automatedInteractions',
        label: 'Automated interactions',
        tooltipConfig: METRIC_TOOLTIPS.automatedInteractionsInOverview,
        metricFormat: 'decimal',
        loadingStateKeys: ['automatedInteractions'],
    },
    {
        accessorKey: 'handoverInteractions',
        label: 'Handover interactions',
        tooltipConfig: METRIC_TOOLTIPS.handoverInteractionsInOverview,
        metricFormat: 'decimal',
        loadingStateKeys: ['handoverInteractions'],
    },
    {
        accessorKey: 'costSaved',
        label: 'Cost saved',
        tooltipConfig: METRIC_TOOLTIPS.costSaved,
        metricFormat: 'currency-precision-1',
        loadingStateKeys: ['costSaved'],
        showNotAvailable: true,
    },
    {
        accessorKey: 'timeSaved',
        label: 'Time saved by agents',
        tooltipConfig: METRIC_TOOLTIPS.timeSavedByAgentsInOverview,
        metricFormat: 'duration',
        loadingStateKeys: ['timeSaved'],
        skeletonWidth: '80px',
    },
]
