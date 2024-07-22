import moment from 'moment/moment'
import {LegacyStatsFilters} from 'models/stat/types'
import * as useTimeSeries from 'hooks/reporting/useTimeSeries'
import {HelpCenterTrackingEventMeasures} from 'models/reporting/cubes/HelpCenterTrackingEventCube'
import {formatReportingQueryDate} from 'utils/reporting'
import {ReportingGranularity} from 'models/reporting/types'
import {useArticleViewTimeSeries} from 'pages/stats/help-center/hooks/useArticleViewTimeSeries'

jest.mock('hooks/reporting/useTimeSeries')
const mockUseTimeSeries = jest.spyOn(useTimeSeries, 'useTimeSeries')

describe('useArticleViewTimeSeries', () => {
    beforeEach(() => {
        const mockedDate = new Date(2023, 10, 13)

        jest.useFakeTimers()
        jest.setSystemTime(mockedDate)
    })

    it('should call useTimeSeries hook with correct params', () => {
        const periodStart = formatReportingQueryDate(moment())
        const periodEnd = formatReportingQueryDate(moment().subtract(7, 'd'))
        const statsFilters: LegacyStatsFilters = {
            period: {
                start_datetime: periodStart,
                end_datetime: periodEnd,
            },
        }
        const timezone = 'UTC'

        useArticleViewTimeSeries(
            statsFilters,
            timezone,
            ReportingGranularity.Day
        )

        expect(mockUseTimeSeries).toHaveBeenCalledWith({
            dimensions: [],
            filters: [
                {
                    member: 'HelpCenterTrackingEvent.periodStart',
                    operator: 'afterDate',
                    values: ['2023-11-13T00:00:00.000'],
                },
                {
                    member: 'HelpCenterTrackingEvent.periodEnd',
                    operator: 'beforeDate',
                    values: ['2023-11-06T00:00:00.000'],
                },
            ],
            order: [['HelpCenterTrackingEvent.timestamp', 'asc']],
            timeDimensions: [
                {
                    dateRange: [
                        '2023-11-13T00:00:00.000',
                        '2023-11-06T00:00:00.000',
                    ],
                    dimension: 'HelpCenterTrackingEvent.timestamp',
                    granularity: 'day',
                },
            ],

            measures: [HelpCenterTrackingEventMeasures.ArticleView],
            timezone: timezone,
        })
    })
})
