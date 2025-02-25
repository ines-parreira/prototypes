import React from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'

import { FeatureFlagKey } from 'config/featureFlags'
import { useGridSize } from 'hooks/useGridSize'
import { FilterKey } from 'models/stat/types'
import { AnalyticsFooter } from 'pages/stats/AnalyticsFooter'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import { CustomReportComponent } from 'pages/stats/custom-reports/CustomReportComponent'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import DashboardSection from 'pages/stats/DashboardSection'
import { DownloadSLAsData } from 'pages/stats/sla/components/DownloadSLAsData'
import { SLAPolicySelect } from 'pages/stats/sla/components/SLAPolicySelect'
import { WithSlaEmptyState } from 'pages/stats/sla/components/WithSlaEmptyState'
import {
    ServiceLevelAgreementsChart,
    ServiceLevelAgreementsReportConfig,
} from 'pages/stats/sla/ServiceLevelAgreementsReportConfig'
import StatsPage from 'pages/stats/StatsPage'
import { SupportPerformanceFilters } from 'pages/stats/support-performance/SupportPerformanceFilters'

const OVERVIEW_SECTION_LABEL = 'Overview'

export function ServiceLevelAgreements() {
    const getGridCellSize = useGridSize()
    const isAnalyticsNewFilters =
        !!useFlags()[FeatureFlagKey.AnalyticsNewFilters]

    return (
        <WithSlaEmptyState>
            <div className="full-width">
                <StatsPage
                    title={ServiceLevelAgreementsReportConfig.reportName}
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
                                config={ServiceLevelAgreementsReportConfig}
                            />
                        </DashboardGridCell>
                        <DashboardGridCell size={getGridCellSize(6)}>
                            <CustomReportComponent
                                chart={
                                    ServiceLevelAgreementsChart.BreachedTicketsRateTrend
                                }
                                config={ServiceLevelAgreementsReportConfig}
                            />
                        </DashboardGridCell>
                        <DashboardGridCell size={12}>
                            <CustomReportComponent
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
