import React, {useState} from 'react'

import {useNewStatsFilters} from 'hooks/reporting/support-performance/useNewStatsFilters'
import {DashboardChartProps} from 'pages/stats/custom-reports/types'
import OverviewCard from 'pages/stats/help-center/components/OverviewCard/OverviewCard'
import {
    HelpCenterMetric,
    HelpCenterMetricConfig,
} from 'pages/stats/help-center/HelpCenterMetricsConfig'
import {useSearchRequestedTrend} from 'pages/stats/help-center/hooks/useSearchRequestedTrend'

export const SearchesTrendCard = ({chartId}: DashboardChartProps) => {
    const {cleanStatsFilters, userTimezone} = useNewStatsFilters()
    const searchesMetricTrend = useSearchRequestedTrend(
        cleanStatsFilters,
        userTimezone
    )

    // FIXME: revert it to true as soon as the documentation article links are ready
    const [isTipVisible] = useState(false)

    return (
        <OverviewCard
            chartId={chartId}
            showTip={isTipVisible}
            isLoading={searchesMetricTrend.isFetching}
            hintTitle={
                HelpCenterMetricConfig[HelpCenterMetric.SearchRequested].hint
                    .title
            }
            startDate={cleanStatsFilters.period.start_datetime}
            endDate={cleanStatsFilters.period.end_datetime}
            trendValue={searchesMetricTrend.data?.value}
            prevTrendValue={searchesMetricTrend.data?.prevValue}
            title={
                HelpCenterMetricConfig[HelpCenterMetric.SearchRequested].title
            }
            tipContent={
                <div data-testid="searches-tip">
                    <p>
                        You can reference the Searched Terms table to understand
                        the top queries in your Help Center to prioritize
                        refining the content of relevant articles or creating a
                        new one.
                    </p>
                    <a
                        href={
                            HelpCenterMetricConfig[
                                HelpCenterMetric.SearchRequested
                            ].hint.link
                        }
                        target="_blank"
                        rel="noreferrer"
                    >
                        <i className="material-icons">menu_book</i> How to
                        improve search relevancy
                    </a>
                </div>
            }
        />
    )
}
