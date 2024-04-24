import React from 'react'
import {sanitizeHtmlDefault} from 'utils/html'
import useAppSelector from 'hooks/useAppSelector'
import {usePerformanceTips} from 'hooks/reporting/usePerformanceTips'
import {MetricTrendHook} from 'hooks/reporting/useMetricTrend'
import PerformanceTip from 'pages/stats/PerformanceTip'

import {MetricName} from 'services/reporting/constants'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/selectors'

export const SupportPerformanceTip = ({
    metric,
    useTrend,
}: {
    metric: MetricName
    useTrend: MetricTrendHook
}) => {
    const {cleanStatsFilters, userTimezone} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )
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
