import React, {useMemo} from 'react'
import {AnalyticsFooter} from 'pages/stats/AnalyticsFooter'
import useAppSelector from 'hooks/useAppSelector'
import {getTimezone} from 'state/currentUser/selectors'
import {DEFAULT_TIMEZONE} from 'pages/stats/revenue/constants/components'
import StatsPage from 'pages/stats/StatsPage'
import DashboardSection from 'pages/stats/DashboardSection'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import {getHelpCenterDomain} from 'pages/settings/helpCenter/utils/helpCenter.utils'
import {useHelpCenterList} from 'pages/settings/helpCenter/hooks/useHelpCenterList'
import {HELP_CENTER_MAX_CREATION} from 'pages/settings/helpCenter/constants'
import {HelpCenter} from 'models/helpCenter/types'
import {NonEmptyArray} from 'types'
import {isNotEmptyArray} from 'utils'
import {StatsFilters} from 'models/stat/types'

import ArticleViewsGraph from '../components/ArticleViewsGraph/ArticleViewsGraph'
import {PerformanceByArticle} from '../components/PerformanceByArticle/PerformanceByArticle'
import SearchResultDonut from '../components/SearchResultDonut/SearchResultDonut'
import SearchTermsTable from '../components/SearchTermsTable/SearchTermsTable'
import NoSearchTable from '../components/NoSearchTable/NoSearchTable'
import HelpCenterFilter from '../components/HelpCenterFilter/HelpCenterFilter'
import {useStatsFilters} from '../hooks/useStatsFilters'
import PeriodStatsFilter from '../../PeriodStatsFilter'
import HelpCenterStatsLoading from '../components/HelpCenterStatsLoading/HelpCenterStatsLoading'
import {HelpCenterStatsFilters} from '../types'
import HelpCenterOverviewSection from '../components/HelpCenterOverviewSection/HelpCenterOverviewSection'
import UnpublishedHelpCenterAlert from '../components/UnpublishedHelpCenterAlert/UnpublishedHelpCenterAlert'
import {HelpCenterStatsEmptyState} from '../components/HelpCenterStatsEmptyState/HelpCenterStatsEmptyState'

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
                    {selectedHelpCenter.deactivated_datetime !== null && (
                        <DashboardGridCell>
                            <UnpublishedHelpCenterAlert
                                helpCenterId={selectedHelpCenter.id}
                            />
                        </DashboardGridCell>
                    )}
                    <DashboardGridCell>
                        <HelpCenterFilter
                            selectedHelpCenter={selectedHelpCenter}
                            helpCenters={helpCenters}
                            setSelectedHelpCenter={setStatsFilters}
                        />
                    </DashboardGridCell>
                </DashboardSection>

                <HelpCenterOverviewSection
                    statsFilters={statsFilters}
                    timezone={timezone}
                />

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

    const activeHelpCenters = useMemo(
        () =>
            helpCenters.filter(
                (helpCenter) => helpCenter.deactivated_datetime === null
            ),
        [helpCenters]
    )

    if (isLoading || !isHelpCenterStatsFiltersValid(statsFilters)) {
        return <HelpCenterStatsLoading title={PAGE_TITLE_HELP_CENTER} />
    }

    return activeHelpCenters.length > 0 && isNotEmptyArray(helpCenters) ? (
        <HelpCenterStatsComponent
            helpCenters={helpCenters}
            statsFilters={statsFilters}
            setStatsFilters={setStatsFilters}
        />
    ) : (
        <HelpCenterStatsEmptyState
            helpCenterId={
                helpCenters.length === 1 ? helpCenters[0].id : undefined
            }
        />
    )
}

export default HelpCenterStats
