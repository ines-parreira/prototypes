import { User } from 'config/types/user'
import { useAccuracyPerAgent } from 'domains/reporting/hooks/support-performance/auto-qa/useAccuracyPerAgent'
import { useBrandVoicePerAgent } from 'domains/reporting/hooks/support-performance/auto-qa/useBrandVoicePerAgent'
import { useCommunicationSkillsPerAgent } from 'domains/reporting/hooks/support-performance/auto-qa/useCommunicationSkillsPerAgent'
import { useEfficiencyPerAgent } from 'domains/reporting/hooks/support-performance/auto-qa/useEfficiencyPerAgent'
import { useInternalCompliancePerAgent } from 'domains/reporting/hooks/support-performance/auto-qa/useInternalCompliancePerAgent'
import { useLanguageProficiencyPerAgent } from 'domains/reporting/hooks/support-performance/auto-qa/useLanguageProficiencyPerAgent'
import { useResolutionCompletenessPerAgent } from 'domains/reporting/hooks/support-performance/auto-qa/useResolutionCompletenessPerAgent'
import { useReviewedClosedTicketsPerAgent } from 'domains/reporting/hooks/support-performance/auto-qa/useReviewedClosedTicketsPerAgent'
import { accuracyDrillDownQueryFactory } from 'domains/reporting/models/queryFactories/auto-qa/accuracyQueryFactory'
import { brandVoiceDrillDownQueryFactory } from 'domains/reporting/models/queryFactories/auto-qa/brandVoiceQueryFactory'
import { communicationSkillsDrillDownQueryFactory } from 'domains/reporting/models/queryFactories/auto-qa/communicationSkillsQueryFactory'
import { efficiencyDrillDownQueryFactory } from 'domains/reporting/models/queryFactories/auto-qa/efficiencyQueryFactory'
import { internalComplianceDrillDownQueryFactory } from 'domains/reporting/models/queryFactories/auto-qa/internalComplianceQueryFactory'
import { languageProficiencyDrillDownQueryFactory } from 'domains/reporting/models/queryFactories/auto-qa/languageProficiencyQueryFactory'
import { resolutionCompletenessDrillDownQueryFactory } from 'domains/reporting/models/queryFactories/auto-qa/resolutionCompletenessQueryFactory'
import { reviewedClosedTicketsDrillDownQueryFactory } from 'domains/reporting/models/queryFactories/auto-qa/reviewedClosedTicketsQueryFactory'
import {
    Domain,
    DrillDownQueryFactory,
} from 'domains/reporting/pages/common/drill-down/types'
import { MetricValueFormat } from 'domains/reporting/pages/common/utils'
import {
    AGENT_NAME_COLUMN_WIDTH,
    METRIC_COLUMN_WIDTH,
    MetricQueryPerAgentQuery,
    MOBILE_AGENT_NAME_COLUMN_WIDTH,
    MOBILE_METRIC_COLUMN_WIDTH,
} from 'domains/reporting/pages/support-performance/agents/AgentsTableConfig'
import {
    ACCURACY_LABEL,
    BRAND_VOICE_LABEL,
    COMMUNICATION_SKILLS_LABEL,
    EFFICIENCY_LABEL,
    INTERNAL_COMPLIANCE_LABEL,
    LANGUAGE_PROFICIENCY_SKILLS_LABEL,
    RESOLUTION_COMPLETENESS_LABEL,
    REVIEWED_CLOSED_TICKETS_LABEL,
    TrendCardConfig,
} from 'domains/reporting/pages/support-performance/auto-qa/AutoQAMetricsConfig'
import { TooltipData } from 'domains/reporting/pages/types'
import { AutoQAAgentMetric } from 'domains/reporting/state/ui/stats/drillDownSlice'
import { AutoQAMetric } from 'domains/reporting/state/ui/stats/types'
import { isMediumOrSmallScreen } from 'pages/common/utils/mobile'

export enum AutoQAAgentsTableColumn {
    AgentName = 'auto_qa_table_agent_name',
    ReviewedClosedTickets = 'auto_qa_table_reviewed_closed_tickets',
    ResolutionCompleteness = 'auto_qa_table_resolution_completeness',
    Accuracy = 'auto_qa_table_accuracy',
    InternalCompliance = 'auto_qa_table_internal_compliance',
    Efficiency = 'auto_qa_table_efficiency',
    CommunicationSkills = 'auto_qa_table_communication_skills',
    LanguageProficiency = 'auto_qa_table_language_proficiency',
    BrandVoice = 'auto_qa_table_brand_voice',
}

