import { useBreachedSlaTicketsTrend } from 'domains/reporting/hooks/sla/useSLAsTicketsTrends'
import { useTicketSlaAchievementRateTrend } from 'domains/reporting/hooks/sla/useTicketSlaAchievementRate'
import type { MetricTrendHook } from 'domains/reporting/hooks/useMetricTrend'
import {
    breachedTicketsDrillDownQueryFactory,
    satisfiedOrBreachedTicketsDrillDownQueryFactory,
} from 'domains/reporting/models/queryFactories/sla/satisfiedOrBreachedTickets'
import type { DrillDownQueryFactory } from 'domains/reporting/pages/common/drill-down/types'
import { Domain } from 'domains/reporting/pages/common/drill-down/types'
import type { MetricTrendFormat } from 'domains/reporting/pages/common/utils'
import type { TooltipData } from 'domains/reporting/pages/types'
import { SlaMetric } from 'domains/reporting/state/ui/stats/types'

export const SLA_STATUS_COLUMN_LABEL = 'SLA status'

export const SLA_FORMAT = 'sla'

export const SlaMetricConfig: Record<
    SlaMetric,
    {
        hint: TooltipData
        title: string
        useTrend: MetricTrendHook
        interpretAs: 'more-is-better' | 'less-is-better' | 'neutral'
        metricFormat: MetricTrendFormat
        drillDownMetric: SlaMetric
        showMetric: boolean
        domain: Domain.Ticket
        drillDownQuery: DrillDownQueryFactory
        drillDownTitle: string
        drillDownFormat: typeof SLA_FORMAT
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
        showMetric: true,
        domain: Domain.Ticket,
        drillDownQuery: satisfiedOrBreachedTicketsDrillDownQueryFactory,
        drillDownTitle: SLA_STATUS_COLUMN_LABEL,
        drillDownFormat: SLA_FORMAT,
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
        showMetric: true,
        domain: Domain.Ticket,
        drillDownQuery: breachedTicketsDrillDownQueryFactory,
        drillDownTitle: SLA_STATUS_COLUMN_LABEL,
        drillDownFormat: SLA_FORMAT,
    },
}
