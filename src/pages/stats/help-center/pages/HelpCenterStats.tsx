import React, {useState} from 'react'
import {AnalyticsFooter} from 'pages/stats/AnalyticsFooter'
import useAppSelector from '../../../../hooks/useAppSelector'
import {getTimezone} from '../../../../state/currentUser/selectors'
import {HelpCenterTrackingEventMeasures} from '../../../../models/reporting/cubes/HelpCenterTrackingEventCube'
import {DEFAULT_TIMEZONE} from '../../revenue/constants/components'
import StatsPage from '../../StatsPage'
import DashboardSection from '../../DashboardSection'
import OverviewCard from '../components/OverviewCard/OverviewCard'
import DashboardGridCell from '../../DashboardGridCell'
import {useHelpCenterTrend} from '../hooks/useHelpCenterTrend'
import TipsToggle from '../../TipsToggle'

import ArticleViewsGraph from '../components/ArticleViewsGraph/ArticleViewsGraph'
import {PerformanceByArticle} from '../components/PerformanceByArticle/PerformanceByArticle'

const PAGE_TITLE_HELP_CENTER = 'Help Center'

// This is temp data before we implement filters
const START_DATE = new Date().toString()
const END_DATE = new Date('01/08/2023').toString()
const HELP_CENTER_DOMAIN = 'acme'
const HELP_CENTER_ID = 1

const HelpCenterStats = () => {
    const timezone = useAppSelector(
        (state) => getTimezone(state) || DEFAULT_TIMEZONE
    )
    const statsFilters = {
        period: {
            end_datetime: START_DATE,
            start_datetime: END_DATE,
        },
    }
    const articleViewMetricTrend = useHelpCenterTrend({
        statsFilters,
        timezone,
        metric: HelpCenterTrackingEventMeasures.ArticleView,
    })
    const searchesMetricTrend = useHelpCenterTrend({
        statsFilters,
        timezone,
        metric: HelpCenterTrackingEventMeasures.SearchRequestedCount,
    })
    const [isTipVisible, setIsTipsVisible] = useState(true)

    const onTipsToggleClick = () => {
        setIsTipsVisible(!isTipVisible)
    }

    return (
        <div className="full-width">
            <StatsPage title={PAGE_TITLE_HELP_CENTER} filters={<div></div>}>
                <DashboardSection
                    title="Overview"
                    titleExtra={
                        <TipsToggle
                            isVisible={isTipVisible}
                            onClick={onTipsToggleClick}
                        />
                    }
                >
                    <DashboardGridCell size={6}>
                        <OverviewCard
                            showTip={isTipVisible}
                            isLoading={articleViewMetricTrend.isFetching}
                            hintTitle="Total number of article views, including duplicate views by the same user"
                            startDate={START_DATE}
                            endDate={END_DATE}
                            trendValue={articleViewMetricTrend.data?.value}
                            prevTrendValue={
                                articleViewMetricTrend.data?.prevValue
                            }
                            title="Article views"
                            tipContent={
                                <div data-testid="article-tip">
                                    Check out our{' '}
                                    <a
                                        href="https://docs.gorgias.com/en-US"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Help Docs
                                    </a>{' '}
                                    to learn about strategies you can use to
                                    increase article views for your Help Center.
                                </div>
                            }
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={6}>
                        <OverviewCard
                            showTip={isTipVisible}
                            isLoading={searchesMetricTrend.isFetching}
                            hintTitle="Total number of searches performed in the Help Center"
                            startDate={START_DATE}
                            endDate={END_DATE}
                            trendValue={searchesMetricTrend.data?.value}
                            prevTrendValue={searchesMetricTrend.data?.prevValue}
                            title="Searches"
                            tipContent={
                                <div data-testid="searches-tip">
                                    <p>
                                        You can reference the Searched Terms
                                        table to understand the top queries in
                                        your Help Center to prioritize refining
                                        the content of relevant articles or
                                        creating a new one.
                                    </p>
                                    <a
                                        href="https://docs.gorgias.com/en-US"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <i className="material-icons">
                                            menu_book
                                        </i>{' '}
                                        How to improve search relevancy
                                    </a>
                                </div>
                            }
                        />
                    </DashboardGridCell>
                </DashboardSection>
                <DashboardSection title="Performance">
                    <DashboardGridCell size={12}>
                        <ArticleViewsGraph
                            statsFilters={statsFilters}
                            timezone={timezone}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={12}>
                        <PerformanceByArticle
                            statsFilters={statsFilters}
                            timezone={timezone}
                            helpCenterDomain={HELP_CENTER_DOMAIN}
                            helpCenterId={HELP_CENTER_ID}
                        />
                    </DashboardGridCell>
                </DashboardSection>
                <DashboardSection title="Help Center searches">
                    Content
                </DashboardSection>

                <AnalyticsFooter />
            </StatsPage>
        </div>
    )
}

export default HelpCenterStats
