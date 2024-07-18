import {useReviewedClosedTicketsTrend} from 'hooks/reporting/support-performance/auto-qa/useReviewedClosedTicketsTrend'
import {MetricTrendHook} from 'hooks/reporting/useMetricTrend'
import {MetricTrendFormat} from 'pages/stats/common/utils'
import {TooltipData} from 'pages/stats/types'
import {AutoQAMetric, SlaMetric} from 'state/ui/stats/types'

export const TrendCardConfig: Record<
    AutoQAMetric,
    {
        hint: TooltipData
        title: string
        useTrend: MetricTrendHook
        interpretAs: 'more-is-better' | 'less-is-better' | 'neutral'
        metricFormat: MetricTrendFormat
        drillDownMetric: SlaMetric
    }
> = {
    [AutoQAMetric.ReviewedClosedTickets]: {
        title: 'Number of closed tickets reviewed',
        hint: {
            title: 'Number of closed tickets that were automatically or manually QAed during the period.',
        },
        interpretAs: 'more-is-better',
        metricFormat: 'decimal',
        useTrend: useReviewedClosedTicketsTrend,
        drillDownMetric: SlaMetric.BreachedTicketsRate,
    },
}