export const AUTO_QA_AGENTS_TABLE_DIMENSIONS_COLUMNS_ORDER = [
    AutoQAAgentsTableColumn.AgentName,
    AutoQAAgentsTableColumn.ReviewedClosedTickets,
    AutoQAAgentsTableColumn.ResolutionCompleteness,
    AutoQAAgentsTableColumn.Accuracy,
    AutoQAAgentsTableColumn.InternalCompliance,
    AutoQAAgentsTableColumn.Efficiency,
    AutoQAAgentsTableColumn.CommunicationSkills,
    AutoQAAgentsTableColumn.LanguageProficiency,
    AutoQAAgentsTableColumn.BrandVoice,
]

export const TableLabels: Record<AutoQAAgentsTableColumn, string> = {
    [AutoQAAgentsTableColumn.AgentName]: 'Agent',
    [AutoQAAgentsTableColumn.ReviewedClosedTickets]:
        REVIEWED_CLOSED_TICKETS_LABEL,
    [AutoQAAgentsTableColumn.ResolutionCompleteness]:
        RESOLUTION_COMPLETENESS_LABEL,
    [AutoQAAgentsTableColumn.Accuracy]: ACCURACY_LABEL,
    [AutoQAAgentsTableColumn.InternalCompliance]: INTERNAL_COMPLIANCE_LABEL,
    [AutoQAAgentsTableColumn.Efficiency]: EFFICIENCY_LABEL,
    [AutoQAAgentsTableColumn.CommunicationSkills]: COMMUNICATION_SKILLS_LABEL,
    [AutoQAAgentsTableColumn.LanguageProficiency]:
        LANGUAGE_PROFICIENCY_SKILLS_LABEL,
    [AutoQAAgentsTableColumn.BrandVoice]: BRAND_VOICE_LABEL,
}

export const AutoQAAgentsColumnConfig: Record<
    AutoQAAgentsTableColumn,
    {
        title: string
        format: MetricValueFormat
        hint: TooltipData | null
        showMetric: boolean
        domain: Domain.Ticket
        drillDownQuery: DrillDownQueryFactory
    }
> = {
    [AutoQAAgentsTableColumn.AgentName]: {
        title: 'Agent',
        format: 'integer',
        hint: null,
        showMetric: false,
        domain: Domain.Ticket,
        drillDownQuery: reviewedClosedTicketsDrillDownQueryFactory, // TODO cleanup
    },
    [AutoQAAgentsTableColumn.ReviewedClosedTickets]: {
        title: TrendCardConfig[AutoQAMetric.ReviewedClosedTickets].title,
        format: TrendCardConfig[AutoQAMetric.ReviewedClosedTickets]
            .metricFormat,
        hint: TrendCardConfig[AutoQAMetric.ReviewedClosedTickets].hint,
        showMetric: false,
        domain: Domain.Ticket,
        drillDownQuery: reviewedClosedTicketsDrillDownQueryFactory,
    },
    [AutoQAAgentsTableColumn.ResolutionCompleteness]: {
        title: TrendCardConfig[AutoQAMetric.ResolutionCompleteness].title,
        format: TrendCardConfig[AutoQAMetric.ResolutionCompleteness]
            .metricFormat,
        hint: TrendCardConfig[AutoQAMetric.ResolutionCompleteness].hint,
        showMetric: false,
        domain: Domain.Ticket,
        drillDownQuery: resolutionCompletenessDrillDownQueryFactory,
    },
    [AutoQAAgentsTableColumn.Accuracy]: {
        title: TrendCardConfig[AutoQAMetric.Accuracy].title,
        format: TrendCardConfig[AutoQAMetric.Accuracy].metricFormat,
        hint: TrendCardConfig[AutoQAMetric.Accuracy].hint,
        showMetric: true,
        domain: Domain.Ticket,
        drillDownQuery: accuracyDrillDownQueryFactory,
    },
    [AutoQAAgentsTableColumn.InternalCompliance]: {
        title: TrendCardConfig[AutoQAMetric.InternalCompliance].title,
        format: TrendCardConfig[AutoQAMetric.InternalCompliance].metricFormat,
        hint: TrendCardConfig[AutoQAMetric.InternalCompliance].hint,
        showMetric: true,
        domain: Domain.Ticket,
        drillDownQuery: internalComplianceDrillDownQueryFactory,
    },
    [AutoQAAgentsTableColumn.Efficiency]: {
        title: TrendCardConfig[AutoQAMetric.Efficiency].title,
        format: TrendCardConfig[AutoQAMetric.Efficiency].metricFormat,
        hint: TrendCardConfig[AutoQAMetric.Efficiency].hint,
        showMetric: true,
        domain: Domain.Ticket,
        drillDownQuery: efficiencyDrillDownQueryFactory,
    },
    [AutoQAAgentsTableColumn.CommunicationSkills]: {
        title: TrendCardConfig[AutoQAMetric.CommunicationSkills].title,
        format: TrendCardConfig[AutoQAMetric.CommunicationSkills].metricFormat,
        hint: TrendCardConfig[AutoQAMetric.CommunicationSkills].hint,
        showMetric: true,
        domain: Domain.Ticket,
        drillDownQuery: communicationSkillsDrillDownQueryFactory,
    },
    [AutoQAAgentsTableColumn.LanguageProficiency]: {
        title: TrendCardConfig[AutoQAMetric.LanguageProficiency].title,
        format: TrendCardConfig[AutoQAMetric.LanguageProficiency].metricFormat,
        hint: TrendCardConfig[AutoQAMetric.LanguageProficiency].hint,
        showMetric: true,
        domain: Domain.Ticket,
        drillDownQuery: languageProficiencyDrillDownQueryFactory,
    },
    [AutoQAAgentsTableColumn.BrandVoice]: {
        title: TrendCardConfig[AutoQAMetric.BrandVoice].title,
        format: TrendCardConfig[AutoQAMetric.BrandVoice].metricFormat,
        hint: TrendCardConfig[AutoQAMetric.BrandVoice].hint,
        showMetric: true,
        domain: Domain.Ticket,
        drillDownQuery: brandVoiceDrillDownQueryFactory,
    },
}

