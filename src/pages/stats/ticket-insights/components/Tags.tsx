import React from 'react'
import StatsPage from 'pages/stats/StatsPage'
import {useGridSize} from 'hooks/useGridSize'
import {FilterKey} from 'models/stat/types'
import DashboardSection from 'pages/stats/DashboardSection'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import {FiltersPanel} from 'pages/stats/common/filters/FiltersPanel'

export const NEW_TAGS_TITLE = 'Tags'

export function Tags() {
    const getGridCellSize = useGridSize()

    return (
        <div className="full-width">
            <StatsPage title={NEW_TAGS_TITLE}>
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
            </StatsPage>
        </div>
    )
}
