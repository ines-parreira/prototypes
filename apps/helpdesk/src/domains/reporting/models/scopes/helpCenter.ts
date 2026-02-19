import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

import { defineScope } from './scope'
import { createScopeFilters } from './utils'

const helpCenterScope = defineScope({
    scope: MetricScope.Helpcenter,
    measures: [
        'articleViewCount',
        'searchRequestedCount',
        'articleCount',
        'searchRequestedQueryCount',
        'searchArticlesClickedCount',
        'uniqueSearchArticlesClickedCount',
        'uniqueSearchQueryCount',
    ],
    dimensions: [
        'helpCenterId',
        'eventType',
        'localeCodes',
        'articleId',
        'articleTitle',
        'articleSlug',
        'searchQuery',
        'searchResultRange',
    ],
    filters: [
        'periodStart',
        'periodEnd',
        'helpCenterId',
        'helpCenterEventType',
        'localeCodes',
        'isSearchRequestWithClick',
        'searchResultCount',
        'articleId',
    ],
    timeDimensions: ['timestamp'],
    order: ['articleViewCount', 'timestamp', 'searchRequestedQueryCount'],
})

type HelpCenterContext = Context<typeof helpCenterScope.config>

export const helpCenterArticleView = helpCenterScope
    .defineMetricName(METRIC_NAMES.HELP_CENTER_ARTICLE_VIEW)
    .defineQuery(() => ({
        measures: ['articleViewCount'],
    }))

export const helpCenterArticleViewQueryFactoryV2 = (ctx: HelpCenterContext) =>
    helpCenterArticleView.build(ctx)

export const helpCenterSearchRequested = helpCenterScope
    .defineMetricName(METRIC_NAMES.HELP_CENTER_SEARCH_REQUESTED)
    .defineQuery(() => ({ measures: ['searchRequestedCount'] }))

export const helpCenterSearchRequestedQueryFactoryV2 = (
    ctx: HelpCenterContext,
) => helpCenterSearchRequested.build(ctx)

export const helpCenterArticleViewTimeSeries = helpCenterScope
    .defineMetricName(METRIC_NAMES.HELP_CENTER_ARTICLE_VIEW_TIME_SERIES)
    .defineQuery(({ ctx }) => ({
        measures: ['articleViewCount'],
        time_dimensions: [
            {
                dimension: 'timestamp' as const,
                granularity: ctx.granularity,
            },
        ],
        order: [['timestamp', 'asc']],
    }))

export const helpCenterArticleViewTimeSeriesQueryFactoryV2 = (
    ctx: HelpCenterContext,
) => helpCenterArticleViewTimeSeries.build(ctx)

export const helpCenterPerformancePerArticle = helpCenterScope
    .defineMetricName(METRIC_NAMES.HELP_CENTER_PERFORMANCE_BY_ARTICLE)
    .defineQuery(({ ctx, config }) => ({
        measures: ['articleViewCount'],
        dimensions: ['articleId', 'articleTitle', 'articleSlug', 'localeCodes'],
        order: [['articleViewCount', 'desc']],
        filters: [
            ...createScopeFilters(ctx.filters, config),
            {
                member: 'helpCenterEventType',
                operator: LogicalOperatorEnum.ONE_OF,
                values: ['page.viewed'],
            },
        ] as any,
    }))

export const helpCenterPerformancePerArticleQueryFactoryV2 = (
    ctx: HelpCenterContext,
) => helpCenterPerformancePerArticle.build(ctx)

export const helpCenterPerformancePerArticleCount = helpCenterScope
    .defineMetricName(METRIC_NAMES.HELP_CENTER_PERFORMANCE_BY_ARTICLE_COUNT)
    .defineQuery(({ ctx, config }) => ({
        measures: ['articleCount'],
        filters: [
            ...createScopeFilters(ctx.filters, config),
            {
                member: 'helpCenterEventType',
                operator: LogicalOperatorEnum.ONE_OF,
                values: ['page.viewed'],
            },
        ] as any,
    }))

