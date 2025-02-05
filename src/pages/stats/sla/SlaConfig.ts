import {useBreachedSlaTicketsTrend} from 'hooks/reporting/sla/useSLAsTicketsTrends'
import {useTicketSlaAchievementRateTrend} from 'hooks/reporting/sla/useTicketSlaAchievementRate'
import {MetricTrendHook} from 'hooks/reporting/useMetricTrend'
import {MetricTrendFormat} from 'pages/stats/common/utils'
import {TooltipData} from 'pages/stats/types'
import {SlaMetric} from 'state/ui/stats/types'

export const SLA_STATUS_COLUMN_LABEL = 'SLA status'

export const SlaMetricConfig: Record<
    SlaMetric,
    {
        hint: TooltipData
        title: string
        useTrend: MetricTrendHook
        interpretAs: 'more-is-better' | 'less-is-better' | 'neutral'
        metricFormat: MetricTrendFormat
        drillDownMetric: SlaMetric
    }
> = {
    [SlaMetric.AchievementRate]: {
        hint: {
            title: 'Percentage of tickets where your team met the SLA during the selected timeframe',
            link: 'https://link.gorgias.com/jyy',
        },
        title: 'Achievement rate',
        useTrend: useTicketSlaAchievementRateTrend,
        interpretAs: 'more-is-better',
        metricFormat: 'percent',
        drillDownMetric: SlaMetric.AchievementRate,
    },
    [SlaMetric.BreachedTicketsRate]: {
        hint: {
            title: 'Number of tickets that breached the SLA policy during the selected timeframe',
            link: 'https://link.gorgias.com/b9p',
        },
        title: 'Tickets with breached SLAs',
        useTrend: useBreachedSlaTicketsTrend,
        interpretAs: 'less-is-better',
        metricFormat: 'decimal',
        drillDownMetric: SlaMetric.BreachedTicketsRate,
    },
}
