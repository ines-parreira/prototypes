import { reportError } from '@repo/logging'

import { ReportingStatsOperatorsEnum } from '@gorgias/helpdesk-types'

import { SentryTeam } from 'common/const/sentryTeamNames'
import type { MetricName } from 'domains/reporting/hooks/metricNames'
import { TicketMember } from 'domains/reporting/models/cubes/TicketCube'
import {
    hasFilter,
    toLowerCaseString,
} from 'domains/reporting/models/queryFactories/utils'
import type {
    BuiltQuery,
    Context,
    QueryFor,
    ScopeBuilder,
    ScopeFilters,
    ScopeMeta,
} from 'domains/reporting/models/scopes/scope'
import type {
    BooleanFilterName,
    BooleanStandardFilter,
    CustomFieldsFilter,
    DateFilter,
    FilterGroup,
    FilterName,
    NumberFilterName,
    NumberStandardFilter,
    StandardFilter,
    StringFilterName,
    StringStandardFilter,
    TagsFilter,
} from 'domains/reporting/models/scopes/types'
import type { ApiStatsFilters } from 'domains/reporting/models/stat/types'
import type {
    Cube,
    ReportingFilter,
    ReportingQuery,
    ReportingTimeDimension,
} from 'domains/reporting/models/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import type { ExtendedLogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import {
    ApiOnlyOperatorEnum,
    LogicalOperatorEnum,
} from 'domains/reporting/pages/common/components/Filter/constants'
import { CAMPAIGN_EVENTS } from 'domains/reporting/pages/convert/clients/constants'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'

function createDateFilter(
    member: FilterName,
    operator:
        | ReportingFilterOperator.AfterDate
        | ReportingFilterOperator.BeforeDate,
    values: string[],
): DateFilter {
    return {
        member,
        operator,
        values,
    }
}

function createStandardFilter(
    member: BooleanFilterName,
    operator: ExtendedLogicalOperatorEnum,
    values: boolean[],
): BooleanStandardFilter
function createStandardFilter(
    member: NumberFilterName,
    operator: ExtendedLogicalOperatorEnum,
    values: number[],
): NumberStandardFilter
function createStandardFilter(
    member: StringFilterName,
    operator: ExtendedLogicalOperatorEnum,
    values: string[],
): StringStandardFilter
function createStandardFilter(
    member: FilterName,
    operator: ExtendedLogicalOperatorEnum,
    values: string[] | number[] | boolean[],
): StandardFilter
function createStandardFilter<T>(
    member: FilterName,
    operator: ExtendedLogicalOperatorEnum,
    values: T[],
): StandardFilter {
    return {
        member,
        operator,
        values,
    } as StandardFilter
}

// TODO: pass member
function createTagsFilter(
    tags: Array<{
        operator: LogicalOperatorEnum
        values: string[]
    }>,
): TagsFilter {
    return {
        member: 'tags',
        values: tags,
    }
}

// TODO: pass member
function createCustomFieldsFilter(
    customFields: Array<{
        custom_field_id: string
        operator: LogicalOperatorEnum.ONE_OF | LogicalOperatorEnum.NOT_ONE_OF
        values: string[]
    }>,
): CustomFieldsFilter {
    return {
        member: 'customFields',
        values: customFields,
    }
}

/**
 * Creates scope filters based on the scope configuration and context filters.
 * Only applies filters that are defined in the scope's filter configuration.
 */