export const helpCenterPerformancePerArticleCountQueryFactoryV2 = (
    ctx: HelpCenterContext,
) => helpCenterPerformancePerArticleCount.build(ctx)

export const helpCenterSearchResultRange = helpCenterScope
    .defineMetricName(METRIC_NAMES.HELP_CENTER_SEARCH_RESULT_RANGE)
    .defineQuery(() => ({
        measures: ['searchRequestedCount'],
        dimensions: ['searchResultRange'],
    }))

export const helpCenterSearchResultRangeQueryFactoryV2 = (
    ctx: HelpCenterContext,
) => helpCenterSearchResultRange.build(ctx)

export const helpCenterSearchResultTerms = helpCenterScope
    .defineMetricName(METRIC_NAMES.HELP_CENTER_SEARCH_RESULT_TERMS)
    .defineQuery(({ ctx, config }) => ({
        filters: [
            ...createScopeFilters(ctx.filters, config),
            {
                member: 'isSearchRequestWithClick',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [true],
            },
        ] as any,
        measures: [
            'searchRequestedQueryCount',
            'searchArticlesClickedCount',
            'uniqueSearchArticlesClickedCount',
        ],
        dimensions: ['searchQuery'],
        order: [['searchRequestedQueryCount', 'desc']],
    }))

export const helpCenterSearchResultTermsQueryFactoryV2 = (
    ctx: HelpCenterContext,
) => helpCenterSearchResultTerms.build(ctx)

export const helpCenterSearchResultCount = helpCenterScope
    .defineMetricName(METRIC_NAMES.HELP_CENTER_SEARCH_RESULT_COUNT)
    .defineQuery(({ ctx, config }) => ({
        measures: ['uniqueSearchQueryCount'],
        filters: [
            ...createScopeFilters(ctx.filters, config),
            {
                member: 'helpCenterEventType',
                operator: LogicalOperatorEnum.ONE_OF,
                values: ['search.requested'],
            },
        ] as any,
    }))

export const helpCenterSearchResultCountQueryFactoryV2 = (
    ctx: HelpCenterContext,
) => helpCenterSearchResultCount.build(ctx)

export const helpCenterNoSearchResult = helpCenterScope
    .defineMetricName(METRIC_NAMES.HELP_CENTER_NO_SEARCH_RESULT)
    .defineQuery(({ ctx, config }) => ({
        measures: ['searchRequestedQueryCount'],
        dimensions: ['searchQuery'],
        order: [['searchRequestedQueryCount', 'desc']],
        filters: [
            ...createScopeFilters(ctx.filters, config),
            {
                member: 'helpCenterEventType',
                operator: LogicalOperatorEnum.ONE_OF,
                values: ['search.requested'],
            },
            {
                member: 'searchResultCount',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [0],
            },
        ] as any,
    }))

export const helpCenterNoSearchResultQueryFactoryV2 = (
    ctx: HelpCenterContext,
) => helpCenterNoSearchResult.build(ctx)

export const helpCenterUniqueSearchWithNoResult = helpCenterScope
    .defineMetricName(METRIC_NAMES.HELP_CENTER_UNIQUE_SEARCH_WITH_NO_RESULT)
    .defineQuery(({ ctx, config }) => ({
        measures: ['uniqueSearchQueryCount'],
        filters: [
            ...createScopeFilters(ctx.filters, config),
            {
                member: 'helpCenterEventType',
                operator: LogicalOperatorEnum.ONE_OF,
                values: ['search.requested'],
            },
            {
                member: 'searchResultCount',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [0],
            },
        ] as any,
    }))

export const helpCenterUniqueSearchWithNoResultQueryFactoryV2 = (
    ctx: HelpCenterContext,
) => helpCenterUniqueSearchWithNoResult.build(ctx)
