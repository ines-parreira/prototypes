import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import { AutomationFeatureType } from 'domains/reporting/models/scopes/constants'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'
import { createScopeFilters } from 'domains/reporting/models/scopes/utils'

const overallTimeSavedByAgentScope = defineScope({
    scope: MetricScope.OverallTimeSavedByAgent,
    measures: ['averageTimeSavedByAgent', 'medianTimeSavedByAgent'],
    dimensions: [
        'automationFeatureType',
        'channel',
        'flowId',
        'orderManagementType',
        'storeIntegrationId',
        'ticketId',
    ],
    timeDimensions: ['eventDatetime'],
    filters: [
        'automationFeatureType',
        'channel',
        'periodEnd',
        'periodStart',
        'storeIntegrationId',
    ],
    order: [
        'averageTimeSavedByAgent',
        'eventDatetime',
        'medianTimeSavedByAgent',
        'ticketId',
    ],
})

export type OverallTimeSavedByAgentContext = Context<
    typeof overallTimeSavedByAgentScope.config
>

export const overallTimeSavedByAgentForOrderManagement =
    overallTimeSavedByAgentScope
        .defineMetricName(
            METRIC_NAMES.OVERALL_TIME_SAVED_BY_AGENT_PER_ORDER_MANAGEMENT_TYPE,
        )
        .defineQuery(({ ctx, config }) => ({
            measures: ['averageTimeSavedByAgent'] as const,
            dimensions: ['orderManagementType'],
            filters: [
                ...createScopeFilters(ctx.filters, config),
                {
                    member: 'automationFeatureType',
                    operator: 'one-of',
                    values: [AutomationFeatureType.OrderManagement],
                },
            ] as any,
        }))

export const overallTimeSavedByAgentForOrderManagementQueryFactoryV2 = (
    ctx: OverallTimeSavedByAgentContext,
) => overallTimeSavedByAgentForOrderManagement.build(ctx)
