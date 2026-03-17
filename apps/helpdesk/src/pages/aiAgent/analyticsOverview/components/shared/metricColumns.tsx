import type { MetricColumnConfig } from '@repo/reporting'

export type { MetricColumnConfig, MetricLoadingStates } from '@repo/reporting'

export const STANDARD_METRIC_COLUMNS: MetricColumnConfig[] = [
    {
        accessorKey: 'automationRate',
        label: 'Overall automation rate',
        tooltipTitle: 'Overall automation rate',
        tooltipCaption:
            'The number of interactions automated by all automation features as a % of total customer interactions.',
        metricFormat: 'decimal-to-percent',
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
        loadingStateKeys: ['automatedInteractions', 'timeSaved'],
        skeletonWidth: '80px',
    },
]
