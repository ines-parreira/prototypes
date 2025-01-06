import React from 'react'

import {useGridSize} from 'hooks/useGridSize'
import {FilterKey} from 'models/stat/types'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import {CustomReportSchema} from 'pages/stats/custom-reports/types'
import {useFiltersFromDashboard} from 'pages/stats/custom-reports/useFiltersFromDashboard'
import {renderCustomReportChildWithKeys} from 'pages/stats/custom-reports/utils'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import DashboardSection from 'pages/stats/DashboardSection'

type Props = {
    customReport: CustomReportSchema
}

export const CustomReport = ({customReport}: Props) => {
    const getGridCellSize = useGridSize()

    const {persistentFilters, optionalFilters} =
        useFiltersFromDashboard(customReport)

    return (
        <>
            <DashboardSection>
                <DashboardGridCell size={getGridCellSize(12)} className="pb-0">
                    <FiltersPanelWrapper
                        persistentFilters={persistentFilters}
                        optionalFilters={optionalFilters}
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
            {customReport.children.map(renderCustomReportChildWithKeys)}
        </>
    )
}
