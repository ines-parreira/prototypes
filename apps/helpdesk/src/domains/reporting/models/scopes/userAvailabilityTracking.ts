import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'

const userAvailabilityTrackingScope = defineScope({
    scope: MetricScope.UserAvailabilityTracking,
    measures: [
        'totalDurationSeconds',
        'onlineDurationSeconds',
        'offlineDurationSeconds',
    ],
    dimensions: ['agentId', 'statusName'],
    timeDimensions: ['periodStart'],
    filters: ['periodStart', 'periodEnd', 'agentId'],
    order: [
        'onlineDurationSeconds',
        'totalDurationSeconds',
        'agentId',
        'statusName',
    ],
})

// Total online time per agent (ONLINE column)
export const availabilityTrackingPerAgent = userAvailabilityTrackingScope
    .defineMetricName(METRIC_NAMES.AGENTXP_AVAILABILITY_TRACKING_PER_AGENT)
    .defineQuery(({ ctx }) => {
        const query = {
            measures: ['onlineDurationSeconds'] as const,
            dimensions: ['agentId'] as const,
            // limit and offset will be set from ctx automatically
            // if not overridden here
        }
        if (ctx.sortDirection) {
            return {
                ...query,
                order: [['onlineDurationSeconds', ctx.sortDirection]] as const,
            }
        }
        return query
    })

// Duration per agent per status (individual status columns)
export const availabilityTrackingPerAgentPerStatus =
    userAvailabilityTrackingScope
        .defineMetricName(
            METRIC_NAMES.AGENTXP_AVAILABILITY_TRACKING_PER_AGENT_PER_STATUS,
        )
        .defineQuery(() => ({
            measures: ['totalDurationSeconds'] as const,
            dimensions: ['agentId', 'statusName'] as const,
            limit: 10000,
        }))

export const availabilityTrackingPerAgentQueryV2Factory = (ctx: Context) =>
    availabilityTrackingPerAgent.build(ctx)

export const availabilityTrackingPerAgentPerStatusQueryV2Factory = (
    ctx: Context,
) => availabilityTrackingPerAgentPerStatus.build(ctx)
