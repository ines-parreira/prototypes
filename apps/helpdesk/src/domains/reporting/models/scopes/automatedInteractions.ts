import {
    AI_AGENT_TICKET_HANDOVER,
    FLOW_HANDOVER_TICKET_CREATED,
} from 'domains/reporting/hooks/automate/types'
import { AutomateEventType } from 'domains/reporting/hooks/automate/utils'
import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import { withLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'
import { createScopeFilters } from 'domains/reporting/models/scopes/utils'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

const automatedInteractionsScope = defineScope({
    scope: MetricScope.AutomatedInteractions,
    measures: [
        'automatedInteractions',
        'automatedInteractionsByAutoResponders',
    ],
    filters: ['periodStart', 'periodEnd', 'eventType', 'channel'],
    dimensions: ['eventType'],
    timeDimensions: ['createdDatetime'],
})

export type AutomatedInteractionsContext = Context<
    typeof automatedInteractionsScope.config
>

export const automatedInteractions = automatedInteractionsScope
    .defineMetricName(METRIC_NAMES.AUTOMATE_AUTOMATION_DATASET)
    .defineQuery(() => ({
        measures: [
            'automatedInteractions',
            'automatedInteractionsByAutoResponders',
        ] as const,
    }))

export const automatedInteractionsQueryV2Factory = (
    ctx: AutomatedInteractionsContext,
) => automatedInteractions.build(ctx)

export const flowsAutomatedInteractions = automatedInteractionsScope
    .defineMetricName(METRIC_NAMES.AUTOMATE_FLOWS_AUTOMATED_INTERACTIONS)
    .defineQuery(({ ctx, config }) => ({
        measures: ['automatedInteractions'] as const,
        filters: createScopeFilters(
            {
                ...ctx.filters,
                eventType: withLogicalOperator([
                    AutomateEventType.FLOW_STARTED,
                    AutomateEventType.FLOW_PROMPT_STARTED,
                    AutomateEventType.FLOW_ENDED_WITHOUT_ACTION,
                ]),
            },
            config,
        ),
    }))

export const flowsAutomatedInteractionsQueryV2Factory = (
    ctx: AutomatedInteractionsContext,
) => flowsAutomatedInteractions.build(ctx)

export const articleRecommendationAutomatedInteractions =
    automatedInteractionsScope
        .defineMetricName(
            METRIC_NAMES.AUTOMATE_ARTICLE_RECOMMENDATION_AUTOMATED_INTERACTIONS,
        )
        .defineQuery(({ ctx, config }) => ({
            measures: ['automatedInteractions'] as const,
            filters: createScopeFilters(
                {
                    ...ctx.filters,
                    eventType: withLogicalOperator([
                        AutomateEventType.ARTICLE_RECOMMENDATION_STARTED,
                    ]),
                },
                config,
            ),
        }))

export const articleRecommendationAutomatedInteractionsQueryV2Factory = (
    ctx: AutomatedInteractionsContext,
) => articleRecommendationAutomatedInteractions.build(ctx)

export const orderManagementAutomatedInteractions = automatedInteractionsScope
    .defineMetricName(
        METRIC_NAMES.AUTOMATE_ORDER_MANAGEMENT_AUTOMATED_INTERACTIONS,
    )
    .defineQuery(({ ctx, config }) => ({
        measures: ['automatedInteractions'] as const,
        filters: createScopeFilters(
            {
                ...ctx.filters,
                eventType: withLogicalOperator([
                    AutomateEventType.TRACK_ORDER,
                    AutomateEventType.LOOP_RETURNS_STARTED,
                    AutomateEventType.AUTOMATED_RESPONSE_STARTED,
                ]),
            },
            config,
        ),
    }))

export const orderManagementAutomatedInteractionsQueryV2Factory = (
    ctx: AutomatedInteractionsContext,
) => orderManagementAutomatedInteractions.build(ctx)

export const aiAgentHandovers = automatedInteractionsScope
    .defineMetricName(METRIC_NAMES.AUTOMATE_AI_AGENT_HANDOVERS)
    .defineQuery(({ ctx, config }) => ({
        measures: [
            'automatedInteractions',
            'automatedInteractionsByAutoResponders',
        ] as const,
        filters: [
            ...createScopeFilters(ctx.filters, config),
            {
                member: 'eventType',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [AI_AGENT_TICKET_HANDOVER],
            },
        ] as any,
    }))

export const aiAgentHandoversQueryV2Factory = (
    ctx: AutomatedInteractionsContext,
) => aiAgentHandovers.build(ctx)

export const flowsHandovers = automatedInteractionsScope
    .defineMetricName(METRIC_NAMES.AUTOMATE_FLOWS_HANDOVERS)
    .defineQuery(({ ctx, config }) => ({
        measures: [
            'automatedInteractions',
            'automatedInteractionsByAutoResponders',
        ] as const,
        filters: [
            ...createScopeFilters(ctx.filters, config),
            {
                member: 'eventType',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [FLOW_HANDOVER_TICKET_CREATED],
            },
        ] as any,
    }))

export const flowsHandoversQueryV2Factory = (
    ctx: AutomatedInteractionsContext,
) => flowsHandovers.build(ctx)

export const aiAgentAutomatedInteractions = automatedInteractionsScope
    .defineMetricName(METRIC_NAMES.AI_AGENT_AUTOMATED_INTERACTIONS)
    .defineQuery(({ ctx, config }) => ({
        measures: [
            'automatedInteractions',
            'automatedInteractionsByAutoResponders',
        ] as const,
        filters: [
            ...createScopeFilters(ctx.filters, config),
            {
                member: 'eventType',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [AutomateEventType.AI_AGENT_TICKET_RESOLVED],
            },
        ] as any,
    }))

export const aiAgentAutomatedInteractionsQueryV2Factory = (
    ctx: AutomatedInteractionsContext,
) => aiAgentAutomatedInteractions.build(ctx)

export const aiAgentAutomatedInteractionsTimeSeries = automatedInteractionsScope
    .defineMetricName(METRIC_NAMES.AI_AGENT_AUTOMATED_INTERACTIONS_TIME_SERIES)
    .defineQuery(({ ctx, config }) => ({
        measures: [
            'automatedInteractions',
            'automatedInteractionsByAutoResponders',
        ],
        filters: [
            ...createScopeFilters(ctx.filters, config),
            {
                member: 'eventType',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [AutomateEventType.AI_AGENT_TICKET_RESOLVED],
            },
        ] as any,
        time_dimensions: [
            {
                dimension: 'createdDatetime',
                granularity: ctx.granularity,
            },
        ],
    }))

export const aiAgentAutomatedInteractionsTimeSeriesQueryV2Factory = (
    ctx: AutomatedInteractionsContext,
) => aiAgentAutomatedInteractionsTimeSeries.build(ctx)
