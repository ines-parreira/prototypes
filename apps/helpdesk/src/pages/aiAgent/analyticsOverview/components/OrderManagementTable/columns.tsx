import type { MetricColumnConfig } from '@repo/reporting'

import type { OrderManagementEntityName } from 'pages/aiAgent/analyticsOverview/hooks/useOrderManagementMetrics'

export const ENTITY_DISPLAY_NAMES: Record<OrderManagementEntityName, string> = {
    cancel_order: 'Cancel order',
    track_order: 'Track order',
    loop_returns_started: 'Return orders',
    automated_response_started: 'Report order issue',
}

export const ORDER_MANAGEMENT_TABLE = {
    title: 'Order Management',
    description:
        'Automation performance metrics per order management entity, including automation rate, automated interactions, handovers, cost saved, and time saved.',
}

export const ORDER_MANAGEMENT_COLUMNS: MetricColumnConfig[] = [
    {
        accessorKey: 'automationRate',
        label: 'Overall automation rate',
        tooltipTitle: 'Overall automation rate',
        tooltipCaption:
            'The number of interactions automated by all automation features as a % of total customer interactions.',
        metricFormat: 'percent-precision-1',
        loadingStateKeys: ['automationRate'],
    },
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
        accessorKey: 'costSaved',
        label: 'Cost saved',
        tooltipTitle: 'Cost saved',
        tooltipCaption:
            'The estimated amount saved by automating interactions that would have otherwise been handled by agents, based on Helpdesk ticket cost plus the benchmark agent cost of $3.10 per ticket.',
        metricFormat: 'currency-precision-1',
        loadingStateKeys: ['costSaved'],
        showNotAvailable: true,
    },
    {
        accessorKey: 'timeSaved',
        label: 'Time saved by agents',
        tooltipTitle: 'Time saved by agents',
        tooltipCaption:
            'The time agent would have spent resolving customer inquiries without all automation features.',
        metricFormat: 'duration',
        loadingStateKeys: ['timeSaved'],
        skeletonWidth: '80px',
    },
]
