import React, {useMemo, useState} from 'react'
import {AnalyticsFooter} from 'pages/stats/AnalyticsFooter'
import {HelpCenterTrackingEventMeasures} from 'models/reporting/cubes/HelpCenterTrackingEventCube'
import useAppSelector from 'hooks/useAppSelector'
import {getTimezone} from 'state/currentUser/selectors'
import {DEFAULT_TIMEZONE} from 'pages/stats/revenue/constants/components'
import StatsPage from 'pages/stats/StatsPage'
import DashboardSection from 'pages/stats/DashboardSection'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import TipsToggle from 'pages/stats/TipsToggle'
import {getHelpCenterDomain} from 'pages/settings/helpCenter/utils/helpCenter.utils'
import {useHelpCenterList} from 'pages/settings/helpCenter/hooks/useHelpCenterList'
import {HELP_CENTER_MAX_CREATION} from 'pages/settings/helpCenter/constants'
import {HelpCenter} from 'models/helpCenter/types'
import {NonEmptyArray} from 'types'
import {isNotEmptyArray} from 'utils'

import OverviewCard from '../components/OverviewCard/OverviewCard'
import {useHelpCenterTrend} from '../hooks/useHelpCenterTrend'
import ArticleViewsGraph from '../components/ArticleViewsGraph/ArticleViewsGraph'
import {PerformanceByArticle} from '../components/PerformanceByArticle/PerformanceByArticle'
import SearchResultDonut from '../components/SearchResultDonut/SearchResultDonut'
import SearchTermsTable from '../components/SearchTermsTable/SearchTermsTable'
import NoSearchTable from '../components/NoSearchTable/NoSearchTable'
import HelpCenterFilter from '../components/HelpCenterFilter/HelpCenterFilter'
import {useStatsFilters} from '../hooks/useStatsFilters'
import PeriodStatsFilter from '../../PeriodStatsFilter'
import HelpCenterStatsLoading from '../components/HelpCenterStatsLoading/HelpCenterStatsLoading'
import {StatsFilters} from '../../../../models/stat/types'
import {HelpCenterStatsFilters} from '../types'

const PAGE_TITLE_HELP_CENTER = 'Help Center'

const isHelpCenterStatsFiltersValid = (
    filters: StatsFilters
): filters is HelpCenterStatsFilters => Array.isArray(filters.helpCenters)

type HelpCenterStatsComponentProps = {
    helpCenters: NonEmptyArray<HelpCenter>
    statsFilters: HelpCenterStatsFilters
    setStatsFilters: (filter: Partial<StatsFilters>) => void
}

const HelpCenterStatsComponent = ({
    helpCenters,
    statsFilters,
    setStatsFilters,
}: HelpCenterStatsComponentProps) => {
    const timezone = useAppSelector(
        (state) => getTimezone(state) || DEFAULT_TIMEZONE
    )
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

    const selectedHelpCenter =
        helpCenters.find((helpCenter) =>
            statsFilters.helpCenters?.includes(helpCenter.id)
        ) ?? helpCenters[0]

    return (
        <div className="full-width">
            <StatsPage
                title={PAGE_TITLE_HELP_CENTER}
                filters={
                    <>
                        <PeriodStatsFilter
                            initialSettings={{
                                maxSpan: 365,
                            }}
                            value={statsFilters.period}
                            variant="ghost"
                        />
                    </>
                }
            >
                <DashboardSection title="" className="pb-0">
                    <HelpCenterFilter
                        selectedHelpCenter={selectedHelpCenter}
                        helpCenters={helpCenters}
                        setSelectedHelpCenter={setStatsFilters}
                    />
                </DashboardSection>
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
                            startDate={statsFilters.period.start_datetime}
                            endDate={statsFilters.period.end_datetime}
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
                            startDate={statsFilters.period.start_datetime}
                            endDate={statsFilters.period.end_datetime}
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
                            helpCenterDomain={getHelpCenterDomain(
                                selectedHelpCenter
                            )}
                            helpCenterId={selectedHelpCenter.id}
                        />
                    </DashboardGridCell>
                </DashboardSection>
                <DashboardSection title="Help Center searches">
                    <DashboardGridCell size={6}>
                        <SearchResultDonut
                            statsFilters={statsFilters}
                            timezone={timezone}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={8}>
                        <SearchTermsTable
                            statsFilters={statsFilters}
                            timezone={timezone}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={4}>
                        <NoSearchTable
                            statsFilters={statsFilters}
                            timezone={timezone}
                        />
                    </DashboardGridCell>
                </DashboardSection>
                <AnalyticsFooter />
            </StatsPage>
        </div>
    )
}

const HelpCenterStats = () => {
    const {helpCenters, isLoading} = useHelpCenterList({
        per_page: HELP_CENTER_MAX_CREATION,
    })
    const statsFiltersInitState = useMemo(
        () => ({
            helpCenters: helpCenters[0] ? [helpCenters[0].id] : [],
        }),
        [helpCenters]
    )
    const [statsFilters, setStatsFilters] = useStatsFilters(
        statsFiltersInitState
    )

    if (isLoading || !isHelpCenterStatsFiltersValid(statsFilters)) {
        return <HelpCenterStatsLoading title={PAGE_TITLE_HELP_CENTER} />
    }

    return isNotEmptyArray(helpCenters) ? (
        <HelpCenterStatsComponent
            helpCenters={helpCenters}
            statsFilters={statsFilters}
            setStatsFilters={setStatsFilters}
        />
    ) : (
        <div>TODO: Implement empty state</div>
    )
}

export default HelpCenterStats
