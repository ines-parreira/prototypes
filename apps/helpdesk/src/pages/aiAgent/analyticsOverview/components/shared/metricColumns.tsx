import type { MetricColumnConfig } from '@repo/reporting'

import { METRIC_TOOLTIPS } from 'domains/reporting/config/metricTooltipDefinitions'

export type { MetricColumnConfig, MetricLoadingStates } from '@repo/reporting'

export const STANDARD_METRIC_COLUMNS: MetricColumnConfig[] = [
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
