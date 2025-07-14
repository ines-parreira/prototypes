import moment from 'moment/moment'

import { FilterKey } from 'domains/reporting/models/stat/types'
import { AnalyticsFooter } from 'domains/reporting/pages/common/AnalyticsFooter'
import FiltersPanelWrapper from 'domains/reporting/pages/common/filters/FiltersPanelWrapper'
import DashboardGridCell from 'domains/reporting/pages/common/layout/DashboardGridCell'
import DashboardSection from 'domains/reporting/pages/common/layout/DashboardSection'
import StatsPage from 'domains/reporting/pages/common/layout/StatsPage'
import { DEFAULT_LOCALE } from 'domains/reporting/pages/common/utils'
import { DashboardComponent } from 'domains/reporting/pages/dashboards/DashboardComponent'
import AIBanner from 'domains/reporting/pages/help-center/components/AIBanner'
import HelpCenterOverviewSection from 'domains/reporting/pages/help-center/components/HelpCenterOverviewSection/HelpCenterOverviewSection'
import {
    HelpCenterChart,
    HelpCenterReportConfig,
} from 'domains/reporting/pages/help-center/components/HelpCenterReport/HelpCenterReportConfig'
import PartialDataAlert from 'domains/reporting/pages/help-center/components/PartialDataAlert/PartialDataAlert'
import UnpublishedHelpCenterAlert from 'domains/reporting/pages/help-center/components/UnpublishedHelpCenterAlert/UnpublishedHelpCenterAlert'
import { useSelectedHelpCenter } from 'domains/reporting/pages/help-center/hooks/useSelectedHelpCenter'
import { useGridSize } from 'hooks/useGridSize'
import { useHasAccessToAILibrary } from 'pages/settings/helpCenter/components/AIArticlesLibraryView/hooks/useHasAccessToAILibrary'
import { useHelpCenterAIArticlesLibrary } from 'pages/settings/helpCenter/components/AIArticlesLibraryView/hooks/useHelpCenterAIArticlesLibrary'

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
