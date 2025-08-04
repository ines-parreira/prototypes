import { useGridSize } from '@repo/hooks'

import { useCleanStatsFilters } from 'domains/reporting/hooks/useCleanStatsFilters'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { AnalyticsFooter } from 'domains/reporting/pages/common/AnalyticsFooter'
import FiltersPanelWrapper from 'domains/reporting/pages/common/filters/FiltersPanelWrapper'
import DashboardGridCell from 'domains/reporting/pages/common/layout/DashboardGridCell'
import DashboardSection from 'domains/reporting/pages/common/layout/DashboardSection'
import StatsPage from 'domains/reporting/pages/common/layout/StatsPage'
import { DashboardComponent } from 'domains/reporting/pages/dashboards/DashboardComponent'
import { DownloadSLAsData } from 'domains/reporting/pages/sla/components/DownloadSLAsData'
import { WithSlaEmptyState } from 'domains/reporting/pages/sla/components/WithSlaEmptyState'
import {
    ServiceLevelAgreementsChart,
    ServiceLevelAgreementsReportConfig,
} from 'domains/reporting/pages/sla/ServiceLevelAgreementsReportConfig'

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
