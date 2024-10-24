import useMetricTrend from 'hooks/reporting/useMetricTrend'
import {HelpCenterTrackingEventMeasures} from 'models/reporting/cubes/HelpCenterTrackingEventCube'
import {helpCenterTrendQueryFactory} from 'models/reporting/queryFactories/help-center/trend'
import {StatsFilters} from 'models/stat/types'
import {getPreviousPeriod} from 'utils/reporting'

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
