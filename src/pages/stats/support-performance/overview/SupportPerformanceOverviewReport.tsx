import React, { useMemo } from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'

import { FeatureFlagKey } from 'config/featureFlags'
import { useCleanStatsFilters } from 'hooks/reporting/useCleanStatsFilters'
import { useGridSize } from 'hooks/useGridSize'
import useLocalStorage from 'hooks/useLocalStorage'
import { FilterKey } from 'models/stat/types'
import { AnalyticsFooter } from 'pages/stats/AnalyticsFooter'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import { DashboardComponent } from 'pages/stats/dashboards/DashboardComponent'
import DashboardSection from 'pages/stats/DashboardSection'
import StatsPage from 'pages/stats/StatsPage'
import { DownloadOverviewData } from 'pages/stats/support-performance/overview/DownloadOverviewData'
import {
    PERFORMANCE_OVERVIEW_OPTIONAL_FILTERS,
    STATS_TIPS_VISIBILITY_KEY,
} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'
import {
    OverviewChart,
    SupportPerformanceOverviewReportConfig,
} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewReportConfig'
import TipsToggle from 'pages/stats/TipsToggle'

const getProductivitySectionKPIWidths = (
    isReportingAverageResponseTimeEnabled: boolean,
    isReportingZeroTouchTicketsMetricEnabled: boolean,
) => {
    let handleTimeWidth = 4
    let firstRowWidth = 3
    let secondRowWidth = 4

    if (
        isReportingAverageResponseTimeEnabled &&
        !isReportingZeroTouchTicketsMetricEnabled
    ) {
        firstRowWidth = 4
        handleTimeWidth = 6
        secondRowWidth = 6
    }
    if (
        !isReportingAverageResponseTimeEnabled &&
        !isReportingZeroTouchTicketsMetricEnabled
    ) {
        handleTimeWidth = 3
        secondRowWidth = 3
    }

    if (isReportingZeroTouchTicketsMetricEnabled) {
        firstRowWidth = 4
    }

    if (
        !isReportingAverageResponseTimeEnabled &&
        isReportingZeroTouchTicketsMetricEnabled
    ) {
        secondRowWidth = 6
    }

    return { handleTimeWidth, firstRowWidth, secondRowWidth }
}

export default function SupportPerformanceOverviewReport() {
    const isReportingMessagesReceivedMetricEnabled =
        !!useFlags()[FeatureFlagKey.ReportingMessagesReceivedMetric]

    const isReportingZeroTouchTicketsMetricEnabled =
        !!useFlags()[FeatureFlagKey.ReportingZeroTouchTicketsMetric]
    const isReportingAverageResponseTimeEnabled =
        !!useFlags()[FeatureFlagKey.ReportingAverageResponseTime]

    const [areTipsVisible, setAreTipsVisible] = useLocalStorage(
        STATS_TIPS_VISIBILITY_KEY,
        true,
    )
    const getGridCellSize = useGridSize()
    useCleanStatsFilters()
    const workloadSectionKPIGridCellSize =
        isReportingMessagesReceivedMetricEnabled ? 3 : 4

    const { handleTimeWidth, firstRowWidth, secondRowWidth } = useMemo(
        () =>
            getProductivitySectionKPIWidths(
                isReportingAverageResponseTimeEnabled,
                isReportingZeroTouchTicketsMetricEnabled,
            ),
        [
            isReportingAverageResponseTimeEnabled,
            isReportingZeroTouchTicketsMetricEnabled,
        ],
    )

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
                                workloadSectionKPIGridCellSize,
                            )}
                        >
                            <DashboardComponent
                                chart={OverviewChart.TicketsCreatedTrendCard}
                                config={SupportPerformanceOverviewReportConfig}
                            />
                        </DashboardGridCell>
                        <DashboardGridCell
                            size={getGridCellSize(
                                workloadSectionKPIGridCellSize,
                            )}
                        >
                            <DashboardComponent
                                chart={OverviewChart.TicketsClosedTrendCard}
                                config={SupportPerformanceOverviewReportConfig}
                            />
                        </DashboardGridCell>
                        <DashboardGridCell
                            size={getGridCellSize(
                                workloadSectionKPIGridCellSize,
                            )}
                        >
                            <DashboardComponent
                                chart={OverviewChart.OpenTicketsTrendCard}
                                config={SupportPerformanceOverviewReportConfig}
                            />
                        </DashboardGridCell>
                        <DashboardGridCell
                            size={getGridCellSize(
                                workloadSectionKPIGridCellSize,
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
                    <DashboardGridCell size={getGridCellSize(firstRowWidth)}>
                        <DashboardComponent
                            chart={OverviewChart.TicketsRepliedTrendCard}
                            config={SupportPerformanceOverviewReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={getGridCellSize(firstRowWidth)}>
                        <DashboardComponent
                            chart={OverviewChart.MessagesSentTrendCard}
                            config={SupportPerformanceOverviewReportConfig}
                        />
                    </DashboardGridCell>
                    {isReportingAverageResponseTimeEnabled && (
                        <DashboardGridCell
                            size={getGridCellSize(firstRowWidth)}
                        >
                            <DashboardComponent
                                chart={
                                    OverviewChart.AverageResponseTimeTrendCard
                                }
                                config={SupportPerformanceOverviewReportConfig}
                            />
                        </DashboardGridCell>
                    )}
                    <DashboardGridCell size={getGridCellSize(handleTimeWidth)}>
                        <DashboardComponent
                            chart={OverviewChart.TicketHandleTimeTrendCard}
                            config={SupportPerformanceOverviewReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={getGridCellSize(secondRowWidth)}>
                        <DashboardComponent
                            chart={OverviewChart.OneTouchTicketsTrendCard}
                            config={SupportPerformanceOverviewReportConfig}
                        />
                    </DashboardGridCell>
                    {isReportingZeroTouchTicketsMetricEnabled && (
                        <DashboardGridCell
                            size={getGridCellSize(secondRowWidth)}
                        >
                            <DashboardComponent
                                chart={OverviewChart.ZeroTouchTicketsTrendCard}
                                config={SupportPerformanceOverviewReportConfig}
                            />
                        </DashboardGridCell>
                    )}
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
