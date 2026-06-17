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

export const overallDecreaseInResolutionTimeScope = defineScope({
    scope: MetricScope.OverallDecreaseInResolutionTime,
    measures: [
        'averageDecreaseInResolutionTime',
        'medianDecreaseInResolutionTime',
    ],
    dimensions: [
        'automationFeatureType',
        'channel',
        'flowId',
        'orderManagementType',
        'resolutionTime',
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
        'averageDecreaseInResolutionTime',
        'eventDatetime',
        'medianDecreaseInResolutionTime',
        'ticketId',
    ],
})

export type OverallDecreaseInResolutionTimeContext = Context<
    typeof overallDecreaseInResolutionTimeScope.config
>

export const overallDecreaseInResolutionTime =
    overallDecreaseInResolutionTimeScope
        .defineMetricName(
            METRIC_NAMES.AI_AGENT_OVERVIEW_DECREASE_IN_RESOLUTION_TIME,
        )
        .defineQuery(() => ({
            measures: ['medianDecreaseInResolutionTime'] as const,
        }))

export const overallDecreaseInResolutionTimeQueryV2Factory = (
    ctx: OverallDecreaseInResolutionTimeContext,
) => overallDecreaseInResolutionTime.build(ctx)

export const {
    timeseriesQuery: overallDecreaseInResolutionTimeTimeseries,
    timeseriesQueryFactory:
        overallDecreaseInResolutionTimeTimeseriesQueryV2Factory,
} = getTimeseriesQuery(
    overallDecreaseInResolutionTimeScope,
    () => ({ measures: ['medianDecreaseInResolutionTime'] as const }),
    METRIC_NAMES.AI_AGENT_OVERVIEW_DECREASE_IN_RESOLUTION_TIME_TIMESERIES,
    'eventDatetime',
)

export const {
    breakdownQuery: overallDecreaseInResolutionTimePerFeature,
    breakdownQueryFactory:
        overallDecreaseInResolutionTimePerFeatureQueryV2Factory,
} = getBreakdownQuery(
    overallDecreaseInResolutionTimeScope,
    () => ({
        measures: ['medianDecreaseInResolutionTime'] as const,
    }),
    METRIC_NAMES.AI_AGENT_OVERVIEW_DECREASE_IN_RESOLUTION_TIME_PER_FEATURE,
)

const buildAutomationTypeBreakdown = (
    automationFeatureType: AutomationFeatureType,
    metricName: MetricName,
) =>
    getBreakdownQuery(
        overallDecreaseInResolutionTimeScope,
        ({ ctx, config }) => ({
            measures: ['medianDecreaseInResolutionTime'] as const,
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
    breakdownQuery: overallDecreaseInResolutionTimePerFlows,
    breakdownQueryFactory:
        overallDecreaseInResolutionTimePerFlowsQueryV2Factory,
} = buildAutomationTypeBreakdown(
    AutomationFeatureType.Flows,
    METRIC_NAMES.AI_AGENT_OVERVIEW_DECREASE_IN_RESOLUTION_TIME_PER_FLOWS,
)

export const {
    breakdownQuery: overallDecreaseInResolutionTimePerOrderManagementType,
    breakdownQueryFactory:
        overallDecreaseInResolutionTimePerOrderManagementTypeQueryV2Factory,
} = buildAutomationTypeBreakdown(
    AutomationFeatureType.OrderManagement,
    METRIC_NAMES.AI_AGENT_OVERVIEW_DECREASE_IN_RESOLUTION_TIME_PER_ORDER_MANAGEMENT_TYPE,
)
