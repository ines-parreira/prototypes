import moment from 'moment'

import {ReportingQuery} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import useMetricTrend, {MetricTrend} from './useMetricTrend'

const getPreviousPeriod = (
    period: StatsFilters['period']
): StatsFilters['period'] => {
    const start = moment(period.start_datetime).parseZone()
    const end = moment(period.end_datetime).parseZone()
    const diff = moment.duration(end.diff(start) + 1)
    return {
        start_datetime: start.subtract(diff).format(),
        end_datetime: end.subtract(diff).format(),
    }
}

export default function createUseMetricTrend(
    queryFactory: (filters: StatsFilters) => ReportingQuery
) {
    return (statsFilters: StatsFilters): MetricTrend => {
        const currentPeriodQuery = queryFactory(statsFilters)
        const prevPeriodQuery = queryFactory({
            ...statsFilters,
            period: getPreviousPeriod(statsFilters.period),
        })
        return useMetricTrend(currentPeriodQuery, prevPeriodQuery)
    }
}
