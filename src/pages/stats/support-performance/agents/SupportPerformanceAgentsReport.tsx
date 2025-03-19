import { useCleanStatsFilters } from 'hooks/reporting/useCleanStatsFilters'
import { useGridSize } from 'hooks/useGridSize'
import { FilterKey } from 'models/stat/types'
import { AnalyticsFooter } from 'pages/stats/AnalyticsFooter'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import { DashboardComponent } from 'pages/stats/dashboards/DashboardComponent'
import DashboardSection from 'pages/stats/DashboardSection'
import StatsPage from 'pages/stats/StatsPage'
import { AGENTS_SHOUT_OUTS_TITLE } from 'pages/stats/support-performance/agents/AgentsShoutOutsConfig'
import { DownloadAgentsPerformanceDataButton } from 'pages/stats/support-performance/agents/DownloadAgentsPerformanceDataButton'
import {
    AgentsChart,
    SupportPerformanceAgentsReportConfig,
} from 'pages/stats/support-performance/agents/SupportPerformanceAgentsReportConfig'

export const AGENTS_PAGE_TITLE = 'Agents'

export default function SupportPerformanceAgentsReport() {
    const getGridCellSize = useGridSize()
    useCleanStatsFilters()

    return (
        <div className="full-width">
            <StatsPage
                title={AGENTS_PAGE_TITLE}
                titleExtra={
                    <>
                        <DownloadAgentsPerformanceDataButton />
                    </>
                }
            >
                <DashboardSection>
                    <DashboardGridCell
                        size={getGridCellSize(12)}
                        className="pb-0"
                    >
                        <FiltersPanelWrapper
                            persistentFilters={
                                SupportPerformanceAgentsReportConfig
                                    .reportFilters.persistent
                            }
                            optionalFilters={
                                SupportPerformanceAgentsReportConfig
                                    .reportFilters.optional
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
                    title={AGENTS_SHOUT_OUTS_TITLE}
                    className="pb-0"
                >
                    <DashboardGridCell size={getGridCellSize(3)}>
                        <DashboardComponent
                            chart={AgentsChart.TopCSATPerformers}
                            config={SupportPerformanceAgentsReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={getGridCellSize(3)}>
                        <DashboardComponent
                            chart={AgentsChart.TopFirstResponseTimePerformers}
                            config={SupportPerformanceAgentsReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={getGridCellSize(3)}>
                        <DashboardComponent
                            chart={AgentsChart.TopResponseTimePerformers}
                            config={SupportPerformanceAgentsReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={getGridCellSize(3)}>
                        <DashboardComponent
                            chart={AgentsChart.TopClosedTicketsPerformers}
                            config={SupportPerformanceAgentsReportConfig}
                        />
                    </DashboardGridCell>
                </DashboardSection>
                <DashboardSection>
                    <DashboardGridCell size={12}>
                        <DashboardComponent
                            chart={AgentsChart.Table}
                            config={SupportPerformanceAgentsReportConfig}
                        />
                    </DashboardGridCell>
                </DashboardSection>
                <AnalyticsFooter />
            </StatsPage>
        </div>
    )
}