export function createScopeFilters<TMeta extends ScopeMeta>(
    statFilters: ApiStatsFilters,
    scopeConfig: TMeta,
): ScopeFilters<TMeta> {
    const filters: FilterGroup[] = [
        createDateFilter('periodStart', ReportingFilterOperator.AfterDate, [
            formatReportingQueryDate(statFilters.period.start_datetime),
        ]),
        createDateFilter('periodEnd', ReportingFilterOperator.BeforeDate, [
            formatReportingQueryDate(statFilters.period.end_datetime),
        ]),
    ]
    // Only process filters that are defined in the scope configuration
    const scopeFilters = scopeConfig.filters || []

    scopeFilters.forEach((filterKey) => {
        switch (filterKey) {
            case 'agentId':
                if (statFilters.agents && hasFilter(statFilters.agents)) {
                    filters.push(
                        createStandardFilter(
                            'agentId',
                            statFilters.agents.operator,
                            statFilters.agents.values,
                        ),
                    )
                } else if (
                    statFilters.agentId &&
                    hasFilter(statFilters.agentId)
                ) {
                    filters.push(
                        createStandardFilter(
                            filterKey,
                            statFilters.agentId.operator,
                            statFilters.agentId.values,
                        ),
                    )
                }
                break

            case 'channel':
                if (statFilters.channels && hasFilter(statFilters.channels)) {
                    filters.push(
                        createStandardFilter(
                            'channel',
                            statFilters.channels.operator,
                            statFilters.channels.values,
                        ),
                    )
                }
                break
            // used for old reports
            case 'integrationId':
                if (
                    statFilters.integrations &&
                    hasFilter(statFilters.integrations)
                ) {
                    filters.push(
                        createStandardFilter(
                            'integrationId',
                            statFilters.integrations.operator,
                            statFilters.integrations.values,
                        ),
                    )
                }
                break
            // aiAgent scopes
            case 'storeIntegrationId':
                if (statFilters.stores && hasFilter(statFilters.stores)) {
                    filters.push(
                        createStandardFilter(
                            'storeIntegrationId',
                            statFilters.stores.operator,
                            statFilters.stores.values,
                        ),
                    )
                } else if (
                    statFilters.storeIntegrations &&
                    hasFilter(statFilters.storeIntegrations)
                ) {
                    filters.push(
                        createStandardFilter(
                            'storeIntegrationId',
                            statFilters.storeIntegrations.operator,
                            statFilters.storeIntegrations.values,
                        ),
                    )
                }
                break
            // old queries storeIntegrationId
            case 'storeId':
                if (statFilters.stores && hasFilter(statFilters.stores)) {
                    filters.push(
                        createStandardFilter(
                            'storeId',
                            statFilters.stores.operator,
                            statFilters.stores.values,
                        ),
                    )
                }
                break

            case 'tags':
                if (statFilters.tags && hasFilter(statFilters.tags)) {
                    filters.push(
                        createTagsFilter(
                            statFilters.tags
                                .filter((tag) => tag.values.length > 0)
                                .map((tag) => ({
                                    operator:
                                        tag.operator ===
                                        ReportingStatsOperatorsEnum.OneOf
                                            ? LogicalOperatorEnum.ONE_OF
                                            : tag.operator ===
                                                ReportingStatsOperatorsEnum.NotOneOf
                                              ? LogicalOperatorEnum.NOT_ONE_OF
                                              : LogicalOperatorEnum.ALL_OF,
                                    values: tag.values.map(String),
                                })),
                        ),
                    )
                }
                break

            case 'customFields':
                if (
                    statFilters.customFields &&
                    hasFilter(statFilters.customFields)
                ) {
                    filters.push(
                        createCustomFieldsFilter(
                            statFilters.customFields
                                .filter((field) => field.values.length > 0)
                                .map((field) => ({
                                    custom_field_id: String(
                                        field.customFieldId,
                                    ),
                                    operator:
                                        field.operator ===
                                        ReportingStatsOperatorsEnum.OneOf
                                            ? LogicalOperatorEnum.ONE_OF
                                            : LogicalOperatorEnum.NOT_ONE_OF,
                                    values: field.values.map((value) => {
                                        // Remove a leading numeric id followed by '::' (e.g. "1234::test::chose" -> "test::chose")
                                        return value.replace(/^\d+::/, '')
                                    }),
                                })),
                        ),
                    )
                }
                break
            case 'score':
            case 'communicationSkills':
            case 'languageProficiency':
            case 'resolutionCompleteness':
            case 'accuracy':
            case 'efficiency':
            case 'internalCompliance':
            case 'customFieldValue':
            case 'brandVoice':
            case 'customFieldId':
            case 'productId':
            case 'resourceSourceId':
            case 'resourceSourceSetId':
            case 'callDirection':
            case 'callTerminationStatus':
            case 'callSlaStatus':
            case 'transferredCalls':
            case 'declinedCalls':
            case 'isAnsweredByAgent':
            case 'isDuringBusinessHours':
            case 'displayStatus':
            case 'talkTime':
            case 'waitTime':
            case 'helpCenterEventType':
            case 'isSearchRequestWithClick':
            case 'searchResultCount':
            case 'isInfluenced':
            case 'articleId':
            case 'abVariant':
            case 'shopName':
            case 'source':
            case 'eventType':
            case 'aiAgentRole':
            case 'automationFeatureType':
            case 'engagementType':
            case 'currency':
            case 'customFieldValueString':
            case 'resourceVersion':
            case 'orderId':
            case 'ticketId':
            case 'customField':
                {
                    const filter = statFilters[filterKey]
                    if (filter && hasFilter(filter)) {
                        filters.push(
                            createStandardFilter(
                                filterKey,
                                filter.operator,
                                filter.values,
                            ),
                        )
                    }
                }
                break
            case 'slaPolicyUuid':
                if (
                    statFilters.slaPolicies &&
                    hasFilter(statFilters.slaPolicies)
                ) {
                    filters.push(
                        createStandardFilter(
                            'slaPolicyUuid',
                            statFilters.slaPolicies.operator,
                            statFilters.slaPolicies.values,
                        ),
                    )
                }
                break
            case 'teamId':
                if (statFilters.teams && hasFilter(statFilters.teams)) {
                    filters.push(
                        createStandardFilter(
                            'teamId',
                            statFilters.teams.operator,
                            statFilters.teams.values,
                        ),
                    )
                }
                break
            case 'createdDatetime':
                if (statFilters.createdDatetime) {
                    // the backend API does not support inDateRange operator, so we convert it to AfterDate and BeforeDate
                    filters.push({
                        member: 'createdDatetime',
                        operator: ApiOnlyOperatorEnum.IN_DATE_RANGE,
                        values: [
                            formatReportingQueryDate(
                                statFilters.createdDatetime.start_datetime,
                            ),
                            formatReportingQueryDate(
                                statFilters.createdDatetime.end_datetime,
                            ),
                        ],
                    })
                }
                break
            case 'queueId':
                if (
                    statFilters.voiceQueues &&
                    hasFilter(statFilters.voiceQueues)
                ) {
                    filters.push(
                        createStandardFilter(
                            'queueId',
                            statFilters.voiceQueues.operator,
                            statFilters.voiceQueues.values,
                        ),
                    )
                }
                break
            case 'helpCenterId': {
                if (
                    statFilters.helpCenters &&
                    hasFilter(statFilters.helpCenters)
                ) {
                    filters.push(
                        createStandardFilter(
                            'helpCenterId',
                            statFilters.helpCenters.operator,
                            statFilters.helpCenters.values,
                        ),
                    )
                }
                break
            }
            case 'localeCodes': {
                if (
                    statFilters.localeCodes &&
                    hasFilter(statFilters.localeCodes)
                ) {
                    filters.push(
                        createStandardFilter(
                            'localeCodes',
                            statFilters.localeCodes.operator,
                            statFilters.localeCodes.values.map(
                                toLowerCaseString,
                            ),
                        ),
                    )
                }
                break
            }
            case 'campaignId':
                if (statFilters.campaigns && hasFilter(statFilters.campaigns)) {
                    filters.push(
                        createStandardFilter(
                            'campaignId',
                            statFilters.campaigns.operator,
                            statFilters.campaigns.values,
                        ),
                    )
                }
                break
        }
    })

    return filters as ScopeFilters<TMeta>
}

