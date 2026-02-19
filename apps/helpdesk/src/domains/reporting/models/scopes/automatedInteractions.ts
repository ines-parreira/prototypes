import { AutomateEventType } from 'domains/reporting/hooks/automate/utils'
import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

import { createScopeFilters } from './utils'

const automatedInteractionsScope = defineScope({
    scope: MetricScope.AutomatedInteractions,
    measures: [
        'automatedInteractions',
        'automatedInteractionsByAutoResponders',
    ],
    filters: ['periodStart', 'periodEnd', 'eventType'],
    dimensions: ['eventType'],
    timeDimensions: ['createdDatetime'],
})

type AutomatedInteractionsContext = Context<
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
