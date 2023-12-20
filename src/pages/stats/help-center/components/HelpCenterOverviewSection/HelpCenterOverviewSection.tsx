import React, {useState} from 'react'
import {StatsFilters} from 'models/stat/types'
import {HelpCenterTrackingEventMeasures} from 'models/reporting/cubes/HelpCenterTrackingEventCube'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import DashboardSection from 'pages/stats/DashboardSection'
// import TipsToggle from 'pages/stats/TipsToggle'
import {useHelpCenterTrend} from '../../hooks/useHelpCenterTrend'
import OverviewCard from '../OverviewCard/OverviewCard'

type HelpCenterOverviewSectionProps = {
    statsFilters: StatsFilters
    timezone: string
}

const HelpCenterOverviewSection = ({
    statsFilters,
    timezone,
}: HelpCenterOverviewSectionProps) => {
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
    // FIXME: revert it to true as soon as the documentation article links are ready
    const [isTipVisible] = useState(false)

    // FIXME: uncomment it as soon as the documentation article links are ready
    // const onTipsToggleClick = () => {
    //     setIsTipsVisible(!isTipVisible)
    // }

    return (
        <DashboardSection
            title="Overview"
            titleExtra={
                null
                // FIXME: uncomment it as soon as the documentation article links are ready
                // <TipsToggle
                //     isVisible={isTipVisible}
                //     onClick={onTipsToggleClick}
                // />
            }
        >
            <DashboardGridCell size={6}>
                <OverviewCard
                    showTip={isTipVisible}
                    isLoading={articleViewMetricTrend.isFetching}
                    hintTitle="Total number of article views, including duplicate views by the same user"
                    startDate={statsFilters.period.start_datetime}
                    endDate={statsFilters.period.end_datetime}
                    trendValue={articleViewMetricTrend.data?.value}
                    prevTrendValue={articleViewMetricTrend.data?.prevValue}
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
                            to learn about strategies you can use to increase
                            article views for your Help Center.
                        </div>
                    }
                />
            </DashboardGridCell>
            <DashboardGridCell size={6}>
                <OverviewCard
                    showTip={isTipVisible}
                    isLoading={searchesMetricTrend.isFetching}
                    hintTitle="Total number of searches performed in the Help Center"
                    startDate={statsFilters.period.start_datetime}
                    endDate={statsFilters.period.end_datetime}
                    trendValue={searchesMetricTrend.data?.value}
                    prevTrendValue={searchesMetricTrend.data?.prevValue}
                    title="Searches"
                    tipContent={
                        <div data-testid="searches-tip">
                            <p>
                                You can reference the Searched Terms table to
                                understand the top queries in your Help Center
                                to prioritize refining the content of relevant
                                articles or creating a new one.
                            </p>
                            <a
                                href="https://docs.gorgias.com/en-US"
                                target="_blank"
                                rel="noreferrer"
                            >
                                <i className="material-icons">menu_book</i> How
                                to improve search relevancy
                            </a>
                        </div>
                    }
                />
            </DashboardGridCell>
        </DashboardSection>
    )
}

export default HelpCenterOverviewSection
