import React, {useState} from 'react'

import {useGridSize} from 'hooks/useGridSize'
import {FilterKey} from 'models/stat/types'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import {move} from 'pages/stats/common/utils'
import {CustomReportChart} from 'pages/stats/custom-reports/CustomReportChart'
import {
    CustomReportChartSchema,
    CustomReportChild,
    CustomReportChildType,
    CustomReportSchema,
} from 'pages/stats/custom-reports/types'
import {useFiltersFromDashboard} from 'pages/stats/custom-reports/useFiltersFromDashboard'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import DashboardSection from 'pages/stats/DashboardSection'

const extractCharts = (children: CustomReportChild[]) => {
    const charts: CustomReportChartSchema[] = []

    children.forEach((child) => {
        switch (child.type) {
            case CustomReportChildType.Chart:
                charts.push(child)
                break

            case CustomReportChildType.Row:
            case CustomReportChildType.Section:
                charts.push(...extractCharts(child.children))
                break
        }
    })

    return charts
}

type Props = {
    customReport: CustomReportSchema
}

export const CustomReport = ({customReport}: Props) => {
    const getGridCellSize = useGridSize()

    const {persistentFilters, optionalFilters} =
        useFiltersFromDashboard(customReport)

    const [charts, setCharts] = useState(() => {
        return extractCharts(customReport.children)
    })

    const moveChart = (srcIndex: number, targetIndex: number) => {
        setCharts((charts) => {
            return move(charts, srcIndex, targetIndex)
        })
    }

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
            <DashboardSection>
                {charts.map((chart, index) => {
                    return (
                        <CustomReportChart
                            key={chart.config_id}
                            schema={chart}
                            order={index}
                            onMove={moveChart}
                            dashboard={customReport}
                        />
                    )
                })}
            </DashboardSection>
        </>
    )
}
