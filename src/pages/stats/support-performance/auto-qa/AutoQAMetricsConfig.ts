import {
    fetchAccuracyTrend,
    useAccuracyTrend,
} from 'hooks/reporting/support-performance/auto-qa/useAccuracyTrend'
import {
    fetchBrandVoiceTrend,
    useBrandVoiceTrend,
} from 'hooks/reporting/support-performance/auto-qa/useBrandVoiceTrend'
import {
    fetchCommunicationSkillsTrend,
    useCommunicationSkillsTrend,
} from 'hooks/reporting/support-performance/auto-qa/useCommunicationSkillsTrend'
import {
    fetchEfficiencyTrend,
    useEfficiencyTrend,
} from 'hooks/reporting/support-performance/auto-qa/useEfficiencyTrend'
import {
    fetchInternalComplianceTrend,
    useInternalComplianceTrend,
} from 'hooks/reporting/support-performance/auto-qa/useInternalComplianceTrend'
import {
    fetchLanguageProficiencyTrend,
    useLanguageProficiencyTrend,
} from 'hooks/reporting/support-performance/auto-qa/useLanguageProficiencyTrend'
import {
    fetchResolutionCompletenessTrend,
    useResolutionCompletenessTrend,
} from 'hooks/reporting/support-performance/auto-qa/useResolutionCompletenessTrend'
import {
    fetchReviewedClosedTicketsTrend,
    useReviewedClosedTicketsTrend,
} from 'hooks/reporting/support-performance/auto-qa/useReviewedClosedTicketsTrend'
import {
    MetricTrendFetch,
    MetricTrendHook,
} from 'hooks/reporting/useMetricTrend'
import { MetricTrendFormat } from 'pages/stats/common/utils'
import { TooltipData } from 'pages/stats/types'
import { AutoQAMetric } from 'state/ui/stats/types'

export const REVIEWED_CLOSED_TICKETS_LABEL = 'Reviewed tickets'
export const RESOLUTION_COMPLETENESS_LABEL = 'Resolution completeness rate'
export const RESOLUTION_COMPLETENESS_SHORT_LABEL = 'Resolution'
export const COMMUNICATION_SKILLS_LABEL = 'Communication'
export const LANGUAGE_PROFICIENCY_SKILLS_LABEL = 'Language proficiency'
export const ACCURACY_LABEL = 'Accuracy'
export const EFFICIENCY_LABEL = 'Efficiency'
export const INTERNAL_COMPLIANCE_LABEL = 'Internal compliance'
export const BRAND_VOICE_LABEL = 'Brand voice'
export const COMPLETENESS_STATUS_COMPLETE = 'Complete'
export const COMPLETENESS_STATUS_INCOMPLETE = 'Incomplete'
export const HINT_LINK_TEXT = 'Learn more'

export const TrendCardConfig: Record<
    AutoQAMetric,
    {
        hint: TooltipData
        title: string
        useTrend: MetricTrendHook
        fetchTrend: MetricTrendFetch
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
        fetchTrend: fetchReviewedClosedTicketsTrend,
        drillDownMetric: AutoQAMetric.ReviewedClosedTickets,
    },
    [AutoQAMetric.ResolutionCompleteness]: {
        title: RESOLUTION_COMPLETENESS_LABEL,
        hint: {
            title: 'Percentage of tickets where the agent addressed ALL customer inquiries. \n\nNote: Only closed tickets with at least 1 customer message and 1 agent message are auto-evaluated for response completeness.',
            link: 'https://link.gorgias.com/oau',
            linkText: HINT_LINK_TEXT,
        },
        interpretAs: 'more-is-better',
        metricFormat: 'decimal-to-percent',
        useTrend: useResolutionCompletenessTrend,
        fetchTrend: fetchResolutionCompletenessTrend,
        drillDownMetric: AutoQAMetric.ResolutionCompleteness,
    },
    [AutoQAMetric.Accuracy]: {
        title: ACCURACY_LABEL,
        hint: {
            title: 'Average score assessing whether the agent provided accurate information and resolution.\n\nNote: This category needs to be manually scored.',
            link: 'https://link.gorgias.com/oau',
        },
        interpretAs: 'more-is-better',
        metricFormat: 'decimal',
        useTrend: useAccuracyTrend,
        fetchTrend: fetchAccuracyTrend,
        drillDownMetric: AutoQAMetric.Accuracy,
    },
    [AutoQAMetric.InternalCompliance]: {
        title: INTERNAL_COMPLIANCE_LABEL,
        hint: {
            title: 'Average score assessing whether the agent followed internal processes: used the correct macros, tags, escalation and merging procedures.\n\nNote: This category needs to be manually scored.',
            link: 'https://link.gorgias.com/oau',
        },
        interpretAs: 'more-is-better',
        metricFormat: 'decimal',
        useTrend: useInternalComplianceTrend,
        fetchTrend: fetchInternalComplianceTrend,
        drillDownMetric: AutoQAMetric.InternalCompliance,
    },
    [AutoQAMetric.Efficiency]: {
        title: EFFICIENCY_LABEL,
        hint: {
            title: 'Average score assessing whether the agent handled the ticket quickly and minimized the number of touches.\n\nNote: This category needs to be manually scored.',
            link: 'https://link.gorgias.com/oau',
        },
        interpretAs: 'more-is-better',
        metricFormat: 'decimal',
        useTrend: useEfficiencyTrend,
        fetchTrend: fetchEfficiencyTrend,
        drillDownMetric: AutoQAMetric.Efficiency,
    },
    [AutoQAMetric.CommunicationSkills]: {
        title: COMMUNICATION_SKILLS_LABEL,
        hint: {
            title: 'Average score assessing agent’s empathy, clarity, patience, positivity, and adaptability.\n\nNote: Only closed tickets with at least 1 customer message and 1 agent message are auto-evaluated for communication.',
            link: 'https://link.gorgias.com/oau',
            linkText: HINT_LINK_TEXT,
        },
        interpretAs: 'more-is-better',
        metricFormat: 'decimal',
        useTrend: useCommunicationSkillsTrend,
        fetchTrend: fetchCommunicationSkillsTrend,
        drillDownMetric: AutoQAMetric.CommunicationSkills,
    },
    [AutoQAMetric.LanguageProficiency]: {
        title: LANGUAGE_PROFICIENCY_SKILLS_LABEL,
        hint: {
            title: 'Average score assessing whether the agent showed high proficiency in the language of the conversation: flawless spelling, grammar, syntax. \n \nThe score (1-5) is computed by AI on closed tickets with at least 1 customer message and 1 agent message.',
            link: 'https://link.gorgias.com/oau',
            linkText: HINT_LINK_TEXT,
        },
        interpretAs: 'more-is-better',
        metricFormat: 'decimal',
        useTrend: useLanguageProficiencyTrend,
        fetchTrend: fetchLanguageProficiencyTrend,
        drillDownMetric: AutoQAMetric.LanguageProficiency,
    },
    [AutoQAMetric.BrandVoice]: {
        title: BRAND_VOICE_LABEL,
        hint: {
            title: 'Average score assessing whether the agent used the brand vocabulary, greetings, sign-offs and tone of voice.\n\nNote: This category needs to be manually scored.',
            link: 'https://link.gorgias.com/oau',
        },
        interpretAs: 'more-is-better',
        metricFormat: 'decimal',
        useTrend: useBrandVoiceTrend,
        fetchTrend: fetchBrandVoiceTrend,
        drillDownMetric: AutoQAMetric.BrandVoice,
    },
}
