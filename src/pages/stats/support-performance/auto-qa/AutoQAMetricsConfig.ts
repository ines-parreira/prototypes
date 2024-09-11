import {useResolutionCompletenessTrend} from 'hooks/reporting/support-performance/auto-qa/useResolutionCompletenessTrend'
import {useReviewedClosedTicketsTrend} from 'hooks/reporting/support-performance/auto-qa/useReviewedClosedTicketsTrend'
import {MetricTrendHook} from 'hooks/reporting/useMetricTrend'
import {MetricTrendFormat} from 'pages/stats/common/utils'
import {TooltipData} from 'pages/stats/types'
import {AutoQAMetric} from 'state/ui/stats/types'

export const TrendCardConfig: Record<
    AutoQAMetric,
    {
        hint: TooltipData
        title: string
        useTrend: MetricTrendHook
        interpretAs: 'more-is-better' | 'less-is-better' | 'neutral'
        metricFormat: MetricTrendFormat
        drillDownMetric: AutoQAMetric
    }
> = {
    [AutoQAMetric.ReviewedClosedTickets]: {
        title: 'Reviewed tickets',
        hint: {
            title: 'Number of closed tickets that were reviewed (automatically or manually) during the period.\n\nNote: Only closed tickets with at least 1 customer message and 1 agent/rule message are auto-evaluated.',
            link: 'https://link.gorgias.com/xxn',
        },
        interpretAs: 'more-is-better',
        metricFormat: 'decimal',
        useTrend: useReviewedClosedTicketsTrend,
        drillDownMetric: AutoQAMetric.ReviewedClosedTickets,
    },
    [AutoQAMetric.ResolutionCompleteness]: {
        title: 'Resolution completeness rate',
        hint: {
            title: 'Percentage of tickets where the agent addressed ALL customer inquiries. \n\nNote: Only closed tickets with at least 1 customer message and 1 agent/rule message are auto-evaluated for response completeness.',
            link: 'https://link.gorgias.com/e4a',
        },
        interpretAs: 'more-is-better',
        metricFormat: 'percent',
        useTrend: useResolutionCompletenessTrend,
        drillDownMetric: AutoQAMetric.ResolutionCompleteness,
    },
}
