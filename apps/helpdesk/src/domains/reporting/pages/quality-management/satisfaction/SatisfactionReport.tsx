import { useGridSize } from '@repo/hooks'

import { useCleanStatsFilters } from 'domains/reporting/hooks/useCleanStatsFilters'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { AnalyticsFooter } from 'domains/reporting/pages/common/AnalyticsFooter'
import FiltersPanelWrapper from 'domains/reporting/pages/common/filters/FiltersPanelWrapper'
import DashboardGridCell from 'domains/reporting/pages/common/layout/DashboardGridCell'
import DashboardSection from 'domains/reporting/pages/common/layout/DashboardSection'
import StatsPage from 'domains/reporting/pages/common/layout/StatsPage'
import { DashboardComponent } from 'domains/reporting/pages/dashboards/DashboardComponent'
import { SatisfactionDownloadDataButton } from 'domains/reporting/pages/quality-management/satisfaction/SatisfactionDownloadDataButton'
import {
    SatisfactionChart,
    SatisfactionReportConfig,
} from 'domains/reporting/pages/quality-management/satisfaction/SatisfactionReportConfig'

export default function SatisfactionReport() {
    const getGridCellSize = useGridSize()
    useCleanStatsFilters()

    return (
        <div className="full-width">
            <StatsPage
                title={SatisfactionReportConfig.reportName}
                titleExtra={
                    <>
                        <SatisfactionDownloadDataButton />
                    </>
                }
            >
                <DashboardSection>
                    <DashboardGridCell size={getGridCellSize(12)}>
                        <FiltersPanelWrapper
                            optionalFilters={
                                SatisfactionReportConfig.reportFilters.optional
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