/**
 * Builds a "value" query (single aggregated number, no dimensions, no time
 * dimensions) from a scope and a base payload factory, plus the matching
 * `(ctx) => BuiltQuery` wrapper ready to be consumed by stats hooks.
 *
 * Use this when a metric should return one number per request (e.g. a trend
 * card showing "Automated interactions: 1,234").
 *
 * @param scope - Scope builder returned by `defineScope(...)`.
 * @param baseQuery - Factory returning the core `{ measures, filters? }`
 *   payload. Any `ctx.dimensions` / `time_dimensions` in the context are
 *   ignored by this shape.
 * @param metricName - Metric name string (also sent to the backend as
 *   `metric_name` query parameter and used for feature-flag routing).
 * @returns `{ valueQuery, valueQueryFactory }` — the `MetricQuery` and its
 *   `(ctx) => BuiltQuery` wrapper.
 */
export const getValueQuery = <
    TMeta extends ScopeMeta,
    TContext extends Context<TMeta> = Context<TMeta>,
>(
    scope: ScopeBuilder<TMeta, TContext>,
    baseQuery: (args: { ctx: TContext; config: TMeta }) => QueryFor<TMeta>,
    metricName: MetricName,
) => {
    const valueQuery = scope.defineMetricName(metricName).defineQuery(baseQuery)
    const valueQueryFactory = (ctx: TContext) => valueQuery.build(ctx)

    return { valueQuery, valueQueryFactory }
}

/**
 * Extracts the union of literal dimension names declared by a scope's
 * `dimensions` tuple (e.g. `'channel' | 'aiIntentCustomField' | ...`). Used
 * to narrow the keys of the per-dimension metric-name override maps accepted
 * by {@link getBreakdownQuery} / {@link getTimeseriesQuery}.
 */
type DimensionOf<TMeta extends ScopeMeta> =
    TMeta['dimensions'] extends readonly (infer U)[]
        ? U extends string
            ? U
            : never
        : never

export type BreakdownQueryHandle<
    TMeta extends ScopeMeta,
    TContext extends Context,
> = {
    config: TMeta
    build: (ctx: TContext) => BuiltQuery<TMeta>
}

/**
 * Shared plumbing for breakdown-style helpers: eagerly constructs one
 * `MetricQuery` per dimension override (plus one default) via the
 * shape-specific `buildMetric` closure, and returns a handle whose `.build()`
 * routes based on `ctx.dimensions`.
 *
 * Factored out of {@link getBreakdownQuery} and
 * {@link getTimeseriesQuery} — which only differ in the shape of the
 * `MetricQuery` they construct from a name.
 */
const makeDimensionRoutedHandle = <
    TMeta extends ScopeMeta,
    TContext extends Context<TMeta>,
>(
    buildMetric: (name: MetricName) => BreakdownQueryHandle<TMeta, TContext>,
    metricName: MetricName,
    dimensionMetricNames:
        | Partial<Record<DimensionOf<TMeta>, MetricName>>
        | undefined,
): BreakdownQueryHandle<TMeta, TContext> => {
    const defaultQuery = buildMetric(metricName)
    const overrides = new Map<string, BreakdownQueryHandle<TMeta, TContext>>()
    for (const [dim, name] of Object.entries(dimensionMetricNames ?? {})) {
        overrides.set(dim, buildMetric(name as MetricName))
    }

    const pick = (ctx: TContext) => {
        if (ctx.dimensions?.length === 1) {
            const override = overrides.get(ctx.dimensions[0] as string)
            if (override) return override
        }
        return defaultQuery
    }

    return {
        config: defaultQuery.config,
        build: (ctx) => pick(ctx).build(ctx),
    }
}

