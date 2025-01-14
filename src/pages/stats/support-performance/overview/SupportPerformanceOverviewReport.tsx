import {useFlags} from 'launchdarkly-react-client-sdk'
import React from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters} from 'hooks/reporting/common/useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters'
import {useGridSize} from 'hooks/useGridSize'
import useLocalStorage from 'hooks/useLocalStorage'
import {FilterKey} from 'models/stat/types'
import {AnalyticsFooter} from 'pages/stats/AnalyticsFooter'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import {CustomReportComponent} from 'pages/stats/custom-reports/CustomReportComponent'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import DashboardSection from 'pages/stats/DashboardSection'
import StatsPage from 'pages/stats/StatsPage'
import {DownloadOverviewData} from 'pages/stats/support-performance/overview/DownloadOverviewData'
import {
    PERFORMANCE_OVERVIEW_OPTIONAL_FILTERS,
    STATS_TIPS_VISIBILITY_KEY,
} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'
import {
    OverviewChart,
    SupportPerformanceOverviewReportConfig,
} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewReportConfig'
import {SupportPerformanceFilters} from 'pages/stats/support-performance/SupportPerformanceFilters'
import TipsToggle from 'pages/stats/TipsToggle'

export default function SupportPerformanceOverviewReport() {
    const isAnalyticsNewFilters =
        !!useFlags()[FeatureFlagKey.AnalyticsNewFilters]
    const supportPerformanceOverviewOptionalFilters =
        useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters(
            PERFORMANCE_OVERVIEW_OPTIONAL_FILTERS
        )
    const [areTipsVisible, setAreTipsVisible] = useLocalStorage(
        STATS_TIPS_VISIBILITY_KEY,
        true
    )
    const getGridCellSize = useGridSize()

    return (
        <div className="full-width">
            <StatsPage
                title={SupportPerformanceOverviewReportConfig.reportName}
                titleExtra={
                    <>
                        <SupportPerformanceFilters
                            hidden={isAnalyticsNewFilters}
                        />
                        <DownloadOverviewData />
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
                                persistentFilters={[
                                    FilterKey.Period,
                                    FilterKey.AggregationWindow,
                                ]}
                                optionalFilters={[
                                    ...supportPerformanceOverviewOptionalFilters,
                                ]}
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
                    title="Customer experience"
                    titleExtra={
                        <TipsToggle
                            isVisible={!!areTipsVisible}
                            onClick={() => setAreTipsVisible(!areTipsVisible)}
                        />
                    }
                >
                    <DashboardGridCell size={getGridCellSize(3)}>
                        <CustomReportComponent
                            chart={OverviewChart.CustomerSatisfactionTrendCard}
                            config={SupportPerformanceOverviewReportConfig}
                            activateActionsMenu
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={getGridCellSize(3)}>
                        <CustomReportComponent
                            chart={
                                OverviewChart.MedianFirstResponseTimeTrendCard
                            }
                            config={SupportPerformanceOverviewReportConfig}
                            activateActionsMenu
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={getGridCellSize(3)}>
                        <CustomReportComponent
                            chart={OverviewChart.MedianResolutionTimeTrendCard}
                            config={SupportPerformanceOverviewReportConfig}
                            activateActionsMenu
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={getGridCellSize(3)}>
                        <CustomReportComponent
                            chart={OverviewChart.MessagesPerTicketTrendCard}
                            config={SupportPerformanceOverviewReportConfig}
                            activateActionsMenu
                        />
                    </DashboardGridCell>
                </DashboardSection>

                <DashboardSection title="Workload">
                    <>
                        <DashboardGridCell size={getGridCellSize(4)}>
                            <CustomReportComponent
                                chart={OverviewChart.TicketsCreatedTrendCard}
                                config={SupportPerformanceOverviewReportConfig}
                                activateActionsMenu
                            />
                        </DashboardGridCell>
                        <DashboardGridCell size={getGridCellSize(4)}>
                            <CustomReportComponent
                                chart={OverviewChart.TicketsClosedTrendCard}
                                config={SupportPerformanceOverviewReportConfig}
                                activateActionsMenu
                            />
                        </DashboardGridCell>
                        <DashboardGridCell size={getGridCellSize(4)}>
                            <CustomReportComponent
                                chart={OverviewChart.OpenTicketsTrendCard}
                                config={SupportPerformanceOverviewReportConfig}
                                activateActionsMenu
                            />
                        </DashboardGridCell>
                        <DashboardGridCell size={12}>
                            <CustomReportComponent
                                chart={
                                    OverviewChart.TicketsCreatedVsClosedChart
                                }
                                config={SupportPerformanceOverviewReportConfig}
                                activateActionsMenu
                            />
                        </DashboardGridCell>
                    </>
                    <DashboardGridCell size={12}>
                        <CustomReportComponent
                            chart={OverviewChart.WorkloadPerChannelChart}
                            config={SupportPerformanceOverviewReportConfig}
                            activateActionsMenu
                        />
                    </DashboardGridCell>
                </DashboardSection>

                <DashboardSection title="Productivity">
                    <DashboardGridCell size={getGridCellSize(3)}>
                        <CustomReportComponent
                            chart={OverviewChart.TicketsRepliedTrendCard}
                            config={SupportPerformanceOverviewReportConfig}
                            activateActionsMenu
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={getGridCellSize(3)}>
                        <CustomReportComponent
                            chart={OverviewChart.MessagesSentTrendCard}
                            config={SupportPerformanceOverviewReportConfig}
                            activateActionsMenu
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={getGridCellSize(3)}>
                        <CustomReportComponent
                            chart={OverviewChart.TicketHandleTimeTrendCard}
                            config={SupportPerformanceOverviewReportConfig}
                            activateActionsMenu
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={getGridCellSize(3)}>
                        <CustomReportComponent
                            chart={OverviewChart.OneTouchTicketsTrendCard}
                            config={SupportPerformanceOverviewReportConfig}
                            activateActionsMenu
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={getGridCellSize(6)}>
                        <CustomReportComponent
                            chart={OverviewChart.TicketsRepliedGraph}
                            config={SupportPerformanceOverviewReportConfig}
                            activateActionsMenu
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={getGridCellSize(6)}>
                        <CustomReportComponent
                            chart={OverviewChart.MessagesSentGraph}
                            config={SupportPerformanceOverviewReportConfig}
                            activateActionsMenu
                        />
                    </DashboardGridCell>
                </DashboardSection>
                <AnalyticsFooter />
            </StatsPage>
        </div>
    )
}