export const getQuery = (
    column: AutoQAAgentsTableColumn,
): MetricQueryPerAgentQuery => {
    switch (column) {
        case AutoQAAgentsTableColumn.AgentName:
            return () => ({
                isFetching: false,
                isError: false,
                data: null,
            })
        case AutoQAAgentsTableColumn.ReviewedClosedTickets:
            return useReviewedClosedTicketsPerAgent
        case AutoQAAgentsTableColumn.ResolutionCompleteness:
            return useResolutionCompletenessPerAgent
        case AutoQAAgentsTableColumn.Accuracy:
            return useAccuracyPerAgent
        case AutoQAAgentsTableColumn.InternalCompliance:
            return useInternalCompliancePerAgent
        case AutoQAAgentsTableColumn.Efficiency:
            return useEfficiencyPerAgent
        case AutoQAAgentsTableColumn.CommunicationSkills:
            return useCommunicationSkillsPerAgent
        case AutoQAAgentsTableColumn.LanguageProficiency:
            return useLanguageProficiencyPerAgent
        case AutoQAAgentsTableColumn.BrandVoice:
            return useBrandVoicePerAgent
    }
}

export const getColumnWidth = (column: AutoQAAgentsTableColumn) => {
    if (isMediumOrSmallScreen()) {
        return column === AutoQAAgentsTableColumn.AgentName
            ? MOBILE_AGENT_NAME_COLUMN_WIDTH
            : MOBILE_METRIC_COLUMN_WIDTH
    }
    return column === AutoQAAgentsTableColumn.AgentName
        ? AGENT_NAME_COLUMN_WIDTH
        : METRIC_COLUMN_WIDTH
}

export const getColumnAlignment = (column: AutoQAAgentsTableColumn) =>
    column === AutoQAAgentsTableColumn.AgentName ? 'left' : 'right'

const isAutoQAAgentsMetric = (
    column: AutoQAAgentsTableColumn,
): column is AutoQAAgentMetric => column !== AutoQAAgentsTableColumn.AgentName

export const buildAgentMetric = (column: AutoQAAgentMetric, agent: User) => ({
    title: `${TableLabels[column]} | ${agent.name}`,
    metricName: column,
    perAgentId: agent.id,
})

export function getDrillDownMetricData(
    column: AutoQAAgentsTableColumn,
    agent: User,
) {
    if (isAutoQAAgentsMetric(column)) {
        return buildAgentMetric(column, agent)
    }
    return null
}
