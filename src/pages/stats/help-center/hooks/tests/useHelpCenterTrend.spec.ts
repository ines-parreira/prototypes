import moment from 'moment/moment'
import {LegacyStatsFilters} from 'models/stat/types'
import useMetricTrend from 'hooks/reporting/useMetricTrend'
import {HelpCenterTrackingEventMeasures} from 'models/reporting/cubes/HelpCenterTrackingEventCube'
import {formatReportingQueryDate} from 'utils/reporting'
import {useHelpCenterTrend} from 'pages/stats/help-center/hooks/useHelpCenterTrend'

jest.mock('hooks/reporting/useMetricTrend', () => jest.fn())

const mockUseMetricTrend = jest.mocked(useMetricTrend)

describe('useHelpCenterTrend', () => {
    beforeEach(() => {
        mockUseMetricTrend.mockClear()

        const mockedDate = new Date(2023, 10, 13)

        jest.useFakeTimers()
        jest.setSystemTime(mockedDate)
    })
    it('should call metric trend hook with correct params', () => {
        const periodStart = formatReportingQueryDate(moment())
        const periodEnd = formatReportingQueryDate(moment().subtract(7, 'd'))
        const statsFilters: LegacyStatsFilters = {
            period: {
                start_datetime: periodStart,
                end_datetime: periodEnd,
            },
        }
        const timezone = 'UTC'

        useHelpCenterTrend({
            statsFilters,
            timezone,
            metric: HelpCenterTrackingEventMeasures.SearchRequestedCount,
        })

        expect(mockUseMetricTrend).toHaveBeenCalledWith(
            {
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
                measures: [
                    HelpCenterTrackingEventMeasures.SearchRequestedCount,
                ],
                timezone: timezone,
            },
            {
                dimensions: [],
                filters: [
                    {
                        member: 'HelpCenterTrackingEvent.periodStart',
                        operator: 'afterDate',
                        values: ['2023-11-19T23:59:59.000'],
                    },
                    {
                        member: 'HelpCenterTrackingEvent.periodEnd',
                        operator: 'beforeDate',
                        values: ['2023-11-12T23:59:59.000'],
                    },
                ],
                measures: [
                    HelpCenterTrackingEventMeasures.SearchRequestedCount,
                ],
                timezone: timezone,
            }
        )
    })
})
