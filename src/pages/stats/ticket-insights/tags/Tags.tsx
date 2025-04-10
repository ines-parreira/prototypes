import { useFlags } from 'launchdarkly-react-client-sdk'

import { FeatureFlagKey } from 'config/featureFlags'
import { useCleanStatsFilters } from 'hooks/reporting/useCleanStatsFilters'
import { useGridSize } from 'hooks/useGridSize'
import { FilterKey } from 'models/stat/types'
import { AnalyticsFooter } from 'pages/stats/common/AnalyticsFooter'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import DashboardGridCell from 'pages/stats/common/layout/DashboardGridCell'
import DashboardSection from 'pages/stats/common/layout/DashboardSection'
import StatsPage from 'pages/stats/common/layout/StatsPage'
import { DashboardComponent } from 'pages/stats/dashboards/DashboardComponent'
import { TagsActionMenu } from 'pages/stats/ticket-insights/tags/TagsActionMenu'
import {
    TicketInsightsTagsChart,
    TicketInsightsTagsReportConfig,
} from 'pages/stats/ticket-insights/tags/TagsReportConfig'
import { TagsReportDownloadDataButton } from 'pages/stats/ticket-insights/tags/TagsReportDownloadDataButton'

export function Tags() {
    const featureFlags = useFlags()

    const getGridCellSize = useGridSize()
    useCleanStatsFilters()

    const isReportingFilteringAndCalculationsTagsReportEnabled =
        !!featureFlags[
            FeatureFlagKey.ReportingFilteringAndCalculationsTagsReport
        ]
    const isReportingExtendFieldAndTagEnabled =
        !!featureFlags[FeatureFlagKey.ReportingExtendFieldAndTag]

    return (
        <div className="full-width">
            <StatsPage
                title={TicketInsightsTagsReportConfig.reportName}
                titleExtra={
                    isReportingFilteringAndCalculationsTagsReportEnabled ||
                    isReportingExtendFieldAndTagEnabled ? (
                        <TagsActionMenu />
                    ) : (
                        <TagsReportDownloadDataButton />
                    )
                }
            >
                <DashboardSection>
                    <DashboardGridCell
                        size={getGridCellSize(12)}
                        className="pb-0"
                    >
                        <FiltersPanelWrapper
                            persistentFilters={
                                TicketInsightsTagsReportConfig.reportFilters
                                    .persistent
                            }
                            optionalFilters={
                                TicketInsightsTagsReportConfig.reportFilters
                                    .optional
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

                <DashboardSection>
                    <DashboardGridCell
                        size={getGridCellSize(4)}
                        className="pb-0"
                    >
                        <DashboardComponent
                            chart={TicketInsightsTagsChart.TopUsedTagsChart}
                            config={TicketInsightsTagsReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell
                        size={getGridCellSize(8)}
                        className="pb-0"
                    >
                        <DashboardComponent
                            chart={TicketInsightsTagsChart.TagsTrendChart}
                            config={TicketInsightsTagsReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell>
                        <DashboardComponent
                            chart={
                                TicketInsightsTagsChart.AllUsedTagsTableChart
                            }
                            config={TicketInsightsTagsReportConfig}
                        />
                    </DashboardGridCell>
                </DashboardSection>
            </StatsPage>
            <AnalyticsFooter />
        </div>
    )
}
