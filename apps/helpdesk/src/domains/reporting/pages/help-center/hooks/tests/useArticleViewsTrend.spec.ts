import moment from 'moment/moment'

import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import { HelpCenterTrackingEventMeasures } from 'domains/reporting/models/cubes/HelpCenterTrackingEventCube'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { useArticleViewsTrend } from 'domains/reporting/pages/help-center/hooks/useArticleViewsTrend'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'

jest.mock('domains/reporting/hooks/useMetricTrend', () => jest.fn())

const mockUseMetricTrend = jest.mocked(useMetricTrend)

describe('useArticleViewsTrend', () => {
    beforeEach(() => {
        mockUseMetricTrend.mockClear()

        jest.useFakeTimers()
        jest.setSystemTime(new Date('2023-11-13T00:00:00Z'))
    })

    it('should call metric trend hook with correct params', () => {
        const periodStart = formatReportingQueryDate(moment())
        const periodEnd = formatReportingQueryDate(moment().subtract(7, 'd'))
        const statsFilters: StatsFilters = {
            period: {
                start_datetime: periodStart,
                end_datetime: periodEnd,
            },
        }
        const timezone = 'UTC'

        useArticleViewsTrend(statsFilters, timezone)

        expect(mockUseMetricTrend).toHaveBeenCalledWith(
            {
                metricName: METRIC_NAMES.HELP_CENTER_ARTICLE_VIEW,
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
                measures: [HelpCenterTrackingEventMeasures.ArticleView],
                timezone: timezone,
            },
            {
                metricName: METRIC_NAMES.HELP_CENTER_ARTICLE_VIEW,
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
                measures: [HelpCenterTrackingEventMeasures.ArticleView],
                timezone: timezone,
            },
        )
    })
})
