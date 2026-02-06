import moment from 'moment'

import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import {
    helpCenterArticleViewQueryFactoryV2,
    helpCenterArticleViewTimeSeriesQueryFactoryV2,
    helpCenterNoSearchResultQueryFactoryV2,
    helpCenterPerformancePerArticleCountQueryFactoryV2,
    helpCenterPerformancePerArticleQueryFactoryV2,
    helpCenterSearchRequestedQueryFactoryV2,
    helpCenterSearchResultCountQueryFactoryV2,
    helpCenterSearchResultRangeQueryFactoryV2,
    helpCenterSearchResultTermsQueryFactoryV2,
    helpCenterUniqueSearchWithNoResultQueryFactoryV2,
} from 'domains/reporting/models/scopes/helpCenter'
import type { AggregationWindow } from 'domains/reporting/models/stat/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'

describe('helpCenter scope', () => {
    const periodStart = formatReportingQueryDate(moment('2024-01-01'))
    const periodEnd = formatReportingQueryDate(moment('2024-01-31'))
    const timezone = 'America/New_York'

    const baseContext = {
        timezone,
        filters: {
            period: {
                start_datetime: periodStart,
                end_datetime: periodEnd,
            },
        },
    }

    const baseFilters = [
        {
            member: 'periodStart',
            operator: ReportingFilterOperator.AfterDate,
            values: [periodStart],
        },
        {
            member: 'periodEnd',
            operator: ReportingFilterOperator.BeforeDate,
            values: [periodEnd],
        },
    ]

    describe('helpCenterArticleView', () => {
        it('should create query with correct structure', () => {
            const query = helpCenterArticleViewQueryFactoryV2(baseContext)

            expect(query).toEqual({
                measures: ['articleViewCount'],
                filters: baseFilters,
                timezone,
                metricName: METRIC_NAMES.HELP_CENTER_ARTICLE_VIEW,
                scope: MetricScope.Helpcenter,
            })
        })

        it('should use context filters', () => {
            const contextWithFilters = {
                ...baseContext,
                filters: {
                    ...baseContext.filters,
                    helpCenters: {
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: [123, 456],
                    },
                },
            }

            const query =
                helpCenterArticleViewQueryFactoryV2(contextWithFilters)

            expect(query.filters).toContainEqual({
                member: 'helpCenterId',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [123, 456],
            })
        })
    })

    describe('helpCenterSearchRequested', () => {
        it('should create query with correct structure', () => {
            const query = helpCenterSearchRequestedQueryFactoryV2(baseContext)

            expect(query).toEqual({
                measures: ['searchRequestedCount'],
                filters: baseFilters,
                timezone,
                metricName: METRIC_NAMES.HELP_CENTER_SEARCH_REQUESTED,
                scope: MetricScope.Helpcenter,
            })
        })
    })

    describe('helpCenterArticleViewTimeSeries', () => {
        it('should create query with time dimensions', () => {
            const contextWithGranularity = {
                ...baseContext,
                granularity: 'day' as AggregationWindow,
            }

            const query = helpCenterArticleViewTimeSeriesQueryFactoryV2(
                contextWithGranularity,
            )

            expect(query).toEqual({
                measures: ['articleViewCount'],
                time_dimensions: [
                    {
                        dimension: 'timestamp',
                        granularity: 'day',
                    },
                ],
                order: [['timestamp', 'asc']],
                filters: baseFilters,
                timezone,
                metricName: METRIC_NAMES.HELP_CENTER_ARTICLE_VIEW_TIME_SERIES,
                scope: MetricScope.Helpcenter,
            })
        })

        it('should use different granularity from context', () => {
            const contextWithGranularity = {
                ...baseContext,
                granularity: 'hour' as AggregationWindow,
            }

            const query = helpCenterArticleViewTimeSeriesQueryFactoryV2(
                contextWithGranularity,
            )

            expect(query.time_dimensions).toEqual([
                {
                    dimension: 'timestamp',
                    granularity: 'hour',
                },
            ])
        })
    })

    describe('helpCenterPerformancePerArticle', () => {
        it('should create query with dimensions and filters', () => {
            const query =
                helpCenterPerformancePerArticleQueryFactoryV2(baseContext)

            expect(query).toEqual({
                measures: ['articleViewCount'],
                dimensions: [
                    'articleId',
                    'articleTitle',
                    'articleSlug',
                    'localeCodes',
                ],
                order: [['articleViewCount', 'desc']],
                filters: [
                    ...baseFilters,
                    {
                        member: 'helpCenterEventType',
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: ['page.viewed'],
                    },
                ],
                timezone,
                metricName: METRIC_NAMES.HELP_CENTER_PERFORMANCE_BY_ARTICLE,
                scope: MetricScope.Helpcenter,
            })
        })

        it('should include additional filters from context', () => {
            const contextWithFilters = {
                ...baseContext,
                filters: {
                    ...baseContext.filters,
                    localeCodes: {
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: ['en', 'fr'],
                    },
                },
            }

            const query =
                helpCenterPerformancePerArticleQueryFactoryV2(
                    contextWithFilters,
                )

            expect(query.filters).toContainEqual({
                member: 'localeCodes',
                operator: LogicalOperatorEnum.ONE_OF,
                values: ['en', 'fr'],
            })
            expect(query.filters).toContainEqual({
                member: 'helpCenterEventType',
                operator: LogicalOperatorEnum.ONE_OF,
                values: ['page.viewed'],
            })
        })
    })

    describe('helpCenterPerformancePerArticleCount', () => {
        it('should create query with article count measure', () => {
            const query =
                helpCenterPerformancePerArticleCountQueryFactoryV2(baseContext)

            expect(query).toEqual({
                measures: ['articleCount'],
                filters: [
                    ...baseFilters,
                    {
                        member: 'helpCenterEventType',
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: ['page.viewed'],
                    },
                ],
                timezone,
                metricName:
                    METRIC_NAMES.HELP_CENTER_PERFORMANCE_BY_ARTICLE_COUNT,
                scope: MetricScope.Helpcenter,
            })
        })
    })

    describe('helpCenterSearchResultRange', () => {
        it('should create query with search result range dimension', () => {
            const query = helpCenterSearchResultRangeQueryFactoryV2(baseContext)

            expect(query).toEqual({
                measures: ['searchRequestedCount'],
                dimensions: ['searchResultRange'],
                filters: baseFilters,
                timezone,
                metricName: METRIC_NAMES.HELP_CENTER_SEARCH_RESULT_RANGE,
                scope: MetricScope.Helpcenter,
            })
        })
    })

    describe('helpCenterSearchResultTerms', () => {
        it('should create query with search query dimension and filters', () => {
            const query = helpCenterSearchResultTermsQueryFactoryV2(baseContext)

            expect(query).toEqual({
                measures: [
                    'searchRequestedQueryCount',
                    'searchArticlesClickedCount',
                    'uniqueSearchArticlesClickedCount',
                ],
                dimensions: ['searchQuery'],
                order: [['searchRequestedQueryCount', 'desc']],
                filters: [
                    ...baseFilters,
                    {
                        member: 'isSearchRequestWithClick',
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: [true],
                    },
                ],
                timezone,
                metricName: METRIC_NAMES.HELP_CENTER_SEARCH_RESULT_TERMS,
                scope: MetricScope.Helpcenter,
            })
        })
    })

    describe('helpCenterSearchResultCount', () => {
        it('should create query with unique search query count', () => {
            const query = helpCenterSearchResultCountQueryFactoryV2(baseContext)

            expect(query).toEqual({
                measures: ['uniqueSearchQueryCount'],
                filters: [
                    ...baseFilters,
                    {
                        member: 'helpCenterEventType',
                        operator: LogicalOperatorEnum.ONE_OF,
                        values: ['search.requested'],
                    },
                ],
                timezone,
                metricName: METRIC_NAMES.HELP_CENTER_SEARCH_RESULT_COUNT,
                scope: MetricScope.Helpcenter,
            })
        })
    })

    describe('helpCenterNoSearchResult', () => {
        it('should create query with no result filters', () => {
            const query = helpCenterNoSearchResultQueryFactoryV2(baseContext)

            expect(query).toEqual({
                measures: ['searchRequestedQueryCount'],
                dimensions: ['searchQuery'],
                order: [['searchRequestedQueryCount', 'desc']],
                filters: [
                    ...baseFilters,
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
                ],
                timezone,
                metricName: METRIC_NAMES.HELP_CENTER_NO_SEARCH_RESULT,
                scope: MetricScope.Helpcenter,
            })
        })
    })

    describe('helpCenterUniqueSearchWithNoResult', () => {
        it('should create query with unique search query count and no result filters', () => {
            const query =
                helpCenterUniqueSearchWithNoResultQueryFactoryV2(baseContext)

            expect(query).toEqual({
                measures: ['uniqueSearchQueryCount'],
                filters: [
                    ...baseFilters,
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
                ],
                timezone,
                metricName:
                    METRIC_NAMES.HELP_CENTER_UNIQUE_SEARCH_WITH_NO_RESULT,
                scope: MetricScope.Helpcenter,
            })
        })
    })

    describe('context pagination and sorting', () => {
        it('should apply limit and offset from context', () => {
            const contextWithPagination = {
                ...baseContext,
                limit: 10,
                offset: 20,
            }

            const query = helpCenterArticleViewQueryFactoryV2(
                contextWithPagination,
            )

            expect(query.limit).toBe(10)
            expect(query.offset).toBe(20)
        })

        it('should apply total flag from context', () => {
            const contextWithTotal = {
                ...baseContext,
                total: true,
            }

            const query = helpCenterArticleViewQueryFactoryV2(contextWithTotal)

            expect(query.total).toBe(true)
        })
    })
})
