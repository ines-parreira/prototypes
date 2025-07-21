import { useCleanStatsFilters } from 'domains/reporting/hooks/useCleanStatsFilters'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { AnalyticsFooter } from 'domains/reporting/pages/common/AnalyticsFooter'
import FiltersPanelWrapper from 'domains/reporting/pages/common/filters/FiltersPanelWrapper'
import DashboardGridCell from 'domains/reporting/pages/common/layout/DashboardGridCell'
import DashboardSection from 'domains/reporting/pages/common/layout/DashboardSection'
import StatsPage from 'domains/reporting/pages/common/layout/StatsPage'
import { DashboardComponent } from 'domains/reporting/pages/dashboards/DashboardComponent'
import { DownloadOverviewData } from 'domains/reporting/pages/support-performance/overview/DownloadOverviewData'
import {
    PERFORMANCE_OVERVIEW_OPTIONAL_FILTERS,
    STATS_TIPS_VISIBILITY_KEY,
} from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewConfig'
import {
    OverviewChart,
    SupportPerformanceOverviewReportConfig,
} from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewReportConfig'
import { useGridSize } from 'hooks/useGridSize'
import useLocalStorage from 'hooks/useLocalStorage'
import TipsToggle from 'pages/common/components/TipsToggle/TipsToggle'

const WORKLOAD_SECTION_KPI_GRID_CELL_SIZE = 3
const PRODUCTIVITY_SECTION_KPI_GRID_CELL_SIZE = 4

