import React from 'react'
import StatsPage from 'pages/stats/StatsPage'
import {useGridSize} from 'hooks/useGridSize'
import {FilterKey} from 'models/stat/types'
import DashboardSection from 'pages/stats/DashboardSection'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import {FiltersPanel} from 'pages/stats/common/filters/FiltersPanel'
import {TagsTrendChart} from 'pages/stats/ticket-insights/components/TagsTrendChart'

export const TAGS_TITLE = 'Tags'

export function Tags() {
    const getGridCellSize = useGridSize()

    return (
        <div className="full-width">
            <StatsPage title={TAGS_TITLE}>
                <DashboardSection>
                    <DashboardGridCell
                        size={getGridCellSize(12)}
                        className="pb-0"
                    >
                        <FiltersPanel
                            persistentFilters={[FilterKey.Period]}
                            optionalFilters={[
                                FilterKey.Channels,
                                FilterKey.Integrations,
                                FilterKey.Tags,
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
                        size={getGridCellSize(12)}
                        className="pb-0"
                    >
                        <TagsTrendChart />
                    </DashboardGridCell>
                </DashboardSection>
            </StatsPage>
        </div>
    )
}
