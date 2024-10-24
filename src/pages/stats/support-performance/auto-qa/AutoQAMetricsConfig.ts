import {useCommunicationSkillsTrend} from 'hooks/reporting/support-performance/auto-qa/useCommunicationSkillsTrend'
import {useResolutionCompletenessTrend} from 'hooks/reporting/support-performance/auto-qa/useResolutionCompletenessTrend'
import {useReviewedClosedTicketsTrend} from 'hooks/reporting/support-performance/auto-qa/useReviewedClosedTicketsTrend'
import {MetricTrendHook} from 'hooks/reporting/useMetricTrend'
import {MetricTrendFormat} from 'pages/stats/common/utils'
import {TooltipData} from 'pages/stats/types'
import {AutoQAMetric} from 'state/ui/stats/types'

export const REVIEWED_CLOSED_TICKETS_LABEL = 'Reviewed tickets'
export const RESOLUTION_COMPLETENESS_LABEL = 'Resolution completeness rate'
export const RESOLUTION_COMPLETENESS_SHORT_LABEL = 'Resolution'
export const COMMUNICATION_SKILLS_LABEL = 'Communication'
export const COMPLETENESS_STATUS_COMPLETE = 'Complete'
export const COMPLETENESS_STATUS_INCOMPLETE = 'Incomplete'

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
        title: REVIEWED_CLOSED_TICKETS_LABEL,
        hint: {
            title: 'Number of closed tickets that were reviewed (automatically or manually) during the period.\n\nNote: Only closed tickets with at least 1 customer message and 1 agent message are auto-evaluated.',
        },
        interpretAs: 'more-is-better',
        metricFormat: 'decimal',
        useTrend: useReviewedClosedTicketsTrend,
        drillDownMetric: AutoQAMetric.ReviewedClosedTickets,
    },
    [AutoQAMetric.ResolutionCompleteness]: {
        title: RESOLUTION_COMPLETENESS_LABEL,
        hint: {
            title: 'Percentage of tickets where the agent addressed ALL customer inquiries. \n\nNote: Only closed tickets with at least 1 customer message and 1 agent message are auto-evaluated for response completeness.',
            link: 'https://link.gorgias.com/oau',
        },
        interpretAs: 'more-is-better',
        metricFormat: 'decimal-to-percent',
        useTrend: useResolutionCompletenessTrend,
        drillDownMetric: AutoQAMetric.ResolutionCompleteness,
    },
    [AutoQAMetric.CommunicationSkills]: {
        title: COMMUNICATION_SKILLS_LABEL,
        hint: {
            title: 'Average score assessing agent’s empathy, clarity, patience, positivity, and adaptability.\n\nNote: Only closed tickets with at least 1 customer message and 1 agent message are auto-evaluated for communication.',
            link: 'https://link.gorgias.com/oau',
        },
        interpretAs: 'more-is-better',
        metricFormat: 'decimal',
        useTrend: useCommunicationSkillsTrend,
        drillDownMetric: AutoQAMetric.CommunicationSkills,
    },
}
