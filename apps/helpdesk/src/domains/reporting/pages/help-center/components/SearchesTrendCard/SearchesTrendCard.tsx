import React, { useState } from 'react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import OverviewCard from 'domains/reporting/pages/help-center/components/OverviewCard/OverviewCard'
import {
    HelpCenterMetric,
    HelpCenterMetricConfig,
} from 'domains/reporting/pages/help-center/HelpCenterMetricsConfig'
import { useSearchRequestedTrend } from 'domains/reporting/pages/help-center/hooks/useSearchRequestedTrend'

export const SearchesTrendCard = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()
    const searchesMetricTrend = useSearchRequestedTrend(
        cleanStatsFilters,
        userTimezone,
    )

    // FIXME: revert it to true as soon as the documentation article links are ready
    const [isTipVisible] = useState(false)

    return (
        <OverviewCard
            chartId={chartId}
            dashboard={dashboard}
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
