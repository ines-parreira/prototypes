import {useFlags} from 'launchdarkly-react-client-sdk'
import React from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters} from 'hooks/reporting/common/useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters'
import {useGridSize} from 'hooks/useGridSize'
import {FilterKey} from 'models/stat/types'
import {AnalyticsFooter} from 'pages/stats/AnalyticsFooter'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import {CustomReportComponent} from 'pages/stats/custom-reports/CustomReportComponent'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import DashboardSection from 'pages/stats/DashboardSection'
import {SatisfactionDownloadDataButton} from 'pages/stats/quality-management/satisfaction/SatisfactionDownloadDataButton'
import {
    SatisfactionChart,
    SatisfactionReportConfig,
} from 'pages/stats/quality-management/satisfaction/SatisfactionReportConfig'
import StatsPage from 'pages/stats/StatsPage'
import {SupportPerformanceFilters} from 'pages/stats/support-performance/SupportPerformanceFilters'

export default function SatisfactionReport() {
    const satisfactionOptionalFilters =
        useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters(
            SatisfactionReportConfig.reportFilters.optional
        )
    const getGridCellSize = useGridSize()
    const isAnalyticsNewFilters =
        !!useFlags()[FeatureFlagKey.AnalyticsNewFilters]

    return (
        <div className="full-width">
            <StatsPage
                title={SatisfactionReportConfig.reportName}
                titleExtra={
                    <>
                        <SupportPerformanceFilters
                            hidden={isAnalyticsNewFilters}
                        />
                        <SatisfactionDownloadDataButton />
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
                                optionalFilters={satisfactionOptionalFilters}
                                filterSettingsOverrides={{
                                    [FilterKey.Period]: {
                                        initialSettings: {
                                            maxSpan: 365,
                                        },
                                    },
                                }}
                                persistentFilters={
                                    SatisfactionReportConfig.reportFilters
                                        .persistent
                                }
                            />
                        </DashboardGridCell>
                    </DashboardSection>
                )}
                <DashboardSection>
                    <DashboardGridCell size={getGridCellSize(4)}>
                        <CustomReportComponent
                            chart={SatisfactionChart.SatisfactionScoreTrendCard}
                            config={SatisfactionReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={getGridCellSize(4)}>
                        <CustomReportComponent
                            chart={SatisfactionChart.ResponseRateTrendCard}
                            config={SatisfactionReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={getGridCellSize(4)}>
                        <CustomReportComponent
                            chart={SatisfactionChart.SurveysSentTrendCard}
                            config={SatisfactionReportConfig}
                        />
                    </DashboardGridCell>
                </DashboardSection>
                <DashboardSection>
                    <DashboardGridCell size={getGridCellSize(6)}>
                        <CustomReportComponent
                            chart={
                                SatisfactionChart.AverageSurveyScoreDonutChart
                            }
                            config={SatisfactionReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={getGridCellSize(6)}>
                        <CustomReportComponent
                            chart={SatisfactionChart.CommentHighlightsChart}
                            config={SatisfactionReportConfig}
                        />
                    </DashboardGridCell>
                </DashboardSection>
                <AnalyticsFooter />
            </StatsPage>
        </div>
    )
}
