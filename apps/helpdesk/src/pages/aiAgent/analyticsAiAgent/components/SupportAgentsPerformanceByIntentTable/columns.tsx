import type { MetricColumnConfig, NameColumnConfig } from '@repo/reporting'

import { METRIC_TOOLTIPS } from 'domains/reporting/config/metricTooltipDefinitions'

export const SUPPORT_AGENTS_PERFORMANCE_BY_INTENT_NAME_COLUMNS: NameColumnConfig[] =
    [
        { accessor: 'intentL1', label: 'Intent L1' },
        { accessor: 'intentL2', label: 'Intent L2' },
    ]

export const SUPPORT_AGENTS_PERFORMANCE_BY_INTENT_TABLE = {
    title: 'Support Agents Performance By Intent',
    description:
        'Performance metrics per intent for the AI Agent Support skill, including automated interactions, handovers, success rate, cost saved, and decrease in first response time.',
}

export const SUPPORT_AGENTS_PERFORMANCE_BY_INTENT_COLUMNS: MetricColumnConfig[] =
    [
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
            accessorKey: 'successRate',
            label: 'Success rate',
            tooltipConfig: METRIC_TOOLTIPS.successRate,
            metricFormat: 'decimal-to-percent',
            loadingStateKeys: ['successRate'],
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
            accessorKey: 'decreaseInFRT',
            label: 'Decrease in FRT',
            tooltipConfig: METRIC_TOOLTIPS.decreaseInFRTInAiAgent,
            metricFormat: 'duration',
            loadingStateKeys: ['decreaseInFRT'],
        },
    ]
