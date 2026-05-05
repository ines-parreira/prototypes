import type { MetricColumnConfig, NameColumnConfig } from '@repo/reporting'

import { METRIC_TOOLTIPS } from 'domains/reporting/config/metricTooltipDefinitions'

export const ALL_AGENTS_PERFORMANCE_BY_INTENT_NAME_COLUMNS: NameColumnConfig[] =
    [
        { accessor: 'intentL1', label: 'Intent L1' },
        { accessor: 'intentL2', label: 'Intent L2' },
    ]

export const ALL_AGENTS_PERFORMANCE_BY_INTENT_TABLE = {
    title: 'All Agents Performance By Intent',
    description:
        'Automation performance metrics per intent, including automated interactions, handovers, cost saved, coverage rate, success rate, and conversion rate.',
}

export const ALL_AGENTS_PERFORMANCE_BY_INTENT_COLUMNS: MetricColumnConfig[] = [
    {
        accessorKey: 'automatedInteractions',
        label: 'Automated interactions',
        tooltipConfig: METRIC_TOOLTIPS.automatedInteractionsInAiAgent,
        metricFormat: 'decimal',
        loadingStateKeys: ['automatedInteractions'],
    },
    {
        accessorKey: 'handoverInteractions',
        label: 'Handover interactions',
        tooltipConfig: METRIC_TOOLTIPS.handoverInteractionsInAiAgent,
        metricFormat: 'decimal',
        loadingStateKeys: ['handoverInteractions'],
    },
    {
        accessorKey: 'coverageRate',
        label: 'Coverage rate',
        tooltipConfig: METRIC_TOOLTIPS.coverageRate,
        metricFormat: 'decimal-to-percent',
        loadingStateKeys: ['coverageRate'],
    },
    {
        accessorKey: 'successRate',
        label: 'Success rate',
        tooltipConfig: METRIC_TOOLTIPS.successRate,
        metricFormat: 'decimal-to-percent',
        loadingStateKeys: ['successRate'],
    },
    {
        accessorKey: 'conversionRate',
        label: 'Conversion rate',
        tooltipTitle: 'Conversion rate',
        tooltipCaption:
            'The percentage of AI Agent interactions that resulted in a purchase.',
        metricFormat: 'decimal-to-percent',
        loadingStateKeys: ['conversionRate'],
    },
    {
        accessorKey: 'costSaved',
        label: 'Cost saved',
        tooltipConfig: METRIC_TOOLTIPS.costSaved,
        metricFormat: 'currency-precision-1',
        loadingStateKeys: ['costSaved'],
        showNotAvailable: true,
    },
]
