import {useTicketSlaAchievementRateTrend} from 'hooks/reporting/sla/useTicketSlaAchievementRate'
import {MetricTrendHook} from 'hooks/reporting/useMetricTrend'
import {MetricTrendFormat} from 'pages/stats/common/utils'
import {SlaMetric} from 'pages/stats/sla/types'
import {TooltipData} from 'pages/stats/types'

export const SlaMetricConfig: Record<
    SlaMetric,
    {
        hint: TooltipData
        title: string
        useTrend: MetricTrendHook
        interpretAs: 'more-is-better' | 'less-is-better' | 'neutral'
        metricFormat?: MetricTrendFormat
    }
> = {
    [SlaMetric.AchievementRate]: {
        hint: {
            title: 'Percentage of tickets where your team met the SLA during the selected timeframe',
        },
        title: 'Achievement rate',
        useTrend: useTicketSlaAchievementRateTrend,
        interpretAs: 'more-is-better',
        metricFormat: 'percent',
    },
}
