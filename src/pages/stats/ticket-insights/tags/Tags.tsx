import React from 'react'

import { useCleanStatsFilters } from 'hooks/reporting/useCleanStatsFilters'
import { useGridSize } from 'hooks/useGridSize'
import { FilterKey } from 'models/stat/types'
import { AnalyticsFooter } from 'pages/stats/AnalyticsFooter'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import { DashboardComponent } from 'pages/stats/dashboards/DashboardComponent'
import DashboardSection from 'pages/stats/DashboardSection'
import StatsPage from 'pages/stats/StatsPage'
import {
    TicketInsightsTagsChart,
    TicketInsightsTagsReportConfig,
} from 'pages/stats/ticket-insights/tags/TagsReportConfig'
import { TagsReportDownloadDataButton } from 'pages/stats/ticket-insights/tags/TagsReportDownloadDataButton'

export function Tags() {
    const getGridCellSize = useGridSize()
    useCleanStatsFilters()

    return (
        <div className="full-width">
            <StatsPage
                title={TicketInsightsTagsReportConfig.reportName}
                titleExtra={<TagsReportDownloadDataButton />}
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
