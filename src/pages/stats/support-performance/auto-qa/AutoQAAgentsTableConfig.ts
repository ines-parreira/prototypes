import {User} from 'config/types/user'
import {useCommunicationSkillsPerAgent} from 'hooks/reporting/support-performance/auto-qa/useCommunicationSkillsPerAgent'
import {useLanguageProficiencyPerAgent} from 'hooks/reporting/support-performance/auto-qa/useLanguageProficiencyPerAgent'
import {useResolutionCompletenessPerAgent} from 'hooks/reporting/support-performance/auto-qa/useResolutionCompletenessPerAgent'
import {useReviewedClosedTicketsPerAgent} from 'hooks/reporting/support-performance/auto-qa/useReviewedClosedTicketsPerAgent'
import {isMediumOrSmallScreen} from 'pages/common/utils/mobile'
import {MetricValueFormat} from 'pages/stats/common/utils'
import {
    AGENT_NAME_COLUMN_WIDTH,
    METRIC_COLUMN_WIDTH,
    MetricQueryPerAgentQuery,
    MOBILE_AGENT_NAME_COLUMN_WIDTH,
    MOBILE_METRIC_COLUMN_WIDTH,
} from 'pages/stats/support-performance/agents/AgentsTableConfig'
import {
    COMMUNICATION_SKILLS_LABEL,
    LANGUAGE_PROFICIENCY_SKILLS_LABEL,
    RESOLUTION_COMPLETENESS_LABEL,
    REVIEWED_CLOSED_TICKETS_LABEL,
    TrendCardConfig,
} from 'pages/stats/support-performance/auto-qa/AutoQAMetricsConfig'
import {TooltipData} from 'pages/stats/types'
import {AutoQAAgentMetric} from 'state/ui/stats/drillDownSlice'
import {AutoQAMetric} from 'state/ui/stats/types'

export enum AutoQAAgentsTableColumn {
    AgentName = 'auto_qa_table_agent_name',
    ReviewedClosedTickets = 'auto_qa_table_reviewed_closed_tickets',
    ResolutionCompleteness = 'auto_qa_table_resolution_completeness',
    CommunicationSkills = 'auto_qa_table_communication_skills',
    LanguageProficiency = 'auto_qa_table_language_proficiency',
}

export const AUTO_QA_AGENTS_TABLE_COLUMNS_ORDER = [
    AutoQAAgentsTableColumn.AgentName,
    AutoQAAgentsTableColumn.ReviewedClosedTickets,
    AutoQAAgentsTableColumn.ResolutionCompleteness,
    AutoQAAgentsTableColumn.CommunicationSkills,
]

export const AUTO_QA_AGENTS_TABLE_COLUMNS_ORDER_WITH_LANGUAGE = [
    ...AUTO_QA_AGENTS_TABLE_COLUMNS_ORDER,
    AutoQAAgentsTableColumn.LanguageProficiency,
]

export const TableLabels: Record<AutoQAAgentsTableColumn, string> = {
    [AutoQAAgentsTableColumn.AgentName]: 'Agent',
    [AutoQAAgentsTableColumn.ResolutionCompleteness]:
        RESOLUTION_COMPLETENESS_LABEL,
    [AutoQAAgentsTableColumn.ReviewedClosedTickets]:
        REVIEWED_CLOSED_TICKETS_LABEL,
    [AutoQAAgentsTableColumn.CommunicationSkills]: COMMUNICATION_SKILLS_LABEL,
    [AutoQAAgentsTableColumn.LanguageProficiency]:
        LANGUAGE_PROFICIENCY_SKILLS_LABEL,
}

export const AutoQAAgentsColumnConfig: Record<
    AutoQAAgentsTableColumn,
    {
        title: string
        format: MetricValueFormat
        hint: TooltipData | null
    }
> = {
    [AutoQAAgentsTableColumn.AgentName]: {
        title: 'Agent',
        format: 'integer',
        hint: null,
    },
    [AutoQAAgentsTableColumn.ReviewedClosedTickets]: {
        title: TrendCardConfig[AutoQAMetric.ReviewedClosedTickets].title,
        format: TrendCardConfig[AutoQAMetric.ReviewedClosedTickets]
            .metricFormat,
        hint: TrendCardConfig[AutoQAMetric.ReviewedClosedTickets].hint,
    },
    [AutoQAAgentsTableColumn.ResolutionCompleteness]: {
        title: TrendCardConfig[AutoQAMetric.ResolutionCompleteness].title,
        format: TrendCardConfig[AutoQAMetric.ResolutionCompleteness]
            .metricFormat,
        hint: TrendCardConfig[AutoQAMetric.ResolutionCompleteness].hint,
    },
    [AutoQAAgentsTableColumn.CommunicationSkills]: {
        title: TrendCardConfig[AutoQAMetric.CommunicationSkills].title,
        format: TrendCardConfig[AutoQAMetric.CommunicationSkills].metricFormat,
        hint: TrendCardConfig[AutoQAMetric.CommunicationSkills].hint,
    },
    [AutoQAAgentsTableColumn.LanguageProficiency]: {
        title: TrendCardConfig[AutoQAMetric.LanguageProficiency].title,
        format: TrendCardConfig[AutoQAMetric.LanguageProficiency].metricFormat,
        hint: TrendCardConfig[AutoQAMetric.LanguageProficiency].hint,
    },
}

export const getQuery = (
    column: AutoQAAgentsTableColumn
): MetricQueryPerAgentQuery => {
    switch (column) {
        case AutoQAAgentsTableColumn.AgentName:
            return () => ({
                isFetching: false,
                isError: false,
                data: null,
            })
        case AutoQAAgentsTableColumn.ResolutionCompleteness:
            return useResolutionCompletenessPerAgent
        case AutoQAAgentsTableColumn.ReviewedClosedTickets:
            return useReviewedClosedTicketsPerAgent
        case AutoQAAgentsTableColumn.CommunicationSkills:
            return useCommunicationSkillsPerAgent
        case AutoQAAgentsTableColumn.LanguageProficiency:
            return useLanguageProficiencyPerAgent
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
    column: AutoQAAgentsTableColumn
): column is AutoQAAgentMetric => column !== AutoQAAgentsTableColumn.AgentName

export const buildAgentMetric = (column: AutoQAAgentMetric, agent: User) => ({
    title: `${TableLabels[column]} | ${agent.name}`,
    metricName: column,
    perAgentId: agent.id,
})

export function getDrillDownMetricData(
    column: AutoQAAgentsTableColumn,
    agent: User
) {
    if (isAutoQAAgentsMetric(column)) {
        return buildAgentMetric(column, agent)
    }
    return null
}
