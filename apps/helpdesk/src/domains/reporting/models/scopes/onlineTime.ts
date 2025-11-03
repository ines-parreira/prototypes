import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import { Context, defineScope } from 'domains/reporting/models/scopes/scope'

const onlineTimeScope = defineScope({
    scope: MetricScope.OnlineTime,
    measures: ['onlineTime'],
    dimensions: ['agentId'],
    filters: ['periodStart', 'periodEnd', 'agents'],
    order: ['onlineTime'],
})

export const onlineTime = onlineTimeScope
    .defineMetricName(METRIC_NAMES.AGENTXP_ONLINE_TIME)
    .defineQuery(({ ctx }) => {
        const query = {
            measures: ['onlineTime'] as const,
        }
        if (ctx.sortDirection) {
            return {
                ...query,
                order: [['onlineTime', ctx.sortDirection]] as const,
            }
        }
        return query
    })

export const onlineTimeQueryV2Factory = (ctx: Context) => onlineTime.build(ctx)

export const onlineTimePerAgent = onlineTimeScope
    .defineMetricName(METRIC_NAMES.AGENTXP_ONLINE_TIME_PER_AGENT)
    .defineQuery(({ ctx }) => {
        const query = {
            measures: ['onlineTime'] as const,
            dimensions: ['agentId'] as const,
        }
        if (ctx.sortDirection) {
            return {
                ...query,
                order: [['onlineTime', ctx.sortDirection]] as const,
            }
        }
        return query
    })

export const onlineTimePerAgentQueryV2Factory = (ctx: Context) =>
    onlineTimePerAgent.build(ctx)
