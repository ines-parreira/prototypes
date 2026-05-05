import type { MetricColumnConfig, NameColumnConfig } from '@repo/reporting'

import { METRIC_TOOLTIPS } from 'domains/reporting/config/metricTooltipDefinitions'
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