/**
 * Builds a "breakdown" query (one value per dimension group) from a scope and
 * a base payload factory, plus the matching `(ctx) => BuiltQuery` wrapper.
 *
 * Dimensions are pulled from `ctx.dimensions` at call time, so the same
 * metric can slice by channel, intent, etc. depending on the caller — ideal
 * for bar charts and configurable graphs where the dimension is picked in
 * the UI. The query can be also used in tables, when slicing by a given dimension.
 *
 * When `dimensionMetricNames` is provided, a call with `ctx.dimensions` of
 * length 1 whose single value has a mapping uses that override metric name
 * in the built query. Every other shape (no dims, multi-dim, or an unmapped
 * single dim) falls back to the default `metricName`. Routing is applied
 * both via the returned factory AND via `breakdownQuery.build(ctx)`, so
 * callers that `.build()` directly (e.g. tests) see the same resolution.
 *
 * @param scope - Scope builder returned by `defineScope(...)`.
 * @param baseQuery - Factory returning the core `{ measures, filters? }`
 *   payload. `dimensions` are injected on top from `ctx.dimensions`.
 * @param metricName - Default metric name used when no override matches.
 * @param dimensionMetricNames - Optional map from a single dimension key to
 *   a dedicated metric name. E.g. `{ channel: 'ai-agent-...-per-channel' }`.
 *   Keys are constrained to the scope's declared `dimensions` via
 *   {@link DimensionOf}.
 * @returns `{ breakdownQuery, breakdownQueryFactory }` — a routing handle and
 *   its `(ctx) => BuiltQuery` wrapper. Note `breakdownQuery` is no longer a
 *   `MetricQuery` instance but a structural `{ config, build }` that proxies
 *   to the right underlying `MetricQuery` based on `ctx.dimensions`.
 */
export const getBreakdownQuery = <
    TMeta extends ScopeMeta,
    TContext extends Context<TMeta> = Context<TMeta>,
>(
    scope: ScopeBuilder<TMeta, TContext>,
    baseQuery: (args: { ctx: TContext; config: TMeta }) => QueryFor<TMeta>,
    metricName: MetricName,
    dimensionMetricNames?: Partial<Record<DimensionOf<TMeta>, MetricName>>,
) => {
    const buildBreakdown = (name: MetricName) =>
        scope.defineMetricName(name).defineQuery(({ ctx, config }) => ({
            limit: 10000,
            ...baseQuery({ ctx, config }),
            dimensions: ctx.dimensions,
        }))

    const breakdownQuery = makeDimensionRoutedHandle<TMeta, TContext>(
        buildBreakdown,
        metricName,
        dimensionMetricNames,
    )
    const breakdownQueryFactory = (ctx: TContext) => breakdownQuery.build(ctx)

    return { breakdownQuery, breakdownQueryFactory }
}

type TimeDimensionOf<TMeta extends ScopeMeta> =
    TMeta['timeDimensions'] extends readonly (infer U)[] ? U : never

/**
 * Builds a "timeseries" (time-series) query from a scope and a base
 * payload factory, plus the matching `(ctx) => BuiltQuery` wrapper.
 *
 * Behaves like {@link getBreakdownQuery} but also attaches
 * `time_dimensions: [{ dimension, granularity: ctx.granularity }]` and a
 * default `limit: 10000` — ideal for line-chart data feeds where points are
 * bucketed by granularity. Same single-dim override semantics as
 * {@link getBreakdownQuery}.
 *
 * @param scope - Scope builder returned by `defineScope(...)`.
 * @param baseQuery - Factory returning the core `{ measures, filters? }`
 *   payload.
 * @param metricName - Default metric name used when no override matches.
 * @param timeDimension - Which time dimension to aggregate over, constrained
 *   to the scope's declared `timeDimensions` via {@link TimeDimensionOf}.
 * @param dimensionMetricNames - Optional map from a single dimension key to
 *   a dedicated metric name. See {@link getBreakdownQuery} for semantics.
 * @returns `{ timeseriesQuery, timeseriesQueryFactory }` — same
 *   routing-handle shape as {@link getBreakdownQuery} returns for breakdown.
 */
export const getTimeseriesQuery = <
    TMeta extends ScopeMeta,
    TContext extends Context<TMeta> = Context<TMeta>,
>(
    scope: ScopeBuilder<TMeta, TContext>,
    baseQuery: (args: { ctx: TContext; config: TMeta }) => QueryFor<TMeta>,
    metricName: MetricName,
    timeDimension: TimeDimensionOf<TMeta>,
    dimensionMetricNames?: Partial<Record<DimensionOf<TMeta>, MetricName>>,
) => {
    const buildTimeseries = (name: MetricName) =>
        scope.defineMetricName(name).defineQuery(({ ctx, config }) => ({
            ...baseQuery({ ctx, config }),
            dimensions: ctx.dimensions,
            time_dimensions: [
                {
                    dimension: timeDimension,
                    granularity: ctx.granularity,
                },
            ],
            limit: 10000,
        }))

    const timeseriesQuery = makeDimensionRoutedHandle<TMeta, TContext>(
        buildTimeseries,
        metricName,
        dimensionMetricNames,
    )
    const timeseriesQueryFactory = (ctx: TContext) => timeseriesQuery.build(ctx)

    return { timeseriesQuery, timeseriesQueryFactory }
}

