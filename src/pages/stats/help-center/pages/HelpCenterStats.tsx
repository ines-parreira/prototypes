import React, {useMemo} from 'react'
import moment from 'moment'
import {AnalyticsFooter} from 'pages/stats/AnalyticsFooter'
import useAppSelector from 'hooks/useAppSelector'
import {getCurrentUser, getTimezone} from 'state/currentUser/selectors'
import {DEFAULT_TIMEZONE} from 'pages/stats/convert/constants/components'
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

import {getSortByName} from 'utils/getSortByName'
import useEffectOnce from 'hooks/useEffectOnce'
import {SegmentEvent, logEvent} from 'common/segment'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {DEFAULT_LOCALE} from 'pages/stats/common/utils'
import {useHelpCenterAIArticlesLibrary} from 'pages/settings/helpCenter/components/AIArticlesLibraryView/hooks/useHelpCenterAIArticlesLibrary'
import {useHasAccessToAILibrary} from 'pages/settings/helpCenter/components/AIArticlesLibraryView/hooks/useHasAccessToAILibrary'
import ArticleViewsGraph from '../components/ArticleViewsGraph/ArticleViewsGraph'
import {PerformanceByArticle} from '../components/PerformanceByArticle/PerformanceByArticle'
import SearchResultDonut from '../components/SearchResultDonut/SearchResultDonut'
import SearchTermsTable from '../components/SearchTermsTable/SearchTermsTable'
import NoSearchTable from '../components/NoSearchTable/NoSearchTable'
import HelpCenterFilter from '../components/HelpCenterFilter/HelpCenterFilter'
import {useStatsFilters} from '../hooks/useStatsFilters'
import PeriodStatsFilter from '../../PeriodStatsFilter'
import HelpCenterStatsLoading from '../components/HelpCenterStatsLoading/HelpCenterStatsLoading'
import {HelpCenterStatsFilters, isHelpCenterStatsFiltersValid} from '../types'
import HelpCenterOverviewSection from '../components/HelpCenterOverviewSection/HelpCenterOverviewSection'
import UnpublishedHelpCenterAlert from '../components/UnpublishedHelpCenterAlert/UnpublishedHelpCenterAlert'
import {HelpCenterStatsEmptyState} from '../components/HelpCenterStatsEmptyState/HelpCenterStatsEmptyState'
import HelpCenterStatsLanguageFilter from '../components/HelpCenterStatsLanguageFilter/HelpCenterStatsLanguageFilter'
import PartialDataAlert from '../components/PartialDataAlert/PartialDataAlert'
import AIBanner from '../components/AIBanner'

const PAGE_TITLE_HELP_CENTER = 'Help Center'

const DATE_WHEN_START_COLLECTION_EVENTS = '2023-11-16'

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

    const selectedHelpCenterDomain = getHelpCenterDomain(selectedHelpCenter)
    const onLanguageFilterChange = (localeCodes: string[]) => {
        setStatsFilters({localeCodes})
    }

    const isEndDateBeforeStartCollectionEvents = moment(
        statsFilters.period.start_datetime
    ).isBefore(DATE_WHEN_START_COLLECTION_EVENTS)

    const {hasNewArticles: showAIBanner} = useHelpCenterAIArticlesLibrary(
        selectedHelpCenter.id,
        DEFAULT_LOCALE,
        selectedHelpCenter.shop_name
    )

    const hasAccessToAILibrary = useHasAccessToAILibrary()

    return (
        <div className="full-width">
            <StatsPage
                title={PAGE_TITLE_HELP_CENTER}
                titleExtra={
                    <>
                        <HelpCenterStatsLanguageFilter
                            supportedLocales={
                                selectedHelpCenter.supported_locales
                            }
                            selectedLocaleCodes={statsFilters.localeCodes}
                            onFilterChange={onLanguageFilterChange}
                        />
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
                    {isEndDateBeforeStartCollectionEvents && (
                        <DashboardGridCell>
                            <PartialDataAlert
                                collectionStartDate={
                                    DATE_WHEN_START_COLLECTION_EVENTS
                                }
                            />
                        </DashboardGridCell>
                    )}
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
                            helpCenterDomain={selectedHelpCenterDomain}
                            helpCenterId={selectedHelpCenter.id}
                        />
                    </DashboardGridCell>
                    {hasAccessToAILibrary && showAIBanner && (
                        <DashboardGridCell size={12}>
                            <AIBanner
                                helpCenterId={selectedHelpCenter.id}
                                from="help-center-stats-banner"
                            />
                        </DashboardGridCell>
                    )}
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
                            helpCenterDomain={selectedHelpCenterDomain}
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
    const currentUser = useAppSelector(getCurrentUser)
    const currentAccount = useAppSelector(getCurrentAccountState)

    useEffectOnce(() => {
        logEvent(SegmentEvent.HelpCenterStatisticsPageViewed, {
            user_id: currentUser.get('id'),
            account_domain: currentAccount.get('domain'),
        })
    })

    const {helpCenters, isLoading} = useHelpCenterList({
        per_page: HELP_CENTER_MAX_CREATION,
        type: 'faq',
    })
    const sortedHelpCenters = useMemo(
        () => helpCenters.sort(getSortByName),
        [helpCenters]
    )
    const statsFiltersInitState = useMemo(
        () => ({
            helpCenters: sortedHelpCenters[0] ? [sortedHelpCenters[0].id] : [],
            localeCodes: sortedHelpCenters[0]
                ? sortedHelpCenters[0].supported_locales
                : [],
        }),
        [sortedHelpCenters]
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

    return activeHelpCenters.length > 0 &&
        isNotEmptyArray(sortedHelpCenters) ? (
        <HelpCenterStatsComponent
            helpCenters={sortedHelpCenters}
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
