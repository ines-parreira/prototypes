import { useCustomAgentUnavailableStatusesFlag } from '@repo/agent-status'
import { useGridSize } from '@repo/hooks'
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom'

import { useCleanStatsFilters } from 'domains/reporting/hooks/useCleanStatsFilters'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { AnalyticsFooter } from 'domains/reporting/pages/common/AnalyticsFooter'
import FiltersPanelWrapper from 'domains/reporting/pages/common/filters/FiltersPanelWrapper'
import DashboardGridCell from 'domains/reporting/pages/common/layout/DashboardGridCell'
import DashboardSection from 'domains/reporting/pages/common/layout/DashboardSection'
import StatsPage from 'domains/reporting/pages/common/layout/StatsPage'
import { DashboardComponent } from 'domains/reporting/pages/dashboards/DashboardComponent'
import { AGENTS_SHOUT_OUTS_TITLE } from 'domains/reporting/pages/support-performance/agents/AgentsShoutOutsConfig'
import { DownloadAgentsAvailabilityButton } from 'domains/reporting/pages/support-performance/agents/DownloadAgentsAvailabilityButton'
import { DownloadAgentsPerformanceDataButton } from 'domains/reporting/pages/support-performance/agents/DownloadAgentsPerformanceDataButton'
import {
    AgentsChart,
    SupportPerformanceAgentsReportConfig,
} from 'domains/reporting/pages/support-performance/agents/SupportPerformanceAgentsReportConfig'

export const AGENTS_PAGE_TITLE = 'Agents'

export default function SupportPerformanceAgentsReport() {
    const { path } = useRouteMatch()
    const getGridCellSize = useGridSize()
    const isAgentAvailabilityEnabled = useCustomAgentUnavailableStatusesFlag()
    useCleanStatsFilters()

    return (
        <div className="full-width">
            <StatsPage
                title={AGENTS_PAGE_TITLE}
                titleExtra={
                    <Switch>
                        <Route path={`${path}/performance`}>
                            <DownloadAgentsPerformanceDataButton />
                        </Route>
                        {isAgentAvailabilityEnabled && (
                            <Route path={`${path}/availability`}>
                                <DownloadAgentsAvailabilityButton />
                            </Route>
                        )}
                    </Switch>
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
                <Switch>
                    <Redirect exact from={path} to={`${path}/performance`} />
                </Switch>
            </StatsPage>
        </div>
    )
}
