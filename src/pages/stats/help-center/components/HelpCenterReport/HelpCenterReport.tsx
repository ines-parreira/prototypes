import {useFlags} from 'launchdarkly-react-client-sdk'
import moment from 'moment/moment'
import React from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {useGridSize} from 'hooks/useGridSize'
import {FilterKey} from 'models/stat/types'
import {useHasAccessToAILibrary} from 'pages/settings/helpCenter/components/AIArticlesLibraryView/hooks/useHasAccessToAILibrary'
import {useHelpCenterAIArticlesLibrary} from 'pages/settings/helpCenter/components/AIArticlesLibraryView/hooks/useHelpCenterAIArticlesLibrary'
import {AnalyticsFooter} from 'pages/stats/AnalyticsFooter'
import DEPRECATED_HelpCenterFilter from 'pages/stats/common/filters/DEPRECATED_HelpCenterFilter/DEPRECATED_HelpCenterFilter'
import PeriodStatsFilter from 'pages/stats/common/filters/DEPRECATED_PeriodStatsFilter'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import DEPRECATED_HelpCenterStatsLanguageFilter from 'pages/stats/common/filters/HelpCenterStatsLanguageFilter/DEPRECATED_HelpCenterStatsLanguageFilter'
import {DEFAULT_LOCALE} from 'pages/stats/common/utils'
import {CustomReportComponent} from 'pages/stats/custom-reports/CustomReportComponent'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import DashboardSection from 'pages/stats/DashboardSection'
import AIBanner from 'pages/stats/help-center/components/AIBanner'
import HelpCenterOverviewSection from 'pages/stats/help-center/components/HelpCenterOverviewSection/HelpCenterOverviewSection'
import {
    HelpCenterChart,
    HelpCenterReportConfig,
} from 'pages/stats/help-center/components/HelpCenterReport/HelpCenterReportConfig'
import PartialDataAlert from 'pages/stats/help-center/components/PartialDataAlert/PartialDataAlert'
import UnpublishedHelpCenterAlert from 'pages/stats/help-center/components/UnpublishedHelpCenterAlert/UnpublishedHelpCenterAlert'
import {useSelectedHelpCenter} from 'pages/stats/help-center/hooks/useSelectedHelpCenter'
import StatsPage from 'pages/stats/StatsPage'

const DATE_WHEN_START_COLLECTION_EVENTS = '2023-11-16'

export const HelpCenterReport = () => {
    const isAnalyticsNewFilters =
        !!useFlags()[FeatureFlagKey.AnalyticsNewFiltersHelpCenter]

    const {selectedHelpCenter, statsFilters, setStatsFilters, helpCenters} =
        useSelectedHelpCenter()

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
                title={HelpCenterReportConfig.reportName}
                titleExtra={
                    !isAnalyticsNewFilters && (
                        <>
                            <DEPRECATED_HelpCenterStatsLanguageFilter
                                supportedLocales={
                                    selectedHelpCenter.supported_locales
                                }
                                selectedLocaleCodes={
                                    statsFilters.localeCodes?.values ?? []
                                }
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
                            <FiltersPanelWrapper
                                persistentFilters={
                                    HelpCenterReportConfig.reportFilters
                                        .persistent
                                }
                                optionalFilters={
                                    HelpCenterReportConfig.reportFilters
                                        .optional
                                }
                                filterSettingsOverrides={{
                                    [FilterKey.Period]: {
                                        initialSettings: {
                                            maxSpan: 365,
                                        },
                                    },
                                }}
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

                <HelpCenterOverviewSection />

                <DashboardSection title="Performance">
                    <DashboardGridCell size={12}>
                        <CustomReportComponent
                            chart={HelpCenterChart.ArticleViewsGraph}
                            config={HelpCenterReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={12}>
                        <CustomReportComponent
                            chart={HelpCenterChart.PerformanceByArticleTable}
                            config={HelpCenterReportConfig}
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
                        <CustomReportComponent
                            chart={HelpCenterChart.SearchResultsDonut}
                            config={HelpCenterReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={8}>
                        <CustomReportComponent
                            chart={HelpCenterChart.SearchTermsTable}
                            config={HelpCenterReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={4}>
                        <CustomReportComponent
                            chart={HelpCenterChart.NoSearchTable}
                            config={HelpCenterReportConfig}
                        />
                    </DashboardGridCell>
                </DashboardSection>
                <AnalyticsFooter />
            </StatsPage>
        </div>
    )
}
