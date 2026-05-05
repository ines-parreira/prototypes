import type { MetricColumnConfig, NameColumnConfig } from '@repo/reporting'

import { METRIC_TOOLTIPS } from 'domains/reporting/config/metricTooltipDefinitions'
import { formatChannelName } from 'pages/aiAgent/utils/aiAgentMetrics.utils'

export const AI_AGENT_SALES_PERFORMANCE_BY_CHANNEL_NAME_COLUMNS: NameColumnConfig[] =
    [{ accessor: 'entity', label: 'Channel', formatName: formatChannelName }]

export const AI_AGENT_SALES_PERFORMANCE_BY_CHANNEL_TABLE = {
    title: 'AI Agent Sales Performance By Channel',
    description:
        'Performance metrics per channel for the AI Agent Sales skill, including automated interactions, handovers, conversion rate, total sales, orders influenced, and revenue per interaction.',
}

export const AI_AGENT_SALES_PERFORMANCE_BY_CHANNEL_COLUMNS: MetricColumnConfig[] =
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
            accessorKey: 'conversionRate',
            label: 'Conversion rate',
            tooltipConfig: METRIC_TOOLTIPS.conversionRate,
            metricFormat: 'decimal-to-percent',
            loadingStateKeys: ['conversionRate'],
        },
        {
            accessorKey: 'totalSales',
            label: 'Total sales',
            tooltipConfig: METRIC_TOOLTIPS.totalSales,
            metricFormat: 'currency-precision-1',
            loadingStateKeys: ['totalSales'],
        },
        {
            accessorKey: 'ordersInfluenced',
            label: 'Orders influenced',
            tooltipConfig: METRIC_TOOLTIPS.ordersInfluenced,
            metricFormat: 'decimal',
            loadingStateKeys: ['ordersInfluenced'],
        },
        {
            accessorKey: 'revenuePerInteraction',
            label: 'Revenue per interaction',
            tooltipConfig: METRIC_TOOLTIPS.revenuePerInteraction,
            metricFormat: 'currency-precision-1',
            loadingStateKeys: ['revenuePerInteraction'],
        },
    ]
