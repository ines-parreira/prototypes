import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import { withLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { AutomationSkillType } from 'domains/reporting/models/scopes/constants'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'
import {
    createScopeFilters,
    getGenericQueries,
} from 'domains/reporting/models/scopes/utils'

export const aiAgentAutomatedInteractionsScope = defineScope({
    scope: MetricScope.AiAgentAutomatedInteractions,
    measures: ['automatedInteractionsCount'],
    dimensions: [
        'aiAgentRole',
        'aiIntentCustomField',
        'channel',
        'customField',
        'engagementType',
        'storeIntegrationId',
        'ticketId',
    ],
    timeDimensions: ['eventDatetime'],
    filters: [
        'aiAgentRole',
        'channel',
        'customField',
        'customFieldId',
        'engagementType',
        'periodEnd',
        'periodStart',
        'storeIntegrationId',
    ],
    order: ['automatedInteractionsCount', 'eventDatetime', 'ticketId'],
})

export type AiAgentAutomatedInteractionsContext = Context<
    typeof aiAgentAutomatedInteractionsScope.config
>

const allAgentsBaseQuery = () => ({
    measures: ['automatedInteractionsCount'] as const,
})

export const {
    valueQuery: allAgentsAutomatedInteractionsValue,
    valueQueryFactory: allAgentsAutomatedInteractionsValueQueryFactoryV2,
    breakdownQuery: allAgentsAutomatedInteractionsBreakdown,
    breakdownQueryFactory:
        allAgentsAutomatedInteractionsBreakdownQueryFactoryV2,
    timeseriesQuery: allAgentsAutomatedInteractionsTimeseries,
    timeseriesQueryFactory:
        allAgentsAutomatedInteractionsTimeseriesQueryFactoryV2,
} = getGenericQueries(aiAgentAutomatedInteractionsScope, allAgentsBaseQuery, {
    valueMetricName: METRIC_NAMES.AI_AGENT_AUTOMATED_INTERACTIONS_VALUE,
    breakdownMetricName: METRIC_NAMES.AI_AGENT_AUTOMATED_INTERACTIONS_BREAKDOWN,
    breakdownDimensionMetricNames: {
        channel:
            METRIC_NAMES.AI_AGENT_AUTOMATED_INTERACTIONS_BREAKDOWN_PER_CHANNEL,
        storeIntegrationId:
            METRIC_NAMES.AI_AGENT_AUTOMATED_INTERACTIONS_BREAKDOWN_PER_STORE,
        aiIntentCustomField:
            METRIC_NAMES.AI_AGENT_AUTOMATED_INTERACTIONS_BREAKDOWN_PER_INTENT,
    },
    timeseriesMetricName:
        METRIC_NAMES.AI_AGENT_AUTOMATED_INTERACTIONS_TIMESERIES,
    timeseriesDimensionMetricNames: {
        channel:
            METRIC_NAMES.AI_AGENT_AUTOMATED_INTERACTIONS_TIMESERIES_PER_CHANNEL,
        storeIntegrationId:
            METRIC_NAMES.AI_AGENT_AUTOMATED_INTERACTIONS_TIMESERIES_PER_STORE,
        aiIntentCustomField:
            METRIC_NAMES.AI_AGENT_AUTOMATED_INTERACTIONS_TIMESERIES_PER_INTENT,
    },
    timeDimension: 'eventDatetime',
})

const shoppingAssistantBaseQuery = ({
    ctx,
    config,
}: {
    ctx: AiAgentAutomatedInteractionsContext
    config: typeof aiAgentAutomatedInteractionsScope.config
}) => ({
    measures: ['automatedInteractionsCount'] as const,
    filters: createScopeFilters(
        {
            ...ctx.filters,
            aiAgentRole: withLogicalOperator([
                AutomationSkillType.AiAgentSales,
            ]),
        },
        config,
    ),
})

export const {
    valueQuery: shoppingAssistantAutomatedInteractionsValue,
    valueQueryFactory:
        shoppingAssistantAutomatedInteractionsValueQueryFactoryV2,
    breakdownQuery: shoppingAssistantAutomatedInteractionsBreakdown,
    breakdownQueryFactory:
        shoppingAssistantAutomatedInteractionsBreakdownQueryFactoryV2,
    timeseriesQuery: shoppingAssistantAutomatedInteractionsTimeseries,
    timeseriesQueryFactory:
        shoppingAssistantAutomatedInteractionsTimeseriesQueryFactoryV2,
} = getGenericQueries(
    aiAgentAutomatedInteractionsScope,
    shoppingAssistantBaseQuery,
    {
        valueMetricName:
            METRIC_NAMES.AI_AGENT_SHOPPING_ASSISTANT_AUTOMATED_INTERACTIONS_VALUE,
        breakdownMetricName:
            METRIC_NAMES.AI_AGENT_SHOPPING_ASSISTANT_AUTOMATED_INTERACTIONS_BREAKDOWN,
        breakdownDimensionMetricNames: {
            channel:
                METRIC_NAMES.AI_AGENT_SHOPPING_ASSISTANT_AUTOMATED_INTERACTIONS_BREAKDOWN_PER_CHANNEL,
            storeIntegrationId:
                METRIC_NAMES.AI_AGENT_SHOPPING_ASSISTANT_AUTOMATED_INTERACTIONS_BREAKDOWN_PER_STORE,
            engagementType:
                METRIC_NAMES.AI_AGENT_SHOPPING_ASSISTANT_AUTOMATED_INTERACTIONS_BREAKDOWN_PER_ENGAGEMENT_TYPE,
        },
        timeseriesMetricName:
            METRIC_NAMES.AI_AGENT_SHOPPING_ASSISTANT_AUTOMATED_INTERACTIONS_TIMESERIES,
        timeseriesDimensionMetricNames: {
            channel:
                METRIC_NAMES.AI_AGENT_SHOPPING_ASSISTANT_AUTOMATED_INTERACTIONS_TIMESERIES_PER_CHANNEL,
            storeIntegrationId:
                METRIC_NAMES.AI_AGENT_SHOPPING_ASSISTANT_AUTOMATED_INTERACTIONS_TIMESERIES_PER_STORE,
            engagementType:
                METRIC_NAMES.AI_AGENT_SHOPPING_ASSISTANT_AUTOMATED_INTERACTIONS_TIMESERIES_PER_ENGAGEMENT_TYPE,
        },
        timeDimension: 'eventDatetime',
    },
)

const supportAgentBaseQuery = ({
    ctx,
    config,
}: {
    ctx: AiAgentAutomatedInteractionsContext
    config: typeof aiAgentAutomatedInteractionsScope.config
}) => ({
    measures: ['automatedInteractionsCount'] as const,
    filters: createScopeFilters(
        {
            ...ctx.filters,
            aiAgentRole: withLogicalOperator([
                AutomationSkillType.AiAgentSupport,
            ]),
        },
        config,
    ),
})

export const {
    valueQuery: supportAgentAutomatedInteractionsValue,
    valueQueryFactory: supportAgentAutomatedInteractionsValueQueryFactoryV2,
    breakdownQuery: supportAgentAutomatedInteractionsBreakdown,
    breakdownQueryFactory:
        supportAgentAutomatedInteractionsBreakdownQueryFactoryV2,
    timeseriesQuery: supportAgentAutomatedInteractionsTimeseries,
    timeseriesQueryFactory:
        supportAgentAutomatedInteractionsTimeseriesQueryFactoryV2,
} = getGenericQueries(
    aiAgentAutomatedInteractionsScope,
    supportAgentBaseQuery,
    {
        valueMetricName:
            METRIC_NAMES.AI_AGENT_SUPPORT_AGENT_AUTOMATED_INTERACTIONS_VALUE,
        breakdownMetricName:
            METRIC_NAMES.AI_AGENT_SUPPORT_AGENT_AUTOMATED_INTERACTIONS_BREAKDOWN,
        breakdownDimensionMetricNames: {
            channel:
                METRIC_NAMES.AI_AGENT_SUPPORT_AGENT_AUTOMATED_INTERACTIONS_BREAKDOWN_PER_CHANNEL,
            storeIntegrationId:
                METRIC_NAMES.AI_AGENT_SUPPORT_AGENT_AUTOMATED_INTERACTIONS_BREAKDOWN_PER_STORE,
            aiIntentCustomField:
                METRIC_NAMES.AI_AGENT_SUPPORT_AGENT_AUTOMATED_INTERACTIONS_BREAKDOWN_PER_INTENT,
        },
        timeseriesMetricName:
            METRIC_NAMES.AI_AGENT_SUPPORT_AGENT_AUTOMATED_INTERACTIONS_TIMESERIES,
        timeseriesDimensionMetricNames: {
            channel:
                METRIC_NAMES.AI_AGENT_SUPPORT_AGENT_AUTOMATED_INTERACTIONS_TIMESERIES_PER_CHANNEL,
            storeIntegrationId:
                METRIC_NAMES.AI_AGENT_SUPPORT_AGENT_AUTOMATED_INTERACTIONS_TIMESERIES_PER_STORE,
            aiIntentCustomField:
                METRIC_NAMES.AI_AGENT_SUPPORT_AGENT_AUTOMATED_INTERACTIONS_TIMESERIES_PER_INTENT,
        },
        timeDimension: 'eventDatetime',
    },
)
