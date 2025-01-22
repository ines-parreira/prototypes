import React, {useState} from 'react'

import {useNewStatsFilters} from 'hooks/reporting/support-performance/useNewStatsFilters'
import {DashboardChartProps} from 'pages/stats/custom-reports/types'
import OverviewCard from 'pages/stats/help-center/components/OverviewCard/OverviewCard'
import {
    HelpCenterMetric,
    HelpCenterMetricConfig,
} from 'pages/stats/help-center/HelpCenterMetricsConfig'
import {useArticleViewsTrend} from 'pages/stats/help-center/hooks/useArticleViewsTrend'

export const ArticleViewsTrendCard = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    // FIXME: revert it to true as soon as the documentation article links are ready
    const [isTipVisible] = useState(false)

    const {cleanStatsFilters, userTimezone} = useNewStatsFilters()

    const articleViewMetricTrend = useArticleViewsTrend(
        cleanStatsFilters,
        userTimezone
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
