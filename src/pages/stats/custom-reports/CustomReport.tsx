import React from 'react'

import {useGridSize} from 'hooks/useGridSize'
import {FilterKey} from 'models/stat/types'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import {CustomReportChart} from 'pages/stats/custom-reports/CustomReportChart'
import {CustomReportRow} from 'pages/stats/custom-reports/CustomReportRow'
import {CustomReportSection} from 'pages/stats/custom-reports/CustomReportSection'
import {
    CustomReportChild,
    CustomReportChildType,
    CustomReportSchema,
} from 'pages/stats/custom-reports/types'
import {useFiltersFromDashboard} from 'pages/stats/custom-reports/useFiltersFromDashboard'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import DashboardSection from 'pages/stats/DashboardSection'

type Props = {
    customReport: CustomReportSchema
}

const renderCustomReportChild = (child: CustomReportChild, key: string) => {
    switch (child.type) {
        case CustomReportChildType.Row:
            return (
                <CustomReportRow key={key}>
                    {child.children.map(renderCustomReportChildWithKeys)}
                </CustomReportRow>
            )
        case CustomReportChildType.Section:
            return (
                <CustomReportSection schema={child} key={child.type}>
                    {child.children.map(renderCustomReportChildWithKeys)}
                </CustomReportSection>
            )
        case CustomReportChildType.Chart: {
            return <CustomReportChart schema={child} key={child.type} />
        }
    }
}

const renderCustomReportChildWithKeys = (
    child: CustomReportChild,
    index: number
) => renderCustomReportChild(child, `${child.type}-${index}`)

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
