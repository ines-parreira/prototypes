import moment from 'moment/moment'

import { useArticleViewTimeSeries } from 'hooks/reporting/help-center/useArticleViewTimeSeries'
import * as useTimeSeries from 'hooks/reporting/useTimeSeries'
import { HelpCenterTrackingEventMeasures } from 'models/reporting/cubes/HelpCenterTrackingEventCube'
import { ReportingGranularity } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import { formatReportingQueryDate } from 'utils/reporting'

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
        const statsFilters: StatsFilters = {
            period: {
                start_datetime: periodStart,
                end_datetime: periodEnd,
            },
        }
        const timezone = 'UTC'

        useArticleViewTimeSeries(
            statsFilters,
            timezone,
            ReportingGranularity.Day,
        )

        expect(mockUseTimeSeries).toHaveBeenCalledWith({
            dimensions: [],
            filters: [
                {
                    member: 'HelpCenterTrackingEvent.periodStart',
                    operator: 'afterDate',
                    values: [periodStart],
                },
                {
                    member: 'HelpCenterTrackingEvent.periodEnd',
                    operator: 'beforeDate',
                    values: [periodEnd],
                },
            ],
            order: [['HelpCenterTrackingEvent.timestamp', 'asc']],
            timeDimensions: [
                {
                    dateRange: [periodStart, periodEnd],
                    dimension: 'HelpCenterTrackingEvent.timestamp',
                    granularity: 'day',
                },
            ],

            measures: [HelpCenterTrackingEventMeasures.ArticleView],
            timezone: timezone,
        })
    })
})
