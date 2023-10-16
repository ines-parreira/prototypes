import {HelpCenterTrackingEventMeasures} from 'models/reporting/cubes/HelpCenterTrackingEventCube'
import {
    getPreviousPeriod,
    HelpCenterStatsFiltersMembers,
    statsFiltersToReportingFilters,
} from 'utils/reporting'
import useMetricTrend from 'hooks/reporting/useMetricTrend'
import {StatsFilters} from 'models/stat/types'

const helpCenterTrendQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
    metric: HelpCenterTrackingEventMeasures
) => ({
    measures: [metric],
    dimensions: [],
    filters: statsFiltersToReportingFilters(
        HelpCenterStatsFiltersMembers,
        statsFilters
    ),
    timezone,
})

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
