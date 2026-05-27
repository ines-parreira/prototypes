import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'
import { getGenericQueries } from 'domains/reporting/models/scopes/utils'

const resolutionTimeScope = defineScope({
    scope: MetricScope.ResolutionTime,
    measures: ['medianResolutionTime'],
    dimensions: [
        'ticketId',
        'agentId',
        'channel',
        'integrationId',
        'resolutionTime',
    ],
    timeDimensions: ['createdDatetime'],
    filters: [
        'periodStart',
        'periodEnd',
        'agentId',
        'teamId',
        'channel',
        'integrationId',
        'storeId',
        'communicationSkills',
        'languageProficiency',
        'resolutionCompleteness',
        'accuracy',
        'efficiency',
        'internalCompliance',
        'brandVoice',
        'customFields',
        'tags',
        'score',
    ],
    order: ['tickets', 'medianResolutionTime'],
})

export const medianResolutionTime = resolutionTimeScope
    .defineMetricName(METRIC_NAMES.SUPPORT_PERFORMANCE_MEDIAN_RESOLUTION_TIME)
    .defineQuery(() => ({
        measures: ['medianResolutionTime'] as const,
    }))

export const medianResolutionTimeQueryV2Factory = (ctx: Context) =>
    medianResolutionTime.build(ctx)

export const medianResolutionTimePerAgent = resolutionTimeScope
    .defineMetricName(
        METRIC_NAMES.SUPPORT_PERFORMANCE_MEDIAN_RESOLUTION_TIME_PER_AGENT,
    )
    .defineQuery(({ ctx }) => {
        const query = {
            measures: ['medianResolutionTime'] as const,
            dimensions: ['agentId'] as const,
            limit: 10000,
        }
        if (ctx.sortDirection) {
            return {
                ...query,
                order: [['medianResolutionTime', ctx.sortDirection]] as const,
            }
        }
        return query
    })

export const medianResolutionTimePerAgentQueryV2Factory = (ctx: Context) =>
    medianResolutionTimePerAgent.build(ctx)

export const medianResolutionTimePerChannel = resolutionTimeScope
    .defineMetricName(
        METRIC_NAMES.SUPPORT_PERFORMANCE_MEDIAN_RESOLUTION_TIME_PER_CHANNEL,
    )
    .defineQuery(() => ({
        measures: ['medianResolutionTime'] as const,
        dimensions: ['channel'] as const,
    }))

export const medianResolutionTimePerChannelQueryV2Factory = (ctx: Context) =>
    medianResolutionTimePerChannel.build(ctx)

export const aiAgentAllAgentsResolutionTime = resolutionTimeScope
    .defineMetricName(METRIC_NAMES.AI_AGENT_ALL_AGENTS_RESOLUTION_TIME)
    .defineQuery(() => ({
        measures: ['medianResolutionTime'] as const,
    }))

export const aiAgentAllAgentsResolutionTimeQueryV2Factory = (ctx: Context) =>
    aiAgentAllAgentsResolutionTime.build(ctx)

const resolutionTimeBaseQuery = () => ({
    measures: ['medianResolutionTime'] as const,
})

export const {
    valueQueryFactory: resolutionTimeValueQueryFactoryV2,
    breakdownQuery: resolutionTimeBreakdownQueryFactoryV2,
    timeseriesQueryFactory: resolutionTimeTimeseriesQueryFactoryV2,
} = getGenericQueries(resolutionTimeScope, resolutionTimeBaseQuery, {
    valueMetricName: METRIC_NAMES.PERFORMANCE_OVERVIEW_RESOLUTION_TIME_VALUE,
    breakdownMetricName:
        METRIC_NAMES.PERFORMANCE_OVERVIEW_RESOLUTION_TIME_BREAKDOWN,
    breakdownDimensionMetricNames: {
        channel:
            METRIC_NAMES.PERFORMANCE_OVERVIEW_RESOLUTION_TIME_BREAKDOWN_PER_CHANNEL,
        agentId:
            METRIC_NAMES.PERFORMANCE_OVERVIEW_RESOLUTION_TIME_BREAKDOWN_PER_AGENT,
    },
    timeseriesMetricName:
        METRIC_NAMES.PERFORMANCE_OVERVIEW_RESOLUTION_TIME_TIMESERIES,
    timeseriesDimensionMetricNames: {
        channel:
            METRIC_NAMES.PERFORMANCE_OVERVIEW_RESOLUTION_TIME_TIMESERIES_PER_CHANNEL,
    },
    timeDimension: 'createdDatetime',
})
