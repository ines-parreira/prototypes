import type { MetricColumnConfig } from '@repo/reporting'

export const ALL_AGENTS_PERFORMANCE_BY_CHANNEL_TABLE = {
    title: 'All Agents Performance By Channel',
    description:
        'Automation performance metrics per channel, including automated interactions, handovers, cost saved, coverage rate, and success rate.',
}

export const ALL_AGENTS_PERFORMANCE_BY_CHANNEL_COLUMNS: MetricColumnConfig[] = [
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
        accessorKey: 'coverageRate',
        label: 'Coverage rate',
        tooltipTitle: 'Coverage rate',
        tooltipCaption:
            'The percentage of customer interactions where AI Agent engaged and attempted to resolve the request.',
        metricFormat: 'decimal-to-percent',
        loadingStateKeys: ['coverageRate'],
    },
    {
        accessorKey: 'successRate',
        label: 'Success rate',
        tooltipTitle: 'Success rate',
        tooltipCaption:
            'The percentage of AI Agent interactions that were fully resolved without human intervention.',
        metricFormat: 'decimal-to-percent',
        loadingStateKeys: ['successRate'],
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
]
