import { useCleanStatsFilters } from 'hooks/reporting/useCleanStatsFilters'
import { useGridSize } from 'hooks/useGridSize'
import useLocalStorage from 'hooks/useLocalStorage'
import { FilterKey } from 'models/stat/types'
import TipsToggle from 'pages/common/components/TipsToggle/TipsToggle'
import { AnalyticsFooter } from 'pages/stats/common/AnalyticsFooter'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import DashboardGridCell from 'pages/stats/common/layout/DashboardGridCell'
import DashboardSection from 'pages/stats/common/layout/DashboardSection'
import StatsPage from 'pages/stats/common/layout/StatsPage'
import { DashboardComponent } from 'pages/stats/dashboards/DashboardComponent'
import { DownloadOverviewData } from 'pages/stats/support-performance/overview/DownloadOverviewData'
import {
    PERFORMANCE_OVERVIEW_OPTIONAL_FILTERS,
    STATS_TIPS_VISIBILITY_KEY,
} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'
import {
    OverviewChart,
    SupportPerformanceOverviewReportConfig,
} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewReportConfig'

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
