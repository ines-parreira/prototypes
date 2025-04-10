import { useCleanStatsFilters } from 'hooks/reporting/useCleanStatsFilters'
import { useGridSize } from 'hooks/useGridSize'
import { FilterKey } from 'models/stat/types'
import { AnalyticsFooter } from 'pages/stats/common/AnalyticsFooter'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import DashboardGridCell from 'pages/stats/common/layout/DashboardGridCell'
import DashboardSection from 'pages/stats/common/layout/DashboardSection'
import StatsPage from 'pages/stats/common/layout/StatsPage'
import { DashboardComponent } from 'pages/stats/dashboards/DashboardComponent'
import { AutoQADownloadDataButton } from 'pages/stats/support-performance/auto-qa/AutoQADownloadDataButton'
import {
    AUTO_QA_PAGE_TITLE,
    AutoQAChart,
    AutoQAReportConfig,
} from 'pages/stats/support-performance/auto-qa/AutoQAReportConfig'

export default function AutoQA() {
    const getGridCellSize = useGridSize()
    useCleanStatsFilters()

    const trendCardColumnWidth = 3
    const manualDimensionTrendCardColumnWidth = 3

    return (
        <div className="full-width">
            <StatsPage
                title={AUTO_QA_PAGE_TITLE}
                titleExtra={
                    <>
                        <AutoQADownloadDataButton />
                    </>
                }
            >
                <DashboardSection>
                    <DashboardGridCell
                        size={getGridCellSize(12)}
                        className="pb-0"
                    >
                        <FiltersPanelWrapper
                            filterSettingsOverrides={{
                                [FilterKey.Period]: {
                                    initialSettings: {
                                        maxSpan: 365,
                                    },
                                },
                            }}
                            persistentFilters={
                                AutoQAReportConfig.reportFilters.persistent
                            }
                            optionalFilters={
                                AutoQAReportConfig.reportFilters.optional
                            }
                        />
                    </DashboardGridCell>
                </DashboardSection>
                <DashboardSection>
                    <DashboardGridCell
                        size={getGridCellSize(trendCardColumnWidth)}
                    >
                        <DashboardComponent
                            chart={AutoQAChart.ReviewedClosedTickets}
                            config={AutoQAReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell
                        size={getGridCellSize(trendCardColumnWidth)}
                    >
                        <DashboardComponent
                            chart={AutoQAChart.ResolutionCompleteness}
                            config={AutoQAReportConfig}
                        />
                    </DashboardGridCell>

                    <DashboardGridCell
                        size={getGridCellSize(
                            manualDimensionTrendCardColumnWidth,
                        )}
                    >
                        <DashboardComponent
                            chart={AutoQAChart.Accuracy}
                            config={AutoQAReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell
                        size={getGridCellSize(
                            manualDimensionTrendCardColumnWidth,
                        )}
                    >
                        <DashboardComponent
                            chart={AutoQAChart.InternalCompliance}
                            config={AutoQAReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell
                        size={getGridCellSize(
                            manualDimensionTrendCardColumnWidth,
                        )}
                    >
                        <DashboardComponent
                            chart={AutoQAChart.Efficiency}
                            config={AutoQAReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell
                        size={getGridCellSize(trendCardColumnWidth)}
                    >
                        <DashboardComponent
                            chart={AutoQAChart.CommunicationSkills}
                            config={AutoQAReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell
                        size={getGridCellSize(trendCardColumnWidth)}
                    >
                        <DashboardComponent
                            chart={AutoQAChart.LanguageProficiency}
                            config={AutoQAReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell
                        size={getGridCellSize(
                            manualDimensionTrendCardColumnWidth,
                        )}
                    >
                        <DashboardComponent
                            chart={AutoQAChart.BrandVoice}
                            config={AutoQAReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={getGridCellSize(12)}>
                        <DashboardComponent
                            chart={AutoQAChart.AgentsTable}
                            config={AutoQAReportConfig}
                        />
                    </DashboardGridCell>
                </DashboardSection>
                <AnalyticsFooter />
            </StatsPage>
        </div>
    )
}
