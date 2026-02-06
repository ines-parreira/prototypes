import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import { articleViewQueryFactory } from 'domains/reporting/models/queryFactories/help-center/articleView'
import { helpCenterArticleViewQueryFactoryV2 } from 'domains/reporting/models/scopes/helpCenter'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

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
        helpCenterArticleViewQueryFactoryV2({
            filters: statsFilters,
            timezone,
        }),
        helpCenterArticleViewQueryFactoryV2({
            filters: {
                ...statsFilters,
                period: getPreviousPeriod(statsFilters.period),
            },
            timezone,
        }),
    )
