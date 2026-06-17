import type { MetricColumnConfig, NameColumnConfig } from '@repo/reporting'

import { METRIC_TOOLTIPS } from 'domains/reporting/config/metricTooltipDefinitions'

export const PERFORMANCE_BREAKDOWN_NAME_COLUMNS: NameColumnConfig[] = [
    { accessor: 'feature', label: 'Feature' },
]

export const PERFORMANCE_BREAKDOWN_TABLE = {
    title: 'All features',
    description:
        'Automation performance metrics per feature, including automation rate, automated interactions, handovers, cost saved, and time saved.',
}
export const PERFORMANCE_BREAKDOWN_COLUMNS: MetricColumnConfig[] = [
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
        loadingStateKeys: ['automatedInteractions', 'timeSaved'],
        skeletonWidth: '80px',
    },
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
