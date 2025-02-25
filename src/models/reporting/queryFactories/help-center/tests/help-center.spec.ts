import moment from 'moment'

import { OrderDirection } from 'models/api/types'
import {
    HelpCenterTrackingEventDimensions,
    HelpCenterTrackingEventMeasures,
    HelpCenterTrackingEventMember,
    HelpCenterTrackingEventSegment,
} from 'models/reporting/cubes/HelpCenterTrackingEventCube'
import { ReportingFilterOperator } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import { formatReportingQueryDate } from 'utils/reporting'

import {
    noSearchResultsCountQueryFactory,
    noSearchResultsQueryFactory,
    searchResultQueryCountFactory,
    searchResultRangeQueryFactory,
    searchResultTermsQueryFactory,
} from '../searchResult'

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
        ],
        [
            'searchResultQueryCountFactory',
            [HelpCenterTrackingEventMeasures.UniqueSearchQueryCount],
            [],
            undefined,
            [HelpCenterTrackingEventSegment.SearchRequestedOnly],
            searchResultQueryCountFactory,
        ],
        [
            'noSearchResultsCountQueryFactory',
            [HelpCenterTrackingEventMeasures.UniqueSearchQueryCount],
            [],
            undefined,
            [HelpCenterTrackingEventSegment.NoSearchResultOnly],
            noSearchResultsCountQueryFactory,
        ],
    ])('%s', (_testName, measures, dimensions, order, segments, getFactory) => {
        it('should create a query', () => {
            const query = getFactory(statsFilters, timezone)

            expect(query).toEqual({
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
    })
})
