import {useResolvedTicketsTrend} from 'hooks/reporting/support-performance/auto-qa/useResolvedTicketsTrend'
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
    [AutoQAMetric.ResolvedTickets]: {
        title: 'Resolved Tickets',
        hint: {
            title: 'Ratio of tickets where the agent addressed ALL the enquiries of the customer. \nThe score (0-1) is computed by AI on closed tickets with at least 1 customer message and 1 agent/rule message.',
            link: 'https://link.gorgias.com/e4a',
        },
        interpretAs: 'less-is-better',
        metricFormat: 'decimal',
        useTrend: useResolvedTicketsTrend,
        drillDownMetric: AutoQAMetric.ResolvedTickets,
    },
}