/**
 * Convenience composition of {@link getValueQuery},
 * {@link getBreakdownQuery}, and {@link getTimeseriesQuery} — the
 * standard "value + breakdown + timeseries" triplet built over a
 * single shared `baseQuery`. Use this when a scope needs all three shapes
 * (the common case for trend cards backed by bar/table + line charts); reach for
 * the individual helpers when a scope only needs a subset.
 *
 * Returns all six items (one `MetricQuery` and one factory per shape) in a
 * flat object so callers can destructure-and-rename to their scope-specific
 * export names.
 *
 * @param scope - Scope builder returned by `defineScope(...)`.
 * @param baseQuery - Factory returning the core `{ measures, filters? }`
 *   payload shared across all three shapes. `dimensions`, `time_dimensions`,
 *   and `limit` are added by the respective shape builders.
 * @param options
 * @param options.valueMetricName - Metric name for the value shape.
 * @param options.breakdownMetricName - Metric name for the breakdown shape.
 * @param options.timeseriesMetricName - Metric name for the
 *   timeseries shape.
 * @param options.timeDimension - Time dimension used by the breakdown-over-
 *   time shape; constrained to the scope's declared `timeDimensions`.
 * @param options.breakdownDimensionMetricNames - Optional per-dimension
 *   metric-name overrides for the breakdown shape; see
 *   {@link getBreakdownQuery}.
 * @param options.timeseriesDimensionMetricNames - Optional
 *   per-dimension metric-name overrides for the timeseries shape;
 *   see {@link getTimeseriesQuery}.
 * @returns `{ valueQuery, valueQueryFactory, breakdownQuery,
 *   breakdownQueryFactory, timeseriesQuery,
 *   timeseriesQueryFactory }`.
 *
 * @example
 * ```ts
 * const baseQuery = () => ({ measures: ['automatedInteractionsCount'] as const })
 *
 * export const {
 *     valueQuery: allAgentsAutomatedInteractionsValue,
 *     valueQueryFactory: allAgentsAutomatedInteractionsValueQueryFactoryV2,
 *     breakdownQuery: allAgentsAutomatedInteractionsBreakdown,
 *     breakdownQueryFactory: allAgentsAutomatedInteractionsBreakdownQueryFactoryV2,
 *     timeseriesQuery: allAgentsAutomatedInteractionsTimeseries,
 *     timeseriesQueryFactory: allAgentsAutomatedInteractionsTimeseriesQueryFactoryV2,
 * } = getGenericQueries(aiAgentAutomatedInteractionsScope, baseQuery, {
 *     valueMetricName: METRIC_NAMES.AI_AGENT_AUTOMATED_INTERACTIONS_VALUE,
 *     breakdownMetricName: METRIC_NAMES.AI_AGENT_AUTOMATED_INTERACTIONS_BREAKDOWN,
 *     timeseriesMetricName:
 *         METRIC_NAMES.AI_AGENT_AUTOMATED_INTERACTIONS_TIMESERIES,
 *     timeDimension: 'eventDatetime',
 * })
 * ```
 */
export const getGenericQueries = <
    TMeta extends ScopeMeta,
    TContext extends Context<TMeta> = Context<TMeta>,
>(
    scope: ScopeBuilder<TMeta, TContext>,
    baseQuery: (args: { ctx: TContext; config: TMeta }) => QueryFor<TMeta>,
    options: {
        valueMetricName: MetricName
        breakdownMetricName: MetricName
        timeseriesMetricName: MetricName
        timeDimension: TimeDimensionOf<TMeta>
        breakdownDimensionMetricNames?: Partial<
            Record<DimensionOf<TMeta>, MetricName>
        >
        timeseriesDimensionMetricNames?: Partial<
            Record<DimensionOf<TMeta>, MetricName>
        >
    },
) => {
    const {
        valueMetricName,
        breakdownMetricName,
        timeseriesMetricName,
        timeDimension,
        breakdownDimensionMetricNames,
        timeseriesDimensionMetricNames,
    } = options

    return {
        ...getValueQuery(scope, baseQuery, valueMetricName),
        ...getBreakdownQuery(
            scope,
            baseQuery,
            breakdownMetricName,
            breakdownDimensionMetricNames,
        ),
        ...getTimeseriesQuery(
            scope,
            baseQuery,
            timeseriesMetricName,
            timeDimension,
            timeseriesDimensionMetricNames,
        ),
    }
}

type SegmentToFilterMapping = {
    segment: string // V1 segment name (e.g., 'VoiceCall.outboundCalls')
    filters: ReportingFilter[] // Equivalent V2 filters
}

/**
 * Maps V1 segments to their equivalent V2 filters.
 * When a V1 segment is converted to V2 filters (as done in voiceCalls.ts withVoiceCallSegment),
 * this mapping allows the query comparison to recognize them as equivalent.
 */
