import React from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'

import { FeatureFlagKey } from 'config/featureFlags'
import { useGridSize } from 'hooks/useGridSize'
import { FilterKey } from 'models/stat/types'
import { AnalyticsFooter } from 'pages/stats/AnalyticsFooter'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import { DashboardComponent } from 'pages/stats/dashboards/DashboardComponent'
import DashboardSection from 'pages/stats/DashboardSection'
import { SatisfactionDownloadDataButton } from 'pages/stats/quality-management/satisfaction/SatisfactionDownloadDataButton'
import {
    SatisfactionChart,
    SatisfactionReportConfig,
} from 'pages/stats/quality-management/satisfaction/SatisfactionReportConfig'
import StatsPage from 'pages/stats/StatsPage'
import { SupportPerformanceFilters } from 'pages/stats/support-performance/SupportPerformanceFilters'

export default function SatisfactionReport() {
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
                        <DashboardGridCell size={getGridCellSize(12)}>
                            <FiltersPanelWrapper
                                optionalFilters={
                                    SatisfactionReportConfig.reportFilters
                                        .optional
                                }
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
                        <DashboardComponent
                            chart={SatisfactionChart.SatisfactionScoreTrendCard}
                            config={SatisfactionReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={getGridCellSize(4)}>
                        <DashboardComponent
                            chart={SatisfactionChart.ResponseRateTrendCard}
                            config={SatisfactionReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={getGridCellSize(4)}>
                        <DashboardComponent
                            chart={SatisfactionChart.SurveysSentTrendCard}
                            config={SatisfactionReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={getGridCellSize(6)}>
                        <DashboardComponent
                            chart={
                                SatisfactionChart.AverageSurveyScoreDonutChart
                            }
                            config={SatisfactionReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={getGridCellSize(6)}>
                        <DashboardComponent
                            chart={SatisfactionChart.CommentHighlightsChart}
                            config={SatisfactionReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={getGridCellSize(12)}>
                        <DashboardComponent
                            chart={
                                SatisfactionChart.AverageCSATPerDimensionTrendChart
                            }
                            config={SatisfactionReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={getGridCellSize(12)}>
                        <DashboardComponent
                            chart={SatisfactionChart.ScoredSurveysChart}
                            config={SatisfactionReportConfig}
                        />
                    </DashboardGridCell>
                </DashboardSection>
                <AnalyticsFooter />
            </StatsPage>
        </div>
    )
}
