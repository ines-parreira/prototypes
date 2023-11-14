import {HelpCenterTrackingEventMeasures} from 'models/reporting/cubes/HelpCenterTrackingEventCube'
import {getPreviousPeriod} from 'utils/reporting'
import useMetricTrend from 'hooks/reporting/useMetricTrend'
import {StatsFilters} from 'models/stat/types'
import {helpCenterTrendQueryFactory} from 'models/reporting/queryFactories/help-center/trend'

export const useHelpCenterTrend = ({
    statsFilters,
    timezone,
    metric,
}: {
    statsFilters: StatsFilters
    timezone: string
    metric: HelpCenterTrackingEventMeasures
}) =>
    useMetricTrend(
        helpCenterTrendQueryFactory(statsFilters, timezone, metric),
        helpCenterTrendQueryFactory(
            {
                ...statsFilters,
                period: {...getPreviousPeriod(statsFilters.period)},
            },
            timezone,
            metric
        )
    )
