import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import { dynamicAiAgentOutcomeBreakdownQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentTicketFields'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const buildAiAgentOutcomeBreakdownQuery = (
    filters: StatsFilters,
    timezone: string,
) =>
    dynamicAiAgentOutcomeBreakdownQueryFactoryV2(
        {
            filters,
            timezone,
            dimensions: ['aiOutcomeCustomField', 'aiAgentRole'],
        },
        METRIC_NAMES.AI_AGENT_DYNAMIC_ALL_AGENTS_INTENT_BREAKDOWN_PER_ROLE_AND_OUTCOME,
    )
