import { useGridSize } from '@repo/hooks'

import { useCleanStatsFilters } from 'domains/reporting/hooks/useCleanStatsFilters'
import { useIsHrtAiEnabled } from 'domains/reporting/hooks/useIsHrtAiEnabled'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { AnalyticsFooter } from 'domains/reporting/pages/common/AnalyticsFooter'
import FiltersPanelWrapper from 'domains/reporting/pages/common/filters/FiltersPanelWrapper'
import DashboardGridCell from 'domains/reporting/pages/common/layout/DashboardGridCell'
import DashboardSection from 'domains/reporting/pages/common/layout/DashboardSection'
import StatsPage from 'domains/reporting/pages/common/layout/StatsPage'
import { DashboardComponent } from 'domains/reporting/pages/dashboards/DashboardComponent'
import { DownloadOverviewData } from 'domains/reporting/pages/support-performance/overview/DownloadOverviewData'
import { useTipsVisibility } from 'domains/reporting/pages/support-performance/overview/hooks/useTipsVisibility'
import { PERFORMANCE_OVERVIEW_OPTIONAL_FILTERS } from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewConfig'
import {
    OverviewChart,
    SupportPerformanceOverviewReportConfig,
} from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewReportConfig'
import TipsToggle from 'pages/common/components/TipsToggle/TipsToggle'

const WORKLOAD_SECTION_KPI_GRID_CELL_SIZE = 3
const PRODUCTIVITY_SECTION_KPI_GRID_CELL_SIZE = 4
const CX_LAYOUT_BASE = [3, 3, 3, 3, 3]
const CX_LAYOUT_WITH_HRT_AI = [4, 4, 4, 6, 6]

export default function SupportPerformanceOverviewReport() {
    const [areTipsVisible, setAreTipsVisible] = useTipsVisibility()
    const getGridCellSize = useGridSize()
    useCleanStatsFilters()

    const isHrtAiEnabled = useIsHrtAiEnabled()

    const customerExperienceLayout = isHrtAiEnabled
        ? CX_LAYOUT_WITH_HRT_AI
        : CX_LAYOUT_BASE

    return (
        <div className="full-width">
            <StatsPage
                title={SupportPerformanceOverviewReportConfig.reportName}
                titleExtra={<DownloadOverviewData />}
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
                    <DashboardGridCell
                        size={getGridCellSize(customerExperienceLayout[0])}
                    >
                        <DashboardComponent
                            chart={OverviewChart.CustomerSatisfactionTrendCard}
                            config={SupportPerformanceOverviewReportConfig}
                        />
                    </DashboardGridCell>
                    {!isHrtAiEnabled && (
                        <DashboardGridCell
                            size={getGridCellSize(customerExperienceLayout[3])}
                        >
                            <DashboardComponent
                                chart={
                                    OverviewChart.MedianFirstResponseTimeTrendCard
                                }
                                config={SupportPerformanceOverviewReportConfig}
                            />
                        </DashboardGridCell>
                    )}
                    <DashboardGridCell
                        size={getGridCellSize(customerExperienceLayout[1])}
                    >
                        <DashboardComponent
                            chart={OverviewChart.MedianResolutionTimeTrendCard}
                            config={SupportPerformanceOverviewReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell
                        size={getGridCellSize(customerExperienceLayout[2])}
                    >
                        <DashboardComponent
                            chart={OverviewChart.MessagesPerTicketTrendCard}
                            config={SupportPerformanceOverviewReportConfig}
                        />
                    </DashboardGridCell>
                    {isHrtAiEnabled && (
                        <>
                            <DashboardGridCell
                                size={getGridCellSize(
                                    customerExperienceLayout[3],
                                )}
                            >
                                <DashboardComponent
                                    chart={
                                        OverviewChart.MedianFirstResponseTimeTrendCard
                                    }
                                    config={
                                        SupportPerformanceOverviewReportConfig
                                    }
                                />
                            </DashboardGridCell>
                            <DashboardGridCell
                                size={getGridCellSize(
                                    customerExperienceLayout[4],
                                )}
                            >
                                <DashboardComponent
                                    chart={
                                        OverviewChart.HumanResponseTimeAfterAiHandoffCard
                                    }
                                    config={
                                        SupportPerformanceOverviewReportConfig
                                    }
                                />
                            </DashboardGridCell>
                        </>
                    )}
                </DashboardSection>

                <DashboardSection title="Workload">
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
                            chart={OverviewChart.TicketsCreatedVsClosedChart}
                            config={SupportPerformanceOverviewReportConfig}
                        />
                    </DashboardGridCell>
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
