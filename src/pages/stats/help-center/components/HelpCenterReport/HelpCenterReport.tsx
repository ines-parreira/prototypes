import moment from 'moment/moment'

import { useGridSize } from 'hooks/useGridSize'
import { FilterKey } from 'models/stat/types'
import { useHasAccessToAILibrary } from 'pages/settings/helpCenter/components/AIArticlesLibraryView/hooks/useHasAccessToAILibrary'
import { useHelpCenterAIArticlesLibrary } from 'pages/settings/helpCenter/components/AIArticlesLibraryView/hooks/useHelpCenterAIArticlesLibrary'
import { AnalyticsFooter } from 'pages/stats/common/AnalyticsFooter'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import DashboardGridCell from 'pages/stats/common/layout/DashboardGridCell'
import DashboardSection from 'pages/stats/common/layout/DashboardSection'
import StatsPage from 'pages/stats/common/layout/StatsPage'
import { DEFAULT_LOCALE } from 'pages/stats/common/utils'
import { DashboardComponent } from 'pages/stats/dashboards/DashboardComponent'
import AIBanner from 'pages/stats/help-center/components/AIBanner'
import HelpCenterOverviewSection from 'pages/stats/help-center/components/HelpCenterOverviewSection/HelpCenterOverviewSection'
import {
    HelpCenterChart,
    HelpCenterReportConfig,
} from 'pages/stats/help-center/components/HelpCenterReport/HelpCenterReportConfig'
import PartialDataAlert from 'pages/stats/help-center/components/PartialDataAlert/PartialDataAlert'
import UnpublishedHelpCenterAlert from 'pages/stats/help-center/components/UnpublishedHelpCenterAlert/UnpublishedHelpCenterAlert'
import { useSelectedHelpCenter } from 'pages/stats/help-center/hooks/useSelectedHelpCenter'

const DATE_WHEN_START_COLLECTION_EVENTS = '2023-11-16'

export const HelpCenterReport = () => {
    const { selectedHelpCenter, statsFilters } = useSelectedHelpCenter()

    const isEndDateBeforeStartCollectionEvents = moment(
        statsFilters.period.start_datetime,
    ).isBefore(DATE_WHEN_START_COLLECTION_EVENTS)

    const { hasNewArticles: showAIBanner } = useHelpCenterAIArticlesLibrary(
        selectedHelpCenter.id,
        DEFAULT_LOCALE,
        selectedHelpCenter.shop_name,
    )

    const hasAccessToAILibrary = useHasAccessToAILibrary()

    const getGridCellSize = useGridSize()

    return (
        <div className="full-width">
            <StatsPage title={HelpCenterReportConfig.reportName}>
                <DashboardSection>
                    <DashboardGridCell
                        size={getGridCellSize(12)}
                        className="pb-0"
                    >
                        <FiltersPanelWrapper
                            persistentFilters={
                                HelpCenterReportConfig.reportFilters.persistent
                            }
                            optionalFilters={
                                HelpCenterReportConfig.reportFilters.optional
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
                </DashboardSection>

                <HelpCenterOverviewSection />

                <DashboardSection title="Performance">
                    <DashboardGridCell size={12}>
                        <DashboardComponent
                            chart={HelpCenterChart.ArticleViewsGraph}
                            config={HelpCenterReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={12}>
                        <DashboardComponent
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
                        <DashboardComponent
                            chart={HelpCenterChart.SearchResultsDonut}
                            config={HelpCenterReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={8}>
                        <DashboardComponent
                            chart={HelpCenterChart.SearchTermsTable}
                            config={HelpCenterReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={4}>
                        <DashboardComponent
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
