import { useCleanStatsFilters } from 'hooks/reporting/useCleanStatsFilters'
import { useGridSize } from 'hooks/useGridSize'
import { FilterKey } from 'models/stat/types'
import { AnalyticsFooter } from 'pages/stats/common/AnalyticsFooter'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import DashboardGridCell from 'pages/stats/common/layout/DashboardGridCell'
import DashboardSection from 'pages/stats/common/layout/DashboardSection'
import StatsPage from 'pages/stats/common/layout/StatsPage'
import { DashboardComponent } from 'pages/stats/dashboards/DashboardComponent'
import { DownloadSLAsData } from 'pages/stats/sla/components/DownloadSLAsData'
import { WithSlaEmptyState } from 'pages/stats/sla/components/WithSlaEmptyState'
import {
    ServiceLevelAgreementsChart,
    ServiceLevelAgreementsReportConfig,
} from 'pages/stats/sla/ServiceLevelAgreementsReportConfig'

const OVERVIEW_SECTION_LABEL = 'Overview'

export function ServiceLevelAgreements() {
    const getGridCellSize = useGridSize()
    useCleanStatsFilters()

    return (
        <WithSlaEmptyState>
            <div className="full-width">
                <StatsPage
                    title={ServiceLevelAgreementsReportConfig.reportName}
                    titleExtra={
                        <>
                            <DownloadSLAsData />
                        </>
                    }
                >
                    <DashboardSection>
                        <DashboardGridCell
                            size={getGridCellSize(12)}
                            className="pb-0"
                        >
                            <FiltersPanelWrapper
                                persistentFilters={
                                    ServiceLevelAgreementsReportConfig
                                        .reportFilters.persistent
                                }
                                optionalFilters={
                                    ServiceLevelAgreementsReportConfig
                                        .reportFilters.optional
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
                    <DashboardSection
                        title={OVERVIEW_SECTION_LABEL}
                        className="pb-0"
                    >
                        <DashboardGridCell size={getGridCellSize(6)}>
                            <DashboardComponent
                                chart={
                                    ServiceLevelAgreementsChart.AchievementRateTrend
                                }
                                config={ServiceLevelAgreementsReportConfig}
                            />
                        </DashboardGridCell>
                        <DashboardGridCell size={getGridCellSize(6)}>
                            <DashboardComponent
                                chart={
                                    ServiceLevelAgreementsChart.BreachedTicketsRateTrend
                                }
                                config={ServiceLevelAgreementsReportConfig}
                            />
                        </DashboardGridCell>
                        <DashboardGridCell size={12}>
                            <DashboardComponent
                                chart={
                                    ServiceLevelAgreementsChart.AchievedAndBreachedTicketsChart
                                }
                                config={ServiceLevelAgreementsReportConfig}
                            />
                        </DashboardGridCell>
                    </DashboardSection>
                    <AnalyticsFooter />
                </StatsPage>
            </div>
        </WithSlaEmptyState>
    )
}
