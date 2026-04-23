import type { MetricColumnConfig, NameColumnConfig } from '@repo/reporting'

import { formatChannelName } from 'pages/aiAgent/utils/aiAgentMetrics.utils'

export const AI_AGENT_SALES_PERFORMANCE_BY_CHANNEL_NAME_COLUMNS: NameColumnConfig[] =
    [{ accessor: 'entity', label: 'Channel', formatName: formatChannelName }]

export const AI_AGENT_SALES_PERFORMANCE_BY_CHANNEL_TABLE = {
    title: 'AI Agent Sales Performance By Channel',
    description:
        'Performance metrics per channel for the AI Agent Sales skill, including automated interactions, handovers, total sales, orders influenced, and revenue per interaction.',
}

export const AI_AGENT_SALES_PERFORMANCE_BY_CHANNEL_COLUMNS: MetricColumnConfig[] =
    [
        {
            accessorKey: 'automatedInteractions',
            label: 'Automated interactions',
            tooltipTitle: 'Automated interactions',
            tooltipCaption:
                'The number of fully automated interactions solved without any human agent intervention.',
            metricFormat: 'decimal',
            loadingStateKeys: ['automatedInteractions'],
        },
        {
            accessorKey: 'handoverInteractions',
            label: 'Handover interactions',
            tooltipTitle: 'Handover interactions',
            tooltipCaption:
                "The number of interactions AI Agent transferred to a human because it couldn't confidently resolve the customer's request or because the customer explicitly requested to speak with a human agent.",
            metricFormat: 'decimal',
            loadingStateKeys: ['handoverInteractions'],
        },
        {
            accessorKey: 'totalSales',
            label: 'Total sales',
            tooltipTitle: 'Total sales',
            tooltipCaption:
                'The total revenue generated from orders influenced by AI Agent.',
            metricFormat: 'currency-precision-1',
            loadingStateKeys: ['totalSales'],
        },
        {
            accessorKey: 'ordersInfluenced',
            label: 'Orders influenced',
            tooltipTitle: 'Orders influenced',
            tooltipCaption:
                'The number of orders influenced by AI Agent recommendations or interactions.',
            metricFormat: 'decimal',
            loadingStateKeys: ['ordersInfluenced'],
        },
        {
            accessorKey: 'revenuePerInteraction',
            label: 'Revenue per interaction',
            tooltipTitle: 'Revenue per interaction',
            tooltipCaption:
                'The average revenue generated per AI Agent interaction, calculated as total sales divided by total interactions.',
            metricFormat: 'currency-precision-1',
            loadingStateKeys: ['revenuePerInteraction'],
        },
    ]
