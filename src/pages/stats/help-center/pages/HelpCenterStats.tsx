import React, {useMemo} from 'react'
import moment from 'moment'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {FeatureFlagKey} from 'config/featureFlags'
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
import {FilterKey, LegacyStatsFilters} from 'models/stat/types'

import {getSortByName} from 'utils/getSortByName'
import useEffectOnce from 'hooks/useEffectOnce'
import {SegmentEvent, logEvent} from 'common/segment'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {DEFAULT_LOCALE} from 'pages/stats/common/utils'
import {useHelpCenterAIArticlesLibrary} from 'pages/settings/helpCenter/components/AIArticlesLibraryView/hooks/useHelpCenterAIArticlesLibrary'
import {useHasAccessToAILibrary} from 'pages/settings/helpCenter/components/AIArticlesLibraryView/hooks/useHasAccessToAILibrary'
import ArticleViewsGraph from 'pages/stats/help-center/components/ArticleViewsGraph/ArticleViewsGraph'
import {PerformanceByArticle} from 'pages/stats/help-center/components/PerformanceByArticle/PerformanceByArticle'
import SearchResultDonut from 'pages/stats/help-center/components/SearchResultDonut/SearchResultDonut'
import SearchTermsTable from 'pages/stats/help-center/components/SearchTermsTable/SearchTermsTable'
import NoSearchTable from 'pages/stats/help-center/components/NoSearchTable/NoSearchTable'
import DEPRECATED_HelpCenterFilter from 'pages/stats/common/filters/DEPRECATED_HelpCenterFilter/DEPRECATED_HelpCenterFilter'
import PeriodStatsFilter from 'pages/stats/common/filters/DEPRECATED_PeriodStatsFilter'
import HelpCenterStatsLoading from 'pages/stats/help-center/components/HelpCenterStatsLoading/HelpCenterStatsLoading'
import {
    HelpCenterStatsFilters,
    isHelpCenterStatsFiltersValid,
} from 'pages/stats/help-center/types'
import HelpCenterOverviewSection from 'pages/stats/help-center/components/HelpCenterOverviewSection/HelpCenterOverviewSection'
import UnpublishedHelpCenterAlert from 'pages/stats/help-center/components/UnpublishedHelpCenterAlert/UnpublishedHelpCenterAlert'
import {HelpCenterStatsEmptyState} from 'pages/stats/help-center/components/HelpCenterStatsEmptyState/HelpCenterStatsEmptyState'
import DEPRECATED_HelpCenterStatsLanguageFilter from 'pages/stats/common/filters/HelpCenterStatsLanguageFilter/DEPRECATED_HelpCenterStatsLanguageFilter'
import PartialDataAlert from 'pages/stats/help-center/components/PartialDataAlert/PartialDataAlert'
import AIBanner from 'pages/stats/help-center/components/AIBanner'
import {useStatsFilters} from 'pages/stats/help-center/hooks/useStatsFilters'
import {FiltersPanel} from 'pages/stats/common/filters/FiltersPanel'
import {useGridSize} from 'hooks/useGridSize'
import {getCleanStatsFiltersWithLogicalOperatorsWithTimezone} from 'state/ui/stats/selectors'

const PAGE_TITLE_HELP_CENTER = 'Help Center'

const DATE_WHEN_START_COLLECTION_EVENTS = '2023-11-16'

type HelpCenterStatsComponentProps = {
    helpCenters: NonEmptyArray<HelpCenter>
    statsFilters: HelpCenterStatsFilters
    setStatsFilters: (filter: Partial<LegacyStatsFilters>) => void
}

const HelpCenterStatsComponent = ({
    helpCenters,
    statsFilters,
    setStatsFilters,
}: HelpCenterStatsComponentProps) => {
    const timezone = useAppSelector(
        (state) => getTimezone(state) || DEFAULT_TIMEZONE
    )
    const {cleanStatsFilters: statsFiltersWithLogicalOperators} =
        useAppSelector(getCleanStatsFiltersWithLogicalOperatorsWithTimezone)

    const isAnalyticsNewFilters =
        !!useFlags()[FeatureFlagKey.AnalyticsNewFiltersHelpCenter]

    const cleanStatsFilters = isAnalyticsNewFilters
        ? statsFiltersWithLogicalOperators
        : statsFilters

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

    const getGridCellSize = useGridSize()

    return (
        <div className="full-width">
            <StatsPage
                title={PAGE_TITLE_HELP_CENTER}
                titleExtra={
                    !isAnalyticsNewFilters && (
                        <>
                            <DEPRECATED_HelpCenterStatsLanguageFilter
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
                    )
                }
            >
                {isAnalyticsNewFilters && (
                    <DashboardSection>
                        <DashboardGridCell
                            size={getGridCellSize(12)}
                            className="pb-0"
                        >
                            <FiltersPanel
                                persistentFilters={[
                                    FilterKey.Period,
                                    FilterKey.HelpCenters,
                                    FilterKey.LocaleCodes,
                                ]}
                            />
                        </DashboardGridCell>
                    </DashboardSection>
                )}
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
                    {!isAnalyticsNewFilters && (
                        <DashboardGridCell>
                            <DEPRECATED_HelpCenterFilter
                                selectedHelpCenter={selectedHelpCenter}
                                helpCenters={helpCenters}
                                setSelectedHelpCenter={setStatsFilters}
                            />
                        </DashboardGridCell>
                    )}
                </DashboardSection>

                <HelpCenterOverviewSection
                    statsFilters={cleanStatsFilters}
                    timezone={timezone}
                />

                <DashboardSection title="Performance">
                    <DashboardGridCell size={12}>
                        <ArticleViewsGraph
                            statsFilters={cleanStatsFilters}
                            timezone={timezone}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={12}>
                        <PerformanceByArticle
                            statsFilters={cleanStatsFilters}
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
                            statsFilters={cleanStatsFilters}
                            timezone={timezone}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={8}>
                        <SearchTermsTable
                            statsFilters={cleanStatsFilters}
                            timezone={timezone}
                            helpCenterDomain={selectedHelpCenterDomain}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={4}>
                        <NoSearchTable
                            statsFilters={cleanStatsFilters}
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
