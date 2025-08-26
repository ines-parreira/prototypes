import moment from 'moment'

import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    HelpCenterTrackingEventDimensions,
    HelpCenterTrackingEventMeasures,
    HelpCenterTrackingEventMember,
    HelpCenterTrackingEventSegment,
} from 'domains/reporting/models/cubes/HelpCenterTrackingEventCube'
import {
    noSearchResultsCountQueryFactory,
    noSearchResultsQueryFactory,
    searchResultQueryCountFactory,
    searchResultRangeQueryFactory,
    searchResultTermsQueryFactory,
} from 'domains/reporting/models/queryFactories/help-center/searchResult'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

describe('help center queries factories', () => {
    const periodStart = formatReportingQueryDate(moment())
    const periodEnd = formatReportingQueryDate(moment())
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd,
            start_datetime: periodStart,
        },
    }
    const timezone = 'someTimeZone'

    describe.each([
        [
            'searchResultRangeQueryFactory',
            [HelpCenterTrackingEventMeasures.SearchRequestedCount],
            [HelpCenterTrackingEventDimensions.SearchResultRange],
            undefined,
            undefined,
            searchResultRangeQueryFactory,
            METRIC_NAMES.HELP_CENTER_SEARCH_RESULT_RANGE,
        ],
        [
            'searchResultTermsQueryFactory',
            [
                HelpCenterTrackingEventMeasures.SearchRequestedQueryCount,
                HelpCenterTrackingEventMeasures.SearchArticlesClickedCount,
                HelpCenterTrackingEventMeasures.SearchArticlesClickedCountUnique,
            ],
            [HelpCenterTrackingEventDimensions.SearchQuery],
            [
                [
                    HelpCenterTrackingEventMeasures.SearchRequestedQueryCount,
                    OrderDirection.Desc,
                ],
            ],
            [HelpCenterTrackingEventSegment.SearchRequestWithClicks],
            searchResultTermsQueryFactory,
            METRIC_NAMES.HELP_CENTER_SEARCH_RESULT_TERMS,
        ],
        [
            'noSearchResultsQueryFactory',
            [HelpCenterTrackingEventMeasures.SearchRequestedQueryCount],
            [HelpCenterTrackingEventDimensions.SearchQuery],
            [
                [
                    HelpCenterTrackingEventMeasures.SearchRequestedQueryCount,
                    OrderDirection.Desc,
                ],
            ],
            [HelpCenterTrackingEventSegment.NoSearchResultOnly],
            noSearchResultsQueryFactory,
            METRIC_NAMES.HELP_CENTER_NO_SEARCH_RESULT,
        ],
        [
            'searchResultQueryCountFactory',
            [HelpCenterTrackingEventMeasures.UniqueSearchQueryCount],
            [],
            undefined,
            [HelpCenterTrackingEventSegment.SearchRequestedOnly],
            searchResultQueryCountFactory,
            METRIC_NAMES.HELP_CENTER_SEARCH_RESULT_COUNT,
        ],
        [
            'noSearchResultsCountQueryFactory',
            [HelpCenterTrackingEventMeasures.UniqueSearchQueryCount],
            [],
            undefined,
            [HelpCenterTrackingEventSegment.NoSearchResultOnly],
            noSearchResultsCountQueryFactory,
            METRIC_NAMES.HELP_CENTER_UNIQUE_SEARCH_WITH_NO_RESULT,
        ],
    ])(
        '%s',
        (
            _testName,
            measures,
            dimensions,
            order,
            segments,
            getFactory,
            expectedMetricName,
        ) => {
            it('should create a query', () => {
                const query = getFactory(statsFilters, timezone)

                expect(query).toEqual({
                    metricName: expectedMetricName,
                    measures,
                    dimensions,
                    filters: [
                        {
                            member: HelpCenterTrackingEventMember.PeriodStart,
                            operator: ReportingFilterOperator.AfterDate,
                            values: [periodStart],
                        },
                        {
                            member: HelpCenterTrackingEventMember.PeriodEnd,
                            operator: ReportingFilterOperator.BeforeDate,
                            values: [periodEnd],
                        },
                    ],
                    timezone,
                    order,
                    segments,
                })
            })
        },
    )
})
