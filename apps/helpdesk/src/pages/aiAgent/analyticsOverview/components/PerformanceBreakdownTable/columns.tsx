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
// contains a different metricFormat than PERFORMANCE_BREAKDOWN_COLUMNS since calculations are done on BE side now
export const PERFORMANCE_BREAKDOWN_COLUMNS_V2: MetricColumnConfig[] = [
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
]

export const PERFORMANCE_BREAKDOWN_COLUMNS: MetricColumnConfig[] = [
    {
        accessorKey: 'automationRate',
        label: 'Overall automation rate',
        tooltipConfig: METRIC_TOOLTIPS.overallAutomationRate,
        metricFormat: 'percent-precision-1',
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
]
