import type { MetricColumnConfig, NameColumnConfig } from '@repo/reporting'

import { MAP_ENGAGEMENT_TYPE_NAME } from 'pages/aiAgent/utils/aiAgentMetrics.utils'

export const SHOPPING_ASSISTANT_PERFORMANCE_BY_ENGAGEMENT_FEATURE_NAME_COLUMNS: NameColumnConfig[] =
    [
        {
            accessor: 'entity',
            label: 'Engagement feature',
            displayNames: MAP_ENGAGEMENT_TYPE_NAME,
        },
    ]

export const SHOPPING_ASSISTANT_PERFORMANCE_BY_ENGAGEMENT_FEATURE_TABLE = {
    title: 'Shopping Assistant Performance By Engagement Feature',
    description:
        'Performance breakdown by engagement feature, including automated interactions, handover interactions, conversion rate, total sales, orders influenced, and revenue per interaction.',
}

export const SHOPPING_ASSISTANT_PERFORMANCE_BY_ENGAGEMENT_FEATURE_COLUMNS: MetricColumnConfig[] =
    [
        {
            accessorKey: 'automatedInteractions',
            label: 'Automated interactions',
            tooltipTitle: 'Automated interactions',
            tooltipCaption:
                'The number of interactions handled by Shopping Assistant in which the customer left without asking to talk to a human agent.',
            metricFormat: 'decimal',
            loadingStateKeys: ['automatedInteractions'],
        },
        {
            accessorKey: 'handoverInteractions',
            label: 'Handover interactions',
            tooltipTitle: 'Handover interactions',
            tooltipCaption:
                "The number of interactions Shopping Assistant transferred to a human because it couldn't confidently resolve the customer's request or because the customer explicitly requested a human.",
            metricFormat: 'decimal',
            loadingStateKeys: ['handoverInteractions'],
        },
        {
            accessorKey: 'conversionRate',
            label: 'Conversion rate',
            tooltipTitle: 'Conversion rate',
            tooltipCaption:
                'The percentage of Shopping Assistant interactions that resulted in a purchase.',
            metricFormat: 'decimal-to-percent',
            loadingStateKeys: ['conversionRate'],
        },
        {
            accessorKey: 'totalSales',
            label: 'Total sales',
            tooltipTitle: 'Total sales',
            tooltipCaption:
                'The revenue influenced by a Shopping Assistant interaction, measured from orders placed within 3 days of the interaction.',
            metricFormat: 'currency-precision-1',
            loadingStateKeys: ['totalSales'],
        },
        {
            accessorKey: 'ordersInfluenced',
            label: 'Orders influenced',
            tooltipTitle: 'Orders influenced',
            tooltipCaption:
                'The number of orders placed within 3 days of a Shopping Assistant conversation without a direct handover.',
            metricFormat: 'decimal',
            loadingStateKeys: ['ordersInfluenced'],
        },
        {
            accessorKey: 'revenuePerInteraction',
            label: 'Revenue per interaction',
            tooltipTitle: 'Revenue per interaction',
            tooltipCaption:
                'The average total sale generated from each Shopping Assistant interaction.',
            metricFormat: 'currency-precision-1',
            loadingStateKeys: ['revenuePerInteraction'],
        },
    ]
