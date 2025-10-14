import { z } from 'zod'

import { OrderDirection, QueryGranularity } from '@gorgias/helpdesk-types'

import { MetricName, MetricScope } from 'domains/reporting/hooks/metricNames'
import { createScopeFilters } from 'domains/reporting/models/scopes/utils'
import {
    AggregationWindow,
    StatsFiltersWithLogicalOperator,
} from 'domains/reporting/models/stat/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

export type DateFilter = {
    member: string
    operator:
        | ReportingFilterOperator.AfterDate
        | ReportingFilterOperator.BeforeDate
    values: string[]
}

export type StandardFilter = {
    member: string
    operator: LogicalOperatorEnum
    values: string[]
}

export type CustomFieldsFilter = {
    member: string
    values: Array<{
        custom_field_id: string
        operator: LogicalOperatorEnum.ONE_OF | LogicalOperatorEnum.NOT_ONE_OF
        values: string[]
    }>
}

export type TagsFilter = {
    member: string
    values: Array<{
        operator: LogicalOperatorEnum
        values: string[]
    }>
}

export type FilterGroup =
    | StandardFilter
    | CustomFieldsFilter
    | TagsFilter
    | DateFilter

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
    dimensions?: readonly string[]
    timeDimensions?: readonly string[]
    filters?: readonly string[]
    order?: readonly string[]
    limit?: number
}

// TODO: expose as public interface? By default support standard filters
// end let the users extend with "custom" filters?
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
        granularity: QueryGranularity
    }[]

    filters?: ScopeFilters<TScopeMeta>

    timezone?: string

    order?: [Values<TScopeMeta['order']>, OrderDirection][]
}

// util to derive the input type from schema presence
type InputOf<TSchema extends z.ZodTypeAny | undefined> =
    TSchema extends z.ZodTypeAny ? z.infer<TSchema> : undefined

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
    granularity: AggregationWindow
}

class MetricQuery<
    TMeta extends ScopeMeta,
    TMetricName extends MetricName,
    TQuery extends QueryFor<TMeta>,
    TSchema extends z.ZodTypeAny | undefined,
    TContext extends Context,
> {
    constructor(
        public readonly config: TMeta,
        public readonly name: TMetricName,
        private schema: TSchema,
        private queryFactory: (ctx: {
            input: InputOf<TSchema>
            ctx: TContext
            config: TMeta
        }) => TQuery,
    ) {}

    public build(
        ctx: TContext,
        ...args: InputOf<TSchema> extends undefined
            ? []
            : [input: InputOf<TSchema>]
    ): BuiltQuery<TMeta, TMetricName> {
        const input = args[0] as InputOf<TSchema>
        const validated = this.schema ? this.schema.parse(input) : input
        const query = this.queryFactory({
            ctx,
            input: validated as InputOf<TSchema>,
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

        // TODO add granularity if missing in time_dimensions
        return Object.freeze(
            Object.assign(query, {
                metricName: this.name,
                scope: this.config.scope,
            }),
        )
    }
}

class MetricBuilderWithInput<
    TMetricName extends MetricName,
    TSchema extends z.ZodTypeAny,
    TMeta extends ScopeMeta,
    TContext extends Context,
> {
    constructor(
        public readonly config: TMeta,
        public readonly name: TMetricName,
        private schema: TSchema,
    ) {}

    defineQuery<TQuery extends QueryFor<TMeta>>(
        queryFactory: (ctx: {
            input: z.infer<TSchema>
            ctx: TContext
            config: TMeta
        }) => TQuery,
    ) {
        return new MetricQuery<TMeta, TMetricName, TQuery, TSchema, TContext>(
            this.config,
            this.name,
            this.schema,
            queryFactory,
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

    defineInput<TSchema extends z.ZodTypeAny>(schema: TSchema) {
        return new MetricBuilderWithInput<
            TMetricName,
            TSchema,
            TMeta,
            TContext
        >(this.config, this.metricName, schema)
    }

    defineQuery<TQuery extends QueryFor<TMeta>>(
        queryFactory: (ctx: {
            input: undefined
            ctx: TContext
            config: TMeta
        }) => TQuery,
    ) {
        return new MetricQuery<TMeta, TMetricName, TQuery, undefined, TContext>(
            this.config,
            this.metricName,
            undefined,
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

// utils
export function defineScope<
    const TMeta extends ScopeMeta,
    TContext extends Context = Context,
>(config: TMeta) {
    return new ScopeBuilder<TMeta, TContext>(config)
}
