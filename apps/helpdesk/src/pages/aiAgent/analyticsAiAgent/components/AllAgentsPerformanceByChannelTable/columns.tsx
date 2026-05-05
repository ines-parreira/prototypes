import type { MetricColumnConfig, NameColumnConfig } from '@repo/reporting'

import { METRIC_TOOLTIPS } from 'domains/reporting/config/metricTooltipDefinitions'
import { formatChannelName } from 'pages/aiAgent/utils/aiAgentMetrics.utils'

export const ALL_AGENTS_PERFORMANCE_BY_CHANNEL_NAME_COLUMNS: NameColumnConfig[] =
    [{ accessor: 'entity', label: 'Channel', formatName: formatChannelName }]

export const ALL_AGENTS_PERFORMANCE_BY_CHANNEL_TABLE = {
    title: 'All Agents Performance By Channel',
    description:
        'Automation performance metrics per channel, including automated interactions, handovers, conversion rate, cost saved, coverage rate, and success rate.',
}

export const ALL_AGENTS_PERFORMANCE_BY_CHANNEL_COLUMNS: MetricColumnConfig[] = [
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
        accessorKey: 'conversionRate',
        label: 'Conversion rate',
        tooltipConfig: METRIC_TOOLTIPS.conversionRate,
        metricFormat: 'decimal-to-percent',
        loadingStateKeys: ['conversionRate'],
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
        accessorKey: 'costSaved',
        label: 'Cost saved',
        tooltipConfig: METRIC_TOOLTIPS.costSaved,
        metricFormat: 'currency-precision-1',
        loadingStateKeys: ['costSaved'],
        showNotAvailable: true,
    },
]
