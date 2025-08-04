import { useGridSize } from '@repo/hooks'

import { useCleanStatsFilters } from 'domains/reporting/hooks/useCleanStatsFilters'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { AnalyticsFooter } from 'domains/reporting/pages/common/AnalyticsFooter'
import FiltersPanelWrapper from 'domains/reporting/pages/common/filters/FiltersPanelWrapper'
import DashboardGridCell from 'domains/reporting/pages/common/layout/DashboardGridCell'
import DashboardSection from 'domains/reporting/pages/common/layout/DashboardSection'
import StatsPage from 'domains/reporting/pages/common/layout/StatsPage'
import { DashboardComponent } from 'domains/reporting/pages/dashboards/DashboardComponent'
import { AutoQADownloadDataButton } from 'domains/reporting/pages/support-performance/auto-qa/AutoQADownloadDataButton'
import {
    AUTO_QA_PAGE_TITLE,
    AutoQAChart,
    AutoQAReportConfig,
} from 'domains/reporting/pages/support-performance/auto-qa/AutoQAReportConfig'

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
