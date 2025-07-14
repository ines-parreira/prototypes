import moment from 'moment/moment'

import { useArticleViewTimeSeries } from 'domains/reporting/hooks/help-center/useArticleViewTimeSeries'
import * as useTimeSeries from 'domains/reporting/hooks/useTimeSeries'
import { HelpCenterTrackingEventMeasures } from 'domains/reporting/models/cubes/HelpCenterTrackingEventCube'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'

jest.mock('domains/reporting/hooks/useTimeSeries')
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
