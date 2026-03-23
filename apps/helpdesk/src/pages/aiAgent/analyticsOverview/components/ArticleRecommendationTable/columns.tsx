import type { MetricColumnConfig } from '@repo/reporting'

export const ARTICLE_RECOMMENDATION_TABLE = {
    title: 'Article Recommendation',
    description:
        'Automation performance metrics per article recommendation, including automation rate, automated interactions, and handover interactions.',
}

export const ARTICLE_RECOMMENDATION_COLUMNS: MetricColumnConfig[] = [
    {
        accessorKey: 'automationRate',
        label: 'Automation rate',
        tooltipTitle: 'Automation rate',
        tooltipCaption:
            'The percentage of interactions that were automated by article recommendations.',
        metricFormat: 'percent-precision-1',
        loadingStateKeys: ['automationRate'],
    },
    {
        accessorKey: 'automatedInteractions',
        label: 'Automated interactions',
        tooltipTitle: 'Automated interactions per article',
        tooltipCaption:
            'The number of fully automated interactions where an article recommendation resolved the customer request.',
        metricFormat: 'decimal',
        loadingStateKeys: ['automatedInteractions'],
    },
    {
        accessorKey: 'handoverInteractions',
        label: 'Handover interactions',
        tooltipTitle: 'Handover interactions per article',
        tooltipCaption:
            'The number of interactions where the customer was served by an agent after receiving an article recommendation.',
        metricFormat: 'decimal',
        loadingStateKeys: ['handoverInteractions'],
    },
]
