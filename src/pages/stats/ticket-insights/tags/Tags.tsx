import React from 'react'

import {useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters} from 'hooks/reporting/common/useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters'
import {useCleanStatsFiltersWithLogicalOperators} from 'hooks/reporting/useCleanStatsFilters'
import useAppSelector from 'hooks/useAppSelector'
import {useGridSize} from 'hooks/useGridSize'
import {FilterKey} from 'models/stat/types'
import {AnalyticsFooter} from 'pages/stats/AnalyticsFooter'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import {CustomReportComponent} from 'pages/stats/custom-reports/CustomReportComponent'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import DashboardSection from 'pages/stats/DashboardSection'
import StatsPage from 'pages/stats/StatsPage'
import {
    TicketInsightsTagsChart,
    TicketInsightsTagsReportConfig,
} from 'pages/stats/ticket-insights/tags/TagsReportConfig'
import {TagsReportDownloadDataButton} from 'pages/stats/ticket-insights/tags/TagsReportDownloadDataButton'
import {getPageStatsFiltersWithLogicalOperators} from 'state/stats/selectors'

export function Tags() {
    const tagsOptionalFilters =
        useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters(
            TicketInsightsTagsReportConfig.reportFilters.optional
        )
    const getGridCellSize = useGridSize()
    const statsFilters = useAppSelector(getPageStatsFiltersWithLogicalOperators)
    useCleanStatsFiltersWithLogicalOperators(statsFilters)

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
                            optionalFilters={tagsOptionalFilters}
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
                        size={getGridCellSize(1)}
                        className="pb-0"
                    >
                        <CustomReportComponent
                            chart={TicketInsightsTagsChart.TopUsedTagsChart}
                            config={TicketInsightsTagsReportConfig}
                            activateActionsMenu
                        />
                    </DashboardGridCell>
                    <DashboardGridCell
                        size={getGridCellSize(11)}
                        className="pb-0"
                    >
                        <CustomReportComponent
                            chart={TicketInsightsTagsChart.TagsTrendChart}
                            config={TicketInsightsTagsReportConfig}
                            activateActionsMenu
                        />
                    </DashboardGridCell>
                    <DashboardGridCell>
                        <CustomReportComponent
                            chart={
                                TicketInsightsTagsChart.AllUsedTagsTableChart
                            }
                            config={TicketInsightsTagsReportConfig}
                            activateActionsMenu
                        />
                    </DashboardGridCell>
                </DashboardSection>
            </StatsPage>
            <AnalyticsFooter />
        </div>
    )
}