const SEGMENT_TO_FILTER_MAPPINGS: SegmentToFilterMapping[] = [
    {
        segment: 'VoiceCall.outboundCalls',
        filters: [
            {
                member: 'VoiceCall.direction',
                operator: ReportingFilterOperator.Equals,
                values: ['outbound'],
            },
        ],
    },
    {
        segment: 'VoiceCall.inboundCalls',
        filters: [
            {
                member: 'VoiceCall.direction',
                operator: ReportingFilterOperator.Equals,
                values: ['inbound'],
            },
        ],
    },
    {
        segment: 'VoiceCall.inboundUnansweredCalls',
        filters: [
            {
                member: 'VoiceCall.direction',
                operator: ReportingFilterOperator.Equals,
                values: ['inbound'],
            },
            {
                member: 'VoiceCall.terminationStatus',
                operator: ReportingFilterOperator.Equals,
                values: [
                    'missed',
                    'abandoned',
                    'cancelled',
                    'callback-requested',
                ],
            },
        ],
    },
    {
        segment: 'VoiceCall.inboundMissedCalls',
        filters: [
            {
                member: 'VoiceCall.direction',
                operator: ReportingFilterOperator.Equals,
                values: ['inbound'],
            },
            {
                member: 'VoiceCall.terminationStatus',
                operator: ReportingFilterOperator.Equals,
                values: ['missed'],
            },
        ],
    },
    {
        segment: 'VoiceCall.inboundAbandonedCalls',
        filters: [
            {
                member: 'VoiceCall.direction',
                operator: ReportingFilterOperator.Equals,
                values: ['inbound'],
            },
            {
                member: 'VoiceCall.terminationStatus',
                operator: ReportingFilterOperator.Equals,
                values: ['abandoned'],
            },
        ],
    },
    {
        segment: 'VoiceCall.inboundCancelledCalls',
        filters: [
            {
                member: 'VoiceCall.direction',
                operator: ReportingFilterOperator.Equals,
                values: ['inbound'],
            },
            {
                member: 'VoiceCall.terminationStatus',
                operator: ReportingFilterOperator.Equals,
                values: ['cancelled'],
            },
        ],
    },
    {
        segment: 'VoiceCall.inboundCallbackRequestedCalls',
        filters: [
            {
                member: 'VoiceCall.direction',
                operator: ReportingFilterOperator.Equals,
                values: ['inbound'],
            },
            {
                member: 'VoiceCall.terminationStatus',
                operator: ReportingFilterOperator.Equals,
                values: ['callback-requested'],
            },
        ],
    },
    {
        segment: 'VoiceCall.inboundUnansweredCallsByAgent',
        filters: [
            {
                member: 'VoiceCall.direction',
                operator: ReportingFilterOperator.Equals,
                values: ['inbound'],
            },
            {
                member: 'VoiceCall.unansweredByFilteringAgent',
                operator: ReportingFilterOperator.Equals,
                values: ['1'],
            },
        ],
    },
    {
        segment: 'VoiceCall.inboundAnsweredCallsByAgent',
        filters: [
            {
                member: 'VoiceCall.direction',
                operator: ReportingFilterOperator.Equals,
                values: ['inbound'],
            },
            {
                member: 'VoiceCall.answeredByFilteringAgent',
                operator: ReportingFilterOperator.Equals,
                values: ['1'],
            },
        ],
    },
    {
        segment: 'VoiceCall.callSlaBreached',
        filters: [
            {
                member: 'VoiceCall.callSlaStatus',
                operator: ReportingFilterOperator.Equals,
                values: ['1'],
            },
        ],
    },

    // The "survey scored" segment is redundant
    {
        segment: 'TicketSatisfactionSurveyEnriched.surveyScored',
        filters: [],
    },
    // Voice events agents segments
    {
        segment: 'VoiceEventsByAgent.transferredInboundCalls',
        filters: [
            {
                member: 'VoiceEventsByAgent.transferredCalls',
                operator: ReportingFilterOperator.Equals,
                values: ['1'],
            },
        ],
    },
    {
        segment: 'VoiceEventsByAgent.declinedInboundCalls',
        filters: [
            {
                member: 'VoiceEventsByAgent.declinedCalls',
                operator: ReportingFilterOperator.Equals,
                values: ['1'],
            },
        ],
    },

    // VoiceCall.callsInFinalStatus has no additional filters in V2

    // HelpCenter segments
    {
        segment: 'HelpCenterTrackingEvent.searchRequestWithClicks',
        filters: [
            {
                member: 'HelpCenterTrackingEvent.isSearchRequestWithClick',
                operator: ReportingFilterOperator.Equals,
                values: ['1'],
            },
        ],
    },
    {
        segment: 'HelpCenterTrackingEvent.articleViewOnly',
        filters: [
            {
                member: 'HelpCenterTrackingEvent.eventType',
                operator: ReportingFilterOperator.Equals,
                values: ['page.viewed'],
            },
        ],
    },
    {
        segment: 'HelpCenterTrackingEvent.searchRequestedOnly',
        filters: [
            {
                member: 'HelpCenterTrackingEvent.eventType',
                operator: ReportingFilterOperator.Equals,
                values: ['search.requested'],
            },
        ],
    },
    {
        segment: 'HelpCenterTrackingEvent.searchResultClickedOnly',
        filters: [
            {
                member: 'HelpCenterTrackingEvent.eventType',
                operator: ReportingFilterOperator.Equals,
                values: ['search-result.clicked'],
            },
        ],
    },
    {
        segment: 'HelpCenterTrackingEvent.noSearchResultOnly',
        //`${CUBE}.event_type='search.requested' AND ${searchResultCount} = 0`,
        filters: [
            {
                member: 'HelpCenterTrackingEvent.eventType',
                operator: ReportingFilterOperator.Equals,
                values: ['search.requested'],
            },
            {
                member: 'HelpCenterTrackingEvent.searchResultCount',
                operator: ReportingFilterOperator.Equals,
                values: ['0'],
            },
        ],
    },
    {
        segment: 'CampaignEvents.campaignEventsOnly',
        filters: [
            {
                member: 'CampaignEvents.eventType',
                operator: ReportingFilterOperator.Equals,
                values: CAMPAIGN_EVENTS,
            },
        ],
    },
]

