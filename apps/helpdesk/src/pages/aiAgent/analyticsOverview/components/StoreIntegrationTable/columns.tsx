import type { MetricColumnConfig } from '@repo/reporting'

import { METRIC_TOOLTIPS } from 'domains/reporting/config/metricTooltipDefinitions'
import { STANDARD_METRIC_COLUMNS } from 'pages/aiAgent/analyticsOverview/components/shared/metricColumns'

export const STORE_INTEGRATION_TABLE = {
    title: 'Store',
    description:
        'Performance breakdown per store of: overall automation rate, automated interactions, handover interactions, cost saved, time saved by agents, decrease in resolution time, and decrease in first response time.',
}

export const STORE_INTEGRATION_COLUMNS: MetricColumnConfig[] = [
    ...STANDARD_METRIC_COLUMNS,
    {
        accessorKey: 'decreaseInResolutionTime',
        label: 'Decrease in resolution time',
        tooltipConfig: METRIC_TOOLTIPS.decreaseInResolutionTimeInOverview,
        metricFormat: 'duration',
        loadingStateKeys: ['decreaseInResolutionTime'],
    },
    {
        accessorKey: 'decreaseInFirstResponseTime',
        label: 'Decrease in first response time',
        tooltipConfig: METRIC_TOOLTIPS.decreaseInFRTInOverview,
        metricFormat: 'duration',
        loadingStateKeys: ['decreaseInFirstResponseTime'],
    },
]
