import useMetricTrend from 'hooks/reporting/useMetricTrend'
import {languageProficiencyQueryFactory} from 'models/reporting/queryFactories/auto-qa/languageProficiencyQueryFactory'
import {StatsFilters} from 'models/stat/types'
import {getPreviousPeriod} from 'utils/reporting'

export const useLanguageProficiencyTrend = (
    filters: StatsFilters,
    timezone: string
) =>
    useMetricTrend(
        languageProficiencyQueryFactory(filters, timezone),
        languageProficiencyQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone
        )
    )