export default function SupportPerformanceOverviewReport() {
    const [areTipsVisible, setAreTipsVisible] = useLocalStorage(
        STATS_TIPS_VISIBILITY_KEY,
        true,
    )
    const getGridCellSize = useGridSize()
    useCleanStatsFilters()

    return (
        <div className="full-width">
            <StatsPage
                title={SupportPerformanceOverviewReportConfig.reportName}
                titleExtra={
                    <>
                        <DownloadOverviewData />
                    </>
                }
            >
                <DashboardSection>
                    <DashboardGridCell
                        size={getGridCellSize(12)}
                        className="pb-0"
                    >
                        <FiltersPanelWrapper
                            persistentFilters={[
                                FilterKey.Period,
                                FilterKey.AggregationWindow,
                            ]}
                            optionalFilters={
                                PERFORMANCE_OVERVIEW_OPTIONAL_FILTERS
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
                    title="Customer experience"
                    titleExtra={
                        <TipsToggle
                            isVisible={areTipsVisible}
                            onClick={() => setAreTipsVisible(!areTipsVisible)}
                        />
                    }
                >
                    <DashboardGridCell size={getGridCellSize(3)}>
                        <DashboardComponent
                            chart={OverviewChart.CustomerSatisfactionTrendCard}
                            config={SupportPerformanceOverviewReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={getGridCellSize(3)}>
                        <DashboardComponent
                            chart={
                                OverviewChart.MedianFirstResponseTimeTrendCard
                            }
                            config={SupportPerformanceOverviewReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={getGridCellSize(3)}>
                        <DashboardComponent
                            chart={OverviewChart.MedianResolutionTimeTrendCard}
                            config={SupportPerformanceOverviewReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={getGridCellSize(3)}>
                        <DashboardComponent
                            chart={OverviewChart.MessagesPerTicketTrendCard}
                            config={SupportPerformanceOverviewReportConfig}
                        />
                    </DashboardGridCell>
                </DashboardSection>

                <DashboardSection title="Workload">
                    <>
                        <DashboardGridCell
                            size={getGridCellSize(
                                WORKLOAD_SECTION_KPI_GRID_CELL_SIZE,
                            )}
                        >
                            <DashboardComponent
                                chart={OverviewChart.TicketsCreatedTrendCard}
                                config={SupportPerformanceOverviewReportConfig}
                            />
                        </DashboardGridCell>
                        <DashboardGridCell
                            size={getGridCellSize(
                                WORKLOAD_SECTION_KPI_GRID_CELL_SIZE,
                            )}
                        >
                            <DashboardComponent
                                chart={OverviewChart.TicketsClosedTrendCard}
                                config={SupportPerformanceOverviewReportConfig}
                            />
                        </DashboardGridCell>
                        <DashboardGridCell
                            size={getGridCellSize(
                                WORKLOAD_SECTION_KPI_GRID_CELL_SIZE,
                            )}
                        >
                            <DashboardComponent
                                chart={OverviewChart.OpenTicketsTrendCard}
                                config={SupportPerformanceOverviewReportConfig}
                            />
                        </DashboardGridCell>
                        <DashboardGridCell
                            size={getGridCellSize(
                                WORKLOAD_SECTION_KPI_GRID_CELL_SIZE,
                            )}
                        >
                            <DashboardComponent
                                chart={OverviewChart.MessagesReceivedTrendCard}
                                config={SupportPerformanceOverviewReportConfig}
                            />
                        </DashboardGridCell>
                        <DashboardGridCell size={12}>
                            <DashboardComponent
                                chart={
                                    OverviewChart.TicketsCreatedVsClosedChart
                                }
                                config={SupportPerformanceOverviewReportConfig}
                            />
                        </DashboardGridCell>
                    </>
                    <DashboardGridCell size={12}>
                        <DashboardComponent
                            chart={OverviewChart.WorkloadPerChannelChart}
                            config={SupportPerformanceOverviewReportConfig}
                        />
                    </DashboardGridCell>
                </DashboardSection>

                <DashboardSection title="Productivity">
                    <DashboardGridCell
                        size={getGridCellSize(
                            PRODUCTIVITY_SECTION_KPI_GRID_CELL_SIZE,
                        )}
                    >
                        <DashboardComponent
                            chart={OverviewChart.TicketsRepliedTrendCard}
                            config={SupportPerformanceOverviewReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell
                        size={getGridCellSize(
                            PRODUCTIVITY_SECTION_KPI_GRID_CELL_SIZE,
                        )}
                    >
                        <DashboardComponent
                            chart={OverviewChart.MessagesSentTrendCard}
                            config={SupportPerformanceOverviewReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell
                        size={getGridCellSize(
                            PRODUCTIVITY_SECTION_KPI_GRID_CELL_SIZE,
                        )}
                    >
                        <DashboardComponent
                            chart={OverviewChart.MedianResponseTimeTrendCard}
                            config={SupportPerformanceOverviewReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell
                        size={getGridCellSize(
                            PRODUCTIVITY_SECTION_KPI_GRID_CELL_SIZE,
                        )}
                    >
                        <DashboardComponent
                            chart={OverviewChart.TicketHandleTimeTrendCard}
                            config={SupportPerformanceOverviewReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell
                        size={getGridCellSize(
                            PRODUCTIVITY_SECTION_KPI_GRID_CELL_SIZE,
                        )}
                    >
                        <DashboardComponent
                            chart={OverviewChart.OneTouchTicketsTrendCard}
                            config={SupportPerformanceOverviewReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell
                        size={getGridCellSize(
                            PRODUCTIVITY_SECTION_KPI_GRID_CELL_SIZE,
                        )}
                    >
                        <DashboardComponent
                            chart={OverviewChart.ZeroTouchTicketsTrendCard}
                            config={SupportPerformanceOverviewReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={getGridCellSize(6)}>
                        <DashboardComponent
                            chart={OverviewChart.TicketsRepliedGraph}
                            config={SupportPerformanceOverviewReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={getGridCellSize(6)}>
                        <DashboardComponent
                            chart={OverviewChart.MessagesSentGraph}
                            config={SupportPerformanceOverviewReportConfig}
                        />
                    </DashboardGridCell>
                </DashboardSection>

                <AnalyticsFooter />
            </StatsPage>
        </div>
    )
}
