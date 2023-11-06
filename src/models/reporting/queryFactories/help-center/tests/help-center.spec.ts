import moment from 'moment'
import {formatReportingQueryDate} from 'utils/reporting'
import {StatsFilters} from 'models/stat/types'
import {ReportingFilterOperator} from 'models/reporting/types'
import {
    HelpCenterTrackingEventDimensions,
    HelpCenterTrackingEventMeasures,
    HelpCenterTrackingEventMember,
} from 'models/reporting/cubes/HelpCenterTrackingEventCube'
import {searchResultRangeQueryFactory} from '../searchResult'

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
            'FirstResponseTimeWithAutomation',
            [HelpCenterTrackingEventMeasures.SearchRequestedCount],
            [HelpCenterTrackingEventDimensions.SearchResultRange],
            searchResultRangeQueryFactory,
        ],
    ])('%s', (_testName, measures, dimensions, getFactory) => {
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
            })
        })
    })
})
