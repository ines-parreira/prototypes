import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'

import { defineScope } from './scope'

const onlineTimeScope = defineScope({
    scope: MetricScope.OnlineTime,
    measures: ['onlineTime'],
    dimensions: ['agents'],
    filters: ['periodStart', 'periodEnd', 'agents'],
    order: ['onlineTime'],
})

export const onlineTime = onlineTimeScope
    .defineMetricName(METRIC_NAMES.AGENTXP_ONLINE_TIME)
    .defineQuery(() => ({
        measures: ['onlineTime'] as const,
    }))

export const onlineTimePerAgent = onlineTimeScope
    .defineMetricName(METRIC_NAMES.AGENTXP_ONLINE_TIME_PER_AGENT)
    .defineQuery(() => ({
        measures: ['onlineTime'] as const,
        dimensions: ['agents'] as const,
    }))
