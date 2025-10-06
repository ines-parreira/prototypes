import { z } from 'zod'

import {
    OrderDirection,
    QueryGranularity,
    ReportingStatsOperatorsEnum,
} from '@gorgias/helpdesk-types'

type StandardFilter = {
    member: string
    operator: ReportingStatsOperatorsEnum
    values: string[]
}

type CustomFieldsFilter = {
    member: string
    values: Array<{
        custom_field_id: string
        operator: 'one-of' | 'not-one-of'
        values: string[]
    }>
}

type TagsFilter = {
    member: string
    values: Array<{
        operator: 'one-of' | 'not-one-of' | 'all-of'
        values: string[]
    }>
}

export type FilterGroup = StandardFilter | CustomFieldsFilter | TagsFilter

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
    measures?: readonly string[]
    dimensions?: readonly string[]
    timeDimensions?: readonly string[]
    filters?: readonly string[]
    // TODO: required_filters?: readonly FilterKey[]
    order?: readonly string[]
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

type QueryResult<TQuery, TName> = Readonly<Prettify<TQuery & { scope: TName }>>

class MetricQuery<
    TScopeName extends string,
    TMetricName extends string,
    TQuery extends QueryFor<ScopeMeta>,
    TSchema extends z.ZodTypeAny | undefined,
    TContext,
> {
    constructor(
        public readonly scope: TScopeName,
        public readonly name: TMetricName,
        private schema: TSchema,
        private queryFactory: (ctx: {
            input: InputOf<TSchema>
            ctx: TContext
        }) => TQuery,
    ) {}

    public build(
        ctx: TContext,
        ...args: InputOf<TSchema> extends undefined
            ? []
            : [input: InputOf<TSchema>]
    ): QueryResult<TQuery, TScopeName> {
        const input = args[0] as InputOf<TSchema>
        const validated = this.schema ? this.schema.parse(input) : input
        const query = this.queryFactory({
            ctx,
            input: validated as InputOf<TSchema>,
        })
        return Object.freeze(Object.assign(query, { scope: this.scope }))
    }
}

class MetricBuilderWithInput<
    TScopeName extends string,
    TMetricName extends string,
    TSchema extends z.ZodTypeAny,
    TMeta extends ScopeMeta,
    TContext,
> {
    constructor(
        public readonly scope: TScopeName,
        public readonly name: TMetricName,
        private schema: TSchema,
    ) {}

    defineQuery<TQuery extends QueryFor<TMeta>>(
        queryFactory: (ctx: {
            input: z.infer<TSchema>
            ctx: TContext
        }) => TQuery,
    ) {
        return new MetricQuery<
            TScopeName,
            TMetricName,
            TQuery,
            TSchema,
            TContext
        >(this.scope, this.name, this.schema, queryFactory)
    }
}

class MetricBuilder<
    TScopeName extends string,
    TMetricName extends string,
    TMeta extends ScopeMeta,
    TContext,
> {
    constructor(
        public readonly scope: TScopeName,
        public readonly name: TMetricName,
    ) {}

    defineInput<TSchema extends z.ZodTypeAny>(schema: TSchema) {
        return new MetricBuilderWithInput<
            TScopeName,
            TMetricName,
            TSchema,
            TMeta,
            TContext
        >(this.scope, this.name, schema)
    }

    defineQuery<TQuery extends QueryFor<TMeta>>(
        queryFactory: (ctx: { input: undefined; ctx: TContext }) => TQuery,
    ) {
        return new MetricQuery<
            TScopeName,
            TMetricName,
            TQuery,
            undefined,
            TContext
        >(this.scope, this.name, undefined, queryFactory)
    }
}

class ScopeBuilder<
    TScopeName extends string,
    TMeta extends ScopeMeta,
    TContext,
> {
    constructor(public readonly name: TScopeName) {}

    create<const TMetricName extends string>(metricName: TMetricName) {
        return new MetricBuilder<TScopeName, TMetricName, TMeta, TContext>(
            this.name,
            metricName,
        )
    }
}

// TODO: Have truly global context e.g.
// const t = initRouter<Context>()
// const myScope = t.scope<MyScope>().define('my-scope')
export function initScope<TMeta extends ScopeMeta, TContext = undefined>() {
    return Object.freeze({
        define<const TName extends string>(name: TName) {
            return new ScopeBuilder<TName, TMeta, TContext>(name)
        },
    })
}

// utils
export function defineScope<const T extends ScopeMeta>(config: T) {
    return config
}
