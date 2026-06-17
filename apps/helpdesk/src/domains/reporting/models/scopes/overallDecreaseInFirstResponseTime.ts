import type { MetricName } from 'domains/reporting/hooks/metricNames'
import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import { AutomationFeatureType } from 'domains/reporting/models/scopes/constants'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'
import {
    createScopeFilters,
    getBreakdownQuery,
    getTimeseriesQuery,
} from 'domains/reporting/models/scopes/utils'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

export const overallDecreaseInFirstResponseTimeScope = defineScope({
    scope: MetricScope.OverallDecreaseInFirstResponseTime,
    measures: [
        'averageDecreaseInFirstResponseTime',
        'medianDecreaseInFirstResponseTime',
    ],
    dimensions: [
        'automationFeatureType',
        'channel',
        'firstResponseTime',
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
        'averageDecreaseInFirstResponseTime',
        'eventDatetime',
        'firstResponseTime',
        'medianDecreaseInFirstResponseTime',
        'ticketId',
    ],
})

export type OverallDecreaseInFirstResponseTimeContext = Context<
    typeof overallDecreaseInFirstResponseTimeScope.config
>

export const medianDecreaseInFirstResponseTime =
    overallDecreaseInFirstResponseTimeScope
        .defineMetricName(METRIC_NAMES.AI_AGENT_OVERVIEW_DECREASE_IN_FRT)
        .defineQuery(() => ({
            measures: ['medianDecreaseInFirstResponseTime'] as const,
        }))

export const medianDecreaseInFirstResponseTimeQueryV2Factory = (
    ctx: OverallDecreaseInFirstResponseTimeContext,
) => medianDecreaseInFirstResponseTime.build(ctx)

export const {
    timeseriesQuery: overallDecreaseInFRTTimeseries,
    timeseriesQueryFactory: overallDecreaseInFRTTimeseriesQueryV2Factory,
} = getTimeseriesQuery(
    overallDecreaseInFirstResponseTimeScope,
    () => ({ measures: ['medianDecreaseInFirstResponseTime'] as const }),
    METRIC_NAMES.AI_AGENT_OVERVIEW_DECREASE_IN_FRT_TIMESERIES,
    'eventDatetime',
)

export const {
    breakdownQuery: overallDecreaseInFirstResponseTimePerFeature,
    breakdownQueryFactory:
        overallDecreaseInFirstResponseTimePerFeatureQueryV2Factory,
} = getBreakdownQuery(
    overallDecreaseInFirstResponseTimeScope,
    () => ({
        measures: ['medianDecreaseInFirstResponseTime'] as const,
    }),
    METRIC_NAMES.AI_AGENT_OVERVIEW_DECREASE_IN_FRT_PER_FEATURE,
)

const buildAutomationTypeBreakdown = (
    automationFeatureType: AutomationFeatureType,
    metricName: MetricName,
) =>
    getBreakdownQuery(
        overallDecreaseInFirstResponseTimeScope,
        ({ ctx, config }) => ({
            measures: ['medianDecreaseInFirstResponseTime'] as const,
            filters: [
                ...createScopeFilters(ctx.filters, config),
                {
                    member: 'automationFeatureType',
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: [automationFeatureType],
                },
            ] as any,
        }),
        metricName,
    )

export const {
    breakdownQuery: overallDecreaseInFirstResponseTimePerFlows,
    breakdownQueryFactory:
        overallDecreaseInFirstResponseTimePerFlowsQueryV2Factory,
} = buildAutomationTypeBreakdown(
    AutomationFeatureType.Flows,
    METRIC_NAMES.AI_AGENT_OVERVIEW_DECREASE_IN_FRT_PER_FLOWS,
)

export const {
    breakdownQuery: overallDecreaseInFirstResponseTimePerOrderManagementType,
    breakdownQueryFactory:
        overallDecreaseInFirstResponseTimePerOrderManagementTypeQueryV2Factory,
} = buildAutomationTypeBreakdown(
    AutomationFeatureType.OrderManagement,
    METRIC_NAMES.AI_AGENT_OVERVIEW_DECREASE_IN_FRT_PER_ORDER_MANAGEMENT_TYPE,
)
