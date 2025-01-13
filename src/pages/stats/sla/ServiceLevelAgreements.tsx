import {useFlags} from 'launchdarkly-react-client-sdk'
import React from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters} from 'hooks/reporting/common/useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters'
import {useGridSize} from 'hooks/useGridSize'
import {FilterKey} from 'models/stat/types'
import {AnalyticsFooter} from 'pages/stats/AnalyticsFooter'
import {CustomReportComponent} from 'pages/stats/common/CustomReport/CustomReportComponent'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import DashboardSection from 'pages/stats/DashboardSection'
import {DownloadSLAsData} from 'pages/stats/sla/components/DownloadSLAsData'
import {SLAPolicySelect} from 'pages/stats/sla/components/SLAPolicySelect'
import {WithSlaEmptyState} from 'pages/stats/sla/components/WithSlaEmptyState'
import {
    ServiceLevelAgreementsConfig,
    ServiceLevelAgreementsChart,
} from 'pages/stats/sla/ServiceLevelAgreementsConfig'
import StatsPage from 'pages/stats/StatsPage'
import {SupportPerformanceFilters} from 'pages/stats/support-performance/SupportPerformanceFilters'

const OVERVIEW_SECTION_LABEL = 'Overview'

export function ServiceLevelAgreements() {
    const getGridCellSize = useGridSize()
    const isAnalyticsNewFilters =
        !!useFlags()[FeatureFlagKey.AnalyticsNewFilters]
    const SLAsOptionalFilters =
        useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters(
            ServiceLevelAgreementsConfig.reportFilters.optional
        )
    return (
        <WithSlaEmptyState>
            <div className="full-width">
                <StatsPage
                    title={ServiceLevelAgreementsConfig.reportName}
                    titleExtra={
                        <>
                            <SupportPerformanceFilters
                                hidden={isAnalyticsNewFilters}
                            />
                            <DownloadSLAsData />
                        </>
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
                                        ServiceLevelAgreementsConfig
                                            .reportFilters.persistent
                                    }
                                    optionalFilters={SLAsOptionalFilters}
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
                    <DashboardSection
                        title={OVERVIEW_SECTION_LABEL}
                        className="pb-0"
                    >
                        {!isAnalyticsNewFilters && <SLAPolicySelect />}
                    </DashboardSection>
                    <DashboardSection>
                        <DashboardGridCell size={getGridCellSize(6)}>
                            <CustomReportComponent
                                chart={
                                    ServiceLevelAgreementsChart.AchievementRateTrend
                                }
                                config={ServiceLevelAgreementsConfig}
                                activateActionsMenu
                            />
                        </DashboardGridCell>
                        <DashboardGridCell size={getGridCellSize(6)}>
                            <CustomReportComponent
                                chart={
                                    ServiceLevelAgreementsChart.BreachedTicketsRateTrend
                                }
                                config={ServiceLevelAgreementsConfig}
                                activateActionsMenu
                            />
                        </DashboardGridCell>
                        <DashboardGridCell size={12}>
                            <CustomReportComponent
                                chart={
                                    ServiceLevelAgreementsChart.AchievedAndBreachedTicketsChart
                                }
                                config={ServiceLevelAgreementsConfig}
                                activateActionsMenu
                            />
                        </DashboardGridCell>
                    </DashboardSection>
                    <AnalyticsFooter />
                </StatsPage>
            </div>
        </WithSlaEmptyState>
    )
}
