import type { MetricColumnConfig, NameColumnConfig } from '@repo/reporting'

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
        {
            accessorKey: 'decreaseInFRT',
            label: 'Decrease in FRT',
            tooltipTitle: 'Decrease in first response time',
            tooltipCaption:
                'The reduction in the average time shoppers wait for the first reply to their message when AI Agent is used, compared with tickets resolved manually by support agents.',
            metricFormat: 'duration',
            loadingStateKeys: ['decreaseInFRT'],
        },
    ]
