import { OrderDirection } from '@gorgias/helpdesk-types'

import { MetricName, MetricScope } from 'domains/reporting/hooks/metricNames'
import {
    CustomFieldsFilter,
    DimensionName,
    StandardFilter,
    TagsFilter,
    TimeDimensionName,
} from 'domains/reporting/models/scopes/types'
import { createScopeFilters } from 'domains/reporting/models/scopes/utils'
import {
    AggregationWindow,
    StatsFiltersWithLogicalOperator,
} from 'domains/reporting/models/stat/types'

type Values<T> = T extends readonly (infer U)[] ? U : never

// Helper type to map filter members to their specific shapes
type FilterMemberToShape<TMember extends string> =
    TMember extends 'customFields'
        ? CustomFieldsFilter
        : TMember extends 'tags'
          ? TagsFilter
          : TMember extends StandardFilter['member']
            ? StandardFilter & { member: TMember }
            : never

type OptionalFilters<TFilterMembers extends readonly string[]> = {
    [K in keyof TFilterMembers]: TFilterMembers[K] extends string
        ? FilterMemberToShape<TFilterMembers[K]>
        : never
}[number]

export type ScopeMeta = {
    scope: MetricScope
    measures?: readonly string[]
    dimensions?: readonly DimensionName[]
    timeDimensions?: readonly TimeDimensionName[]
    filters?: readonly string[]
    order?: readonly string[]
    limit?: number
}

export type ScopeFilters<TScopeMeta extends ScopeMeta> = Array<
    TScopeMeta['filters'] extends readonly string[]
        ? OptionalFilters<TScopeMeta['filters']>
        : never
>

export type QueryFor<TScopeMeta extends ScopeMeta> = {
    measures?: readonly Values<TScopeMeta['measures']>[]

    limit?: number

    dimensions?: readonly Values<TScopeMeta['dimensions']>[]

    time_dimensions?: readonly {
        dimension: Values<TScopeMeta['timeDimensions']>
        granularity?: AggregationWindow
    }[]

    filters?: ScopeFilters<TScopeMeta>

    timezone?: string

    order?: [Values<TScopeMeta['order']>, OrderDirection][]
}

type Prettify<T> = {
    [K in keyof T]: T[K]
} & {}

export type BuiltQuery<
    TQuery extends ScopeMeta = ScopeMeta,
    TName = MetricName,
> = Readonly<
    Prettify<QueryFor<TQuery> & { metricName: TName; scope: TQuery['scope'] }>
>

type Context = {
    timezone: string
    filters: StatsFiltersWithLogicalOperator
    sortDirection?: OrderDirection
    granularity?: AggregationWindow
}

class MetricQuery<
    TMeta extends ScopeMeta,
    TMetricName extends MetricName,
    TQuery extends QueryFor<TMeta>,
    TContext extends Context,
> {
    constructor(
        public readonly config: TMeta,
        public readonly name: TMetricName,
        private queryFactory: (ctx: { ctx: TContext; config: TMeta }) => TQuery,
    ) {}

    public build(ctx: TContext): BuiltQuery<TMeta, TMetricName> {
        const query = this.queryFactory({
            ctx,
            config: this.config,
        })
        // If query factory did not override timezone, use the one from context
        if (query.timezone === undefined) {
            query.timezone = ctx.timezone
        }
        // If query factory did not define filters, use the default ones
        if (query.filters === undefined) {
            query.filters = createScopeFilters(ctx.filters, this.config)
        }
        // If query factory did not define granularity, use the one from context
        if (
            query.time_dimensions === undefined &&
            this.config.timeDimensions &&
            ctx.granularity
        ) {
            query.time_dimensions = [
                {
                    dimension: this.config.timeDimensions[0] as Values<
                        TMeta['timeDimensions']
                    >,
                    granularity: ctx.granularity,
                },
            ]
        }

        return Object.freeze(
            Object.assign(query, {
                metricName: this.name,
                scope: this.config.scope,
            }),
        )
    }
}

class MetricBuilder<
    TMetricName extends MetricName,
    TMeta extends ScopeMeta,
    TContext extends Context,
> {
    constructor(
        public readonly config: TMeta,
        public readonly metricName: TMetricName,
    ) {}

    defineQuery<TQuery extends QueryFor<TMeta>>(
        queryFactory: (ctx: { ctx: TContext; config: TMeta }) => TQuery,
    ) {
        return new MetricQuery<TMeta, TMetricName, TQuery, TContext>(
            this.config,
            this.metricName,
            queryFactory,
        )
    }
}

class ScopeBuilder<TMeta extends ScopeMeta, TContext extends Context> {
    constructor(public config: TMeta) {}

    defineMetricName<const TMetricName extends MetricName>(
        metricName: TMetricName,
    ) {
        return new MetricBuilder<TMetricName, TMeta, TContext>(
            this.config,
            metricName,
        )
    }
}

export function defineScope<
    const TMeta extends ScopeMeta,
    TContext extends Context = Context,
>(config: TMeta) {
    return new ScopeBuilder<TMeta, TContext>(config)
}