function compareArrays<T>(
    v1: T[],
    v2: T[],
    fieldName: string,
    differences: string[],
) {
    const sorted1 = [...v1].sort()
    const sorted2 = [...v2].sort()
    if (JSON.stringify(sorted1) !== JSON.stringify(sorted2)) {
        differences.push(
            `${fieldName}: ${JSON.stringify(v1)} (V1) !== ${JSON.stringify(v2)} (V2)`,
        )
    }
}

function compareSimpleValues<T>(
    v1: T,
    v2: T,
    fieldName: string,
    differences: string[],
) {
    if (v1 !== v2) {
        differences.push(`${fieldName}: ${v1} !== ${v2}`)
    }
}

const findMatchingFilter = (
    filter: ReportingFilter,
    filters: ReportingFilter[],
) => {
    return filters.find(
        (f) =>
            filter.member === f.member &&
            filter.operator === f.operator &&
            JSON.stringify(filter.values) === JSON.stringify(f.values),
    )
}

/**
 * Checks if all expected filters exist in the actual filters array
 */
const hasEquivalentFilters = (
    expectedFilters: ReportingFilter[],
    actualFilters: ReportingFilter[],
): boolean => {
    return expectedFilters.every(
        (expectedFilter) =>
            findMatchingFilter(expectedFilter, actualFilters) !== undefined,
    )
}

/**
 * Checks if a V2 filter comes from a V1 segment transformation
 */
const isFilterFromV1Segment = (
    filter: ReportingFilter,
    v1Segments: (string | undefined)[],
): boolean => {
    return SEGMENT_TO_FILTER_MAPPINGS.some(
        (mapping) =>
            v1Segments.includes(mapping.segment) &&
            findMatchingFilter(filter, mapping.filters) !== undefined,
    )
}

const membersToIgnore = [TicketMember.TotalCustomFieldIdsToMatch]

function compareFilters(
    v1Filters: ReportingFilter[],
    v2Filters: ReportingFilter[],
    v1Segments: (string | undefined)[],
    differences: string[],
) {
    let v1FiltersCount = v1Filters.length
    let v2FiltersCount = v2Filters.length

    for (const v1Filter of v1Filters) {
        if (!findMatchingFilter(v1Filter, v2Filters)) {
            differences.push(
                `V1 filter not found in V2: ${JSON.stringify(v1Filter)}`,
            )
        }
    }

    for (const v2Filter of v2Filters) {
        if (!findMatchingFilter(v2Filter, v1Filters)) {
            // Ignore filters for members that are known to be added in V2 only
            if (membersToIgnore.includes(v2Filter.member as TicketMember)) {
                v2FiltersCount--
                continue
            }
            // Check if this V2 filter comes from a V1 segment transformation
            if (!isFilterFromV1Segment(v2Filter, v1Segments)) {
                // Only report if it's truly a new filter, not from a segment
                differences.push(
                    `V2 filter not found in V1: ${JSON.stringify(v2Filter)}`,
                )
            } else {
                // Filter comes from a V1 segment, so we don't count it
                v2FiltersCount--
            }
        }
    }
    if (v1FiltersCount !== v2FiltersCount) {
        differences.push(
            `filters length: V1 ${v1FiltersCount} !== V2 ${v2FiltersCount}`,
        )
    }
}

function compareTimeDimensions(
    v1TimeDimensions: ReportingTimeDimension<any>[],
    v2TimeDimensions: ReportingTimeDimension<any>[],
    differences: string[],
) {
    if (v1TimeDimensions.length !== v2TimeDimensions.length) {
        differences.push(
            `timeDimensions length: ${v1TimeDimensions.length} (V1) !== ${v2TimeDimensions.length} (V2)`,
        )
        return
    }

    for (let i = 0; i < v1TimeDimensions.length; i++) {
        const v1TimeDim = v1TimeDimensions[i]
        const v2TimeDim = v2TimeDimensions[i]

        if (v1TimeDim.dimension !== v2TimeDim.dimension) {
            differences.push(
                `timeDimensions[${i}].dimension: ${v1TimeDim.dimension} (V1) !== ${v2TimeDim.dimension} (V2)`,
            )
        }
        if (v1TimeDim.granularity !== v2TimeDim.granularity) {
            differences.push(
                `timeDimensions[${i}].granularity: ${v1TimeDim.granularity} (V1) !== ${v2TimeDim.granularity} (V2)`,
            )
        }
    }
}

