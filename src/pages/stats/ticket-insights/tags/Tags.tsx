import React from 'react'
import {AnalyticsFooter} from 'pages/stats/AnalyticsFooter'
import {useCleanStatsFiltersWithLogicalOperators} from 'hooks/reporting/useCleanStatsFilters'
import useAppSelector from 'hooks/useAppSelector'
import {useGridSize} from 'hooks/useGridSize'
import {FilterKey} from 'models/stat/types'
import {FiltersPanel} from 'pages/stats/common/filters/FiltersPanel'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import DashboardSection from 'pages/stats/DashboardSection'
import StatsPage from 'pages/stats/StatsPage'
import {AllUsedTagsTableChart} from 'pages/stats/ticket-insights/tags/AllUsedTagsTableChart'
import {TagsReportDownloadDataButton} from 'pages/stats/ticket-insights/tags/TagsReportDownloadDataButton'
import {TagsTrendChart} from 'pages/stats/ticket-insights/tags/TagsTrendChart'
import {TopUsedTagsChart} from 'pages/stats/ticket-insights/tags/TopUsedTagsChart'
import {getPageStatsFiltersWithLogicalOperators} from 'state/stats/selectors'

export const TAGS_TITLE = 'Tags'

export function Tags() {
    const getGridCellSize = useGridSize()
    const statsFilters = useAppSelector(getPageStatsFiltersWithLogicalOperators)
    useCleanStatsFiltersWithLogicalOperators(statsFilters)

    return (
        <div className="full-width">
            <StatsPage
                title={TAGS_TITLE}
                titleExtra={<TagsReportDownloadDataButton />}
            >
                <DashboardSection>
                    <DashboardGridCell
                        size={getGridCellSize(12)}
                        className="pb-0"
                    >
                        <FiltersPanel
                            persistentFilters={[
                                FilterKey.Period,
                                FilterKey.AggregationWindow,
                            ]}
                            optionalFilters={[
                                FilterKey.Agents,
                                FilterKey.Channels,
                                FilterKey.Integrations,
                                FilterKey.Tags,
                                FilterKey.CustomFields,
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

                <DashboardSection>
                    <DashboardGridCell
                        size={getGridCellSize(1)}
                        className="pb-0"
                    >
                        <TopUsedTagsChart />
                    </DashboardGridCell>
                    <DashboardGridCell
                        size={getGridCellSize(11)}
                        className="pb-0"
                    >
                        <TagsTrendChart />
                    </DashboardGridCell>
                    <DashboardGridCell>
                        <AllUsedTagsTableChart />
                    </DashboardGridCell>
                </DashboardSection>
            </StatsPage>
            <AnalyticsFooter />
        </div>
    )
}
