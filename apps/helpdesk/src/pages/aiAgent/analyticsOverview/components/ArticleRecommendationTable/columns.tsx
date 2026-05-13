import type { MetricColumnConfig } from '@repo/reporting'

import { METRIC_TOOLTIPS } from 'domains/reporting/config/metricTooltipDefinitions'

export const ARTICLE_RECOMMENDATION_TABLE = {
    title: 'Article Recommendation',
    description:
        'Automation performance metrics per article recommendation, including automation rate, automated interactions, and handover interactions.',
}

export const ARTICLE_RECOMMENDATION_COLUMNS: MetricColumnConfig[] = [
    {
        accessorKey: 'successRate',
        label: 'Success rate',
        tooltipConfig: METRIC_TOOLTIPS.successRateArticleRecommendation,
        metricFormat: 'percent-precision-1',
        loadingStateKeys: ['successRate'],
    },
    {
        accessorKey: 'automatedInteractions',
        label: 'Automated interactions',
        tooltipConfig: METRIC_TOOLTIPS.automatedInteractionsInOverview,
        metricFormat: 'decimal',
        loadingStateKeys: ['automatedInteractions'],
    },
    {
        accessorKey: 'handoverInteractions',
        label: 'Handover interactions',
        tooltipConfig: METRIC_TOOLTIPS.handoverInteractionsInOverview,
        metricFormat: 'decimal',
        loadingStateKeys: ['handoverInteractions'],
    },
]
