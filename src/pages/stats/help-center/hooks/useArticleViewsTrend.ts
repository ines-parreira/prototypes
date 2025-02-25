import useMetricTrend from 'hooks/reporting/useMetricTrend'
import { articleViewQueryFactory } from 'models/reporting/queryFactories/help-center/articleView'
import { StatsFilters } from 'models/stat/types'
import { getPreviousPeriod } from 'utils/reporting'

export const useArticleViewsTrend = (
    statsFilters: StatsFilters,
    timezone: string,
) =>
    useMetricTrend(
        articleViewQueryFactory(statsFilters, timezone),
        articleViewQueryFactory(
            {
                ...statsFilters,
                period: { ...getPreviousPeriod(statsFilters.period) },
            },
            timezone,
        ),
    )
