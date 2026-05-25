import type { OrderDirection } from '@gorgias/helpdesk-types'

import type {
    MetricName,
    MetricScope,
} from 'domains/reporting/hooks/metricNames'
import type {
    CustomFieldsFilter,
    DateFilter,
    DimensionName,
    FilterName,
    MeasureName,
    StandardFilter,
    TagsFilter,
    TimeDimensionName,
} from 'domains/reporting/models/scopes/types'
import { createScopeFilters } from 'domains/reporting/models/scopes/utils'
import type {
    AggregationWindow,
    ApiStatsFilters,
} from 'domains/reporting/models/stat/types'

type Values<T> = T extends readonly (infer U)[] ? U : never

type RequiredFilter<TMember extends readonly string[]> = DateFilter & {
    member: TMember
}
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
    measures: readonly MeasureName[]
    dimensions?: readonly DimensionName[]
    timeDimensions?: readonly TimeDimensionName[]
    filters: readonly FilterName[]
    order?: readonly string[]
    limit?: number
    offset?: number
}

export type ScopeFilters<TScopeMeta extends ScopeMeta> = Array<
    TScopeMeta['filters'] extends readonly string[]
        ? RequiredFilter<TScopeMeta['filters']> &
              OptionalFilters<TScopeMeta['filters']>
        : never
>

export type QueryFor<TScopeMeta extends ScopeMeta> = {
    measures: readonly Values<TScopeMeta['measures']>[]

    limit?: number

    offset?: number

    total?: boolean

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

/**
 * Represents the context configuration for scope-based reporting queries.
 *
 * @template TMeta - The scope metadata type that extends {@link ScopeMeta}
 *
 * @property {string} timezone - The timezone used for date/time calculations and aggregations
 * @property {ApiStatsFilters} filters - The filters to apply to the statistics query
 * @property {OrderDirection} [sortDirection] - Optional sort direction (ascending or descending)
 * @property {Values<TMeta['order']>} [sortBy] - Optional field to sort results by, derived from the scope's order metadata
 * @property {AggregationWindow} [granularity] - Optional time window for data aggregation (e.g., hourly, daily). Only available when TMeta has timeDimensions defined and non-empty.
 * @property {number} [offset] - Optional pagination offset for results
 * @property {number} [limit] - Optional maximum number of results to return
 * @property {boolean} [total] - Optional flag to include total count in the response
 */
export type Context<TMeta extends ScopeMeta = ScopeMeta> = {
    timezone: string
    filters: ApiStatsFilters
    sortDirection?: OrderDirection
    sortBy?: Values<TMeta['order']>
    granularity?: TMeta['timeDimensions'] extends undefined
        ? never
        : AggregationWindow
    offset?: number
    limit?: number
    total?: boolean
    dimensions?: readonly Values<TMeta['dimensions']>[]
}

const isScopeValue = <TValues extends readonly string[] | undefined>(
    value: string | undefined,
    supportedValues: TValues,
): value is Values<TValues> =>
    value !== undefined &&
    (supportedValues as readonly string[] | undefined)?.includes(value) === true

const createScopedContext = <TMeta extends ScopeMeta>(
    ctx: Context,
    config: TMeta,
): Context<TMeta> => {
    const rawSortBy = ctx.sortBy
    const sortBy: Values<TMeta['order']> | undefined = isScopeValue<
        TMeta['order']
    >(rawSortBy, config.order)
        ? rawSortBy
        : undefined
    const dimensions =
        ctx.dimensions === undefined
            ? undefined
            : ctx.dimensions.filter(
                  (dimension): dimension is Values<TMeta['dimensions']> =>
                      isScopeValue<TMeta['dimensions']>(
                          dimension,
                          config.dimensions,
                      ),
              )
    const granularity = (
        config.timeDimensions?.length ? ctx.granularity : undefined
    ) as Context<TMeta>['granularity']

    return {
        ...ctx,
        sortBy,
        granularity,
        dimensions,
    }
}

export type MetricQueryFactory<
    TMeta extends ScopeMeta = ScopeMeta,
    TMetricName extends MetricName = MetricName,
    TContext extends Context<TMeta> = Context<TMeta>,
> = (ctx: TContext) => BuiltQuery<TMeta, TMetricName>

class MetricQuery<
    TMeta extends ScopeMeta,
    TMetricName extends MetricName,
    TQuery extends QueryFor<TMeta>,
    TContext extends Context<TMeta>,
> {
    constructor(
        public readonly config: TMeta,
        public readonly name: TMetricName,
        private queryFactory: (ctx: { ctx: TContext; config: TMeta }) => TQuery,
    ) {}

    public build(ctx: TContext): BuiltQuery<TMeta, TMetricName>
    public build(ctx: Context): BuiltQuery<TMeta, TMetricName>
    public build(ctx: TContext | Context): BuiltQuery<TMeta, TMetricName> {
        const scopedContext = createScopedContext(ctx, this.config) as TContext
        const query = this.queryFactory({
            ctx: scopedContext,
            config: this.config,
        })
        // If query factory did not override timezone, use the one from context
        if (query.timezone === undefined) {
            query.timezone = scopedContext.timezone
        }
        // If query factory did not define filters, use the default ones
        if (query.filters === undefined) {
            query.filters = createScopeFilters(
                scopedContext.filters,
                this.config,
            )
        }
        // If query factory did not define granularity, use the one from context
        if (
            query.time_dimensions === undefined &&
            this.config.timeDimensions &&
            this.config.timeDimensions.length > 0 &&
            scopedContext.granularity
        ) {
            query.time_dimensions = [
                {
                    dimension: this.config.timeDimensions[0] as Values<
                        TMeta['timeDimensions']
                    >,
                    granularity: scopedContext.granularity,
                },
            ]
        }
        // If query factory did not override dimensions, use the one from context
        if (query.dimensions === undefined && scopedContext.dimensions) {
            query.dimensions = scopedContext.dimensions
        }

        // If query limit is not defined, use context limit
        if (query.limit === undefined && scopedContext.limit !== undefined) {
            query.limit = scopedContext.limit
        }

        // If query offset is not defined, use context offset
        if (query.offset === undefined && scopedContext.offset !== undefined) {
            query.offset = scopedContext.offset
        }

        // If query total is not defined, use context total
        if (query.total === undefined && scopedContext.total !== undefined) {
            query.total = scopedContext.total
        }

        // If query order is not defined, use context sortDirection and sortBy
        if (
            query.order === undefined &&
            scopedContext.sortDirection &&
            this.config.order
        ) {
            if (scopedContext.sortBy) {
                // Use context sortBy if provided
                query.order = [
                    [scopedContext.sortBy, scopedContext.sortDirection],
                ]
            } else if (
                query.measures?.[0] &&
                this.config.order.includes(query.measures[0])
            ) {
                // otherwise, use first measure if it's in config order
                query.order = [[query.measures[0], scopedContext.sortDirection]]
            } else if (
                query.dimensions?.[0] &&
                this.config.order.includes(query.dimensions[0])
            ) {
                // otherwise, use first dimension if it's in config order
                query.order = [
                    [query.dimensions[0], scopedContext.sortDirection],
                ]
            }
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
    TContext extends Context<TMeta>,
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

class ScopeBuilder<TMeta extends ScopeMeta, TContext extends Context<TMeta>> {
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
    TContext extends Context<TMeta> = Context<TMeta>,
>(config: TMeta) {
    return new ScopeBuilder<TMeta, TContext>(config)
}
