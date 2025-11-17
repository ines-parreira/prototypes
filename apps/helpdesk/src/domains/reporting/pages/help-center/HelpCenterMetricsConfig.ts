import type { MetricTrendHook } from 'domains/reporting/hooks/useMetricTrend'
import type { MetricTrendFormat } from 'domains/reporting/pages/common/utils'
import { useArticleViewsTrend } from 'domains/reporting/pages/help-center/hooks/useArticleViewsTrend'
import { useSearchRequestedTrend } from 'domains/reporting/pages/help-center/hooks/useSearchRequestedTrend'

export const SEARCH_RESULTS_DONUT_TITLE = 'Search results'
export const SEARCH_RESULTS_DONUT_TOOLTIP = {
    title: 'Distribution of total searches resulting in articles shown to the user vs. no search results',
}

export enum HelpCenterMetric {
    ArticleViews = 'article_views',
    SearchRequested = 'search_requested',
}

export const HelpCenterMetricConfig: Record<
    HelpCenterMetric,
    {
        hint: {
            title: string
            link?: string
        }
        title: string
        useTrend: MetricTrendHook
        interpretAs: 'more-is-better' | 'less-is-better' | 'neutral'
        metricFormat: MetricTrendFormat
    }
> = {
    [HelpCenterMetric.ArticleViews]: {
        title: 'Article views',
        hint: {
            title: 'Total number of article views, including duplicate views by the same user',
            link: 'https://docs.gorgias.com/en-US',
        },
        interpretAs: 'more-is-better',
        metricFormat: 'decimal',
        useTrend: useArticleViewsTrend,
    },
    [HelpCenterMetric.SearchRequested]: {
        title: 'Searches',
        hint: {
            title: 'Total number of searches performed in the Help Center',
            link: 'https://docs.gorgias.com/en-US',
        },
        interpretAs: 'more-is-better',
        metricFormat: 'decimal',
        useTrend: useSearchRequestedTrend,
    },
}
