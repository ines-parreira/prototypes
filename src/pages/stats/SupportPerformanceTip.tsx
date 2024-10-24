import React from 'react'

import {MetricTrendHook} from 'hooks/reporting/useMetricTrend'
import {usePerformanceTips} from 'hooks/reporting/usePerformanceTips'
import useAppSelector from 'hooks/useAppSelector'
import PerformanceTip from 'pages/stats/PerformanceTip'

import {MetricName} from 'services/reporting/constants'
import {
    getCleanStatsFiltersWithLogicalOperatorsWithTimezone,
    getCleanStatsFiltersWithTimezone,
} from 'state/ui/stats/selectors'
import {sanitizeHtmlDefault} from 'utils/html'

export const SupportPerformanceTip = ({
    metric,
    useTrend,
    isAnalyticsNewFilters = false,
}: {
    metric: MetricName
    useTrend: MetricTrendHook
    isAnalyticsNewFilters?: boolean
}) => {
    const {cleanStatsFilters: legacyStatsFilters} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )
    const {cleanStatsFilters: statsFiltersWithLogicalOperators, userTimezone} =
        useAppSelector(getCleanStatsFiltersWithLogicalOperatorsWithTimezone)

    const cleanStatsFilters = isAnalyticsNewFilters
        ? statsFiltersWithLogicalOperators
        : legacyStatsFilters

    const trend = useTrend(cleanStatsFilters, userTimezone)
    const tip = usePerformanceTips(metric, trend?.data?.value || null)

    return (
        <PerformanceTip
            avgMerchant={tip?.average ?? null}
            avgTooltip="The average and top 10% are computed based on the <a href='https://docs.gorgias.com/en-US/cx-performance-tips-238743'>data of Gorgias customers on the same plan</a>. It does not take into account your industry or channel."
            topTen={tip?.topTen ?? null}
            type={tip?.type}
        >
            <div
                className="body-regular"
                dangerouslySetInnerHTML={{
                    __html: sanitizeHtmlDefault(tip?.content ?? ''),
                }}
            />
        </PerformanceTip>
    )
}
