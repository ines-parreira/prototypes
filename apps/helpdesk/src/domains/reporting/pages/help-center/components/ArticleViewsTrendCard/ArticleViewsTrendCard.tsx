import React, { useState } from 'react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import OverviewCard from 'domains/reporting/pages/help-center/components/OverviewCard/OverviewCard'
import {
    HelpCenterMetric,
    HelpCenterMetricConfig,
} from 'domains/reporting/pages/help-center/HelpCenterMetricsConfig'
import { useArticleViewsTrend } from 'domains/reporting/pages/help-center/hooks/useArticleViewsTrend'

export const ArticleViewsTrendCard = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    // FIXME: revert it to true as soon as the documentation article links are ready
    const [isTipVisible] = useState(false)

    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    const articleViewMetricTrend = useArticleViewsTrend(
        cleanStatsFilters,
        userTimezone,
    )

    return (
        <OverviewCard
            chartId={chartId}
            dashboard={dashboard}
            showTip={isTipVisible}
            isLoading={articleViewMetricTrend.isFetching}
            hintTitle={
                HelpCenterMetricConfig[HelpCenterMetric.ArticleViews].hint.title
            }
            startDate={cleanStatsFilters.period.start_datetime}
            endDate={cleanStatsFilters.period.end_datetime}
            trendValue={articleViewMetricTrend.data?.value}
            prevTrendValue={articleViewMetricTrend.data?.prevValue}
            title={HelpCenterMetricConfig[HelpCenterMetric.ArticleViews].title}
            tipContent={
                <div data-testid="article-tip">
                    Check out our{' '}
                    <a
                        href={
                            HelpCenterMetricConfig[
                                HelpCenterMetric.ArticleViews
                            ].hint.link
                        }
                        target="_blank"
                        rel="noreferrer"
                    >
                        Help Docs
                    </a>{' '}
                    to learn about strategies you can use to increase article
                    views for your Help Center.
                </div>
            }
        />
    )
}
