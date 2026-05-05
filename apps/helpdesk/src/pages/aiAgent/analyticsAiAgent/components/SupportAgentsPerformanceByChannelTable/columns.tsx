import type { MetricColumnConfig, NameColumnConfig } from '@repo/reporting'

import { METRIC_TOOLTIPS } from 'domains/reporting/config/metricTooltipDefinitions'
import { formatChannelName } from 'pages/aiAgent/utils/aiAgentMetrics.utils'

export const SUPPORT_AGENTS_PERFORMANCE_BY_CHANNEL_NAME_COLUMNS: NameColumnConfig[] =
    [{ accessor: 'entity', label: 'Channel', formatName: formatChannelName }]

export const SUPPORT_AGENTS_PERFORMANCE_BY_CHANNEL_TABLE = {
    title: 'Support Agents Performance By Channel',
    description:
        'Performance metrics per channel for the AI Agent Support skill, including automated interactions, handovers, time saved, cost saved, and decrease in first response time.',
}

export const SUPPORT_AGENTS_PERFORMANCE_BY_CHANNEL_COLUMNS: MetricColumnConfig[] =
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
            accessorKey: 'timeSaved',
            label: 'Time saved by agents',
            tooltipConfig: METRIC_TOOLTIPS.timeSavedByAgentsInAiAgent,
            metricFormat: 'duration',
            loadingStateKeys: ['timeSaved'],
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