/**
 * Compares V1 and V2 segments, accounting for segment-to-filter transformations.
 * V1 segments may be represented as filters in V2, so we check the mapping.
 */
function compareSegments(
    v1Segments: (string | undefined)[],
    v2Segments: (string | undefined)[],
    v2Filters: ReportingFilter[],
    differences: string[],
) {
    // Check V1 segments missing in V2
    for (const v1Segment of v1Segments) {
        if (!v1Segment) continue
        const isInV2Segments = v2Segments.includes(v1Segment)

        if (!isInV2Segments) {
            // Check if this segment has an equivalent filter mapping
            const mapping = SEGMENT_TO_FILTER_MAPPINGS.find(
                (m) => m.segment === v1Segment,
            )

            if (mapping && hasEquivalentFilters(mapping.filters, v2Filters)) {
                // Segment is represented as filters in V2 - this is OK
                continue
            }

            // No equivalent found - report difference
            differences.push(
                `V1 segment not found in V2 segments or filters: ${v1Segment}`,
            )
        }
    }

    // Check V2 segments missing in V1
    for (const v2Segment of v2Segments) {
        if (!v2Segment) continue
        if (!v1Segments.includes(v2Segment)) {
            differences.push(`V2 segment not found in V1: ${v2Segment}`)
        }
    }
}

/**
 * Compares two reporting queries.
 * Function should not compare limit, offset and metricName.
 * @param metricName - The name of the metric being compared.
 * @param v1query - The first query to compare.
 * @param v2query - The second query to compare.
 * @returns An object containing the comparison results.
 */
export function compareAndReportQueries<TCube extends Cube = Cube>(
    metricName: MetricName,
    v1query: ReportingQuery<TCube>,
    v2query: ReportingQuery<TCube>,
) {
    try {
        const differences: string[] = []

        compareArrays(
            v1query.measures,
            [...v2query.measures],
            'measures',
            differences,
        )

        compareArrays(
            v1query.dimensions,
            [...v2query.dimensions],
            'dimensions',
            differences,
        )

        compareTimeDimensions(
            v1query.timeDimensions || [],
            [...(v2query.timeDimensions || [])],
            differences,
        )

        compareFilters(
            v1query.filters,
            v2query.filters,
            (v1query.segments || []) as (string | undefined)[],
            differences,
        )

        type LegacyOrder = { id: string; desc?: boolean; asc?: boolean }
        type NewOrder = [string, string]

        const v1Order: LegacyOrder[] = (v1query.order as any) || [
            { id: '', desc: false, asc: false },
        ]
        const v2Order: NewOrder[] = (v2query.order as any) || [['', '']]

        if (
            v1Order[0] &&
            v2Order[0] &&
            v1Order[0].id !== '' &&
            v2Order[0][0] !== ''
        ) {
            const isCorrectDescending =
                v1Order[0].desc === true && v2Order[0][1] === 'desc'
            const isCorrectAscending =
                v1Order[0].desc === false && v2Order[0][1] === 'asc'

            if (
                v1Order[0].id !== v2Order[0][0] ||
                (!isCorrectDescending && !isCorrectAscending)
            ) {
                differences.push(
                    `order: ${JSON.stringify(v1query.order)} (V1) !== ${JSON.stringify(v2query.order)} (V2)`,
                )
            }
        }

        compareSegments(
            (v1query.segments || []) as string[],
            (v2query.segments || []) as string[],
            v2query.filters,
            differences,
        )

        compareSimpleValues(
            v1query.timezone,
            v2query.timezone,
            'timezone',
            differences,
        )

        if (differences.length > 0) {
            console.error(
                `New Stats API and Legacy API queries are different for metric ${metricName}`,
                differences,
                v1query,
                v2query,
            )

            reportError(
                new Error(
                    `New Stats API and Legacy API queries are different for metric ${metricName}`,
                ),
                {
                    tags: { team: SentryTeam.CPLT_ANALYTICS_FRONTEND },
                    extra: {
                        differences,
                        summary: `Found ${differences.length} difference(s)`,
                        metricName,
                        v1query: JSON.stringify(
                            v1query,
                            [
                                'measures',
                                'dimensions',
                                'timeDimensions',
                                'filters',
                                'segments',
                                'timezone',
                                'order',
                            ],
                            2,
                        ),
                        v2query: JSON.stringify(
                            v2query,
                            [
                                'measures',
                                'dimensions',
                                'timeDimensions',
                                'filters',
                                'segments',
                                'timezone',
                                'order',
                            ],
                            2,
                        ),
                    },
                },
                [`different_queries`, metricName],
            )
            return false
        }
        return true
    } catch (error: Error | unknown) {
        reportError(error, {
            tags: { team: SentryTeam.CPLT_ANALYTICS_FRONTEND },
            extra: {
                message: 'Error comparing reporting queries in New Stats API',
            },
        })
        return false
    }
}
