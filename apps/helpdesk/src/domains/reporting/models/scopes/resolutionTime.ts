import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    AggregationWindow,
    StatsFiltersWithLogicalOperator,
} from 'domains/reporting/models/stat/types'

import { defineScope, initScope } from './scope'
import { createScopeFilters } from './utils'

export const scopeConfig = defineScope({
    measures: ['medianResolutionTime'],
    dimensions: [
        'tickets',
        'agents',
        'channels',
        'integrations',
        'resolutionTime',
    ],
    timeDimensions: ['createdDatetime'],
    filters: [
        'periodStart',
        'periodEnd',
        'agents',
        'channels',
        'csatScores',
        'integrations',
        'communicationSkills',
        'languageProficiency',
        'resolutionCompleteness',
        'accuracyScore',
        'efficiencyScore',
        'internalComplianceScore',
        'brandVoiceScore',
        'customFields',
        'tags',
    ],
    order: ['tickets', 'medianResolutionTime'],
})

type ResolutionTimeScope = typeof scopeConfig

type Context = {
    timezone: string
    filters: StatsFiltersWithLogicalOperator
    granularity: AggregationWindow
}

const resolutionTimeScope = initScope<ResolutionTimeScope, Context>().define(
    'resolution-time',
)

export const medianResolutionTime = resolutionTimeScope
    .create(METRIC_NAMES.SUPPORT_PERFORMANCE_MEDIAN_RESOLUTION_TIME)
    .defineQuery(({ ctx }) => ({
        measures: ['medianResolutionTime'],
        timezone: ctx.timezone,
        filters: createScopeFilters(ctx.filters, scopeConfig),
        // TODO: Sorting?
    }))

export const medianResolutionTimePerAgent = resolutionTimeScope
    .create(METRIC_NAMES.SUPPORT_PERFORMANCE_MEDIAN_RESOLUTION_TIME_PER_AGENT)
    .defineQuery(({ ctx }) => ({
        measures: ['medianResolutionTime'],
        dimensions: ['agents'],
        timezone: ctx.timezone,
        filters: createScopeFilters(ctx.filters, scopeConfig),
        // TODO: Sorting?
    }))

export const medianResolutionTimePerChannel = resolutionTimeScope
    .create(METRIC_NAMES.SUPPORT_PERFORMANCE_MEDIAN_RESOLUTION_TIME_PER_CHANNEL)
    .defineQuery(({ ctx }) => ({
        measures: ['medianResolutionTime'],
        dimensions: ['channels'],
        timezone: ctx.timezone,
        filters: createScopeFilters(ctx.filters, scopeConfig),
        // TODO: Sorting?
    }))
