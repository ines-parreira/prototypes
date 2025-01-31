import React from 'react'

import {useCleanStatsFiltersWithLogicalOperators} from 'hooks/reporting/useCleanStatsFilters'
import useAppSelector from 'hooks/useAppSelector'

import {useGridSize} from 'hooks/useGridSize'
import {FilterKey} from 'models/stat/types'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import {
    CustomReportChart,
    CustomReportChartProps,
} from 'pages/stats/custom-reports/CustomReportChart'
import {CustomReportRow} from 'pages/stats/custom-reports/CustomReportRow'
import {CustomReportSection} from 'pages/stats/custom-reports/CustomReportSection'
import {DraggablePreview} from 'pages/stats/custom-reports/DraggableGridCell'
import {
    CustomReportChild,
    CustomReportChildType,
    CustomReportSchema,
} from 'pages/stats/custom-reports/types'
import {useFiltersFromDashboard} from 'pages/stats/custom-reports/useFiltersFromDashboard'
import {updateChartPosition} from 'pages/stats/custom-reports/utils'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import DashboardSection from 'pages/stats/DashboardSection'
import {getPageStatsFiltersWithLogicalOperators} from 'state/stats/selectors'

type Props = {
    customReport: CustomReportSchema
    onChartMove: (dashboard: CustomReportSchema) => void
    onChartMoveEnd: () => void
}

export const CustomReport = ({
    customReport: dashboard,
    onChartMove,
    onChartMoveEnd,
}: Props) => {
    const getGridCellSize = useGridSize()

    const pageStatsFiltersWithLogicalOperators = useAppSelector(
        getPageStatsFiltersWithLogicalOperators
    )
    useCleanStatsFiltersWithLogicalOperators(
        pageStatsFiltersWithLogicalOperators
    )
    const {persistentFilters, optionalFilters} =
        useFiltersFromDashboard(dashboard)

    const moveChart = (
        srcId: string,
        targetId: string,
        position: 'after' | 'before'
    ) => {
        onChartMove(updateChartPosition(dashboard, srcId, targetId, position))
    }

    const handleDrop = () => {
        onChartMoveEnd()
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
            {renderDashboard(dashboard, {
                onMove: moveChart,
                onDrop: handleDrop,
            })}
            <DraggablePreview />
        </>
    )
}

const renderDashboard = (
    dashboard: CustomReportSchema,
    chartProps: Pick<CustomReportChartProps, 'onMove' | 'onDrop'>
) => {
    const renderChildren = (children: CustomReportChild[]) =>
        children.map((child: CustomReportChild, index: number) => {
            const key = `${child.type}-${index}`

            switch (child.type) {
                case CustomReportChildType.Row:
                    return (
                        <CustomReportRow key={key}>
                            {renderChildren(child.children)}
                        </CustomReportRow>
                    )

                case CustomReportChildType.Section:
                    return (
                        <CustomReportSection schema={child} key={child.type}>
                            {renderChildren(child.children)}
                        </CustomReportSection>
                    )

                case CustomReportChildType.Chart:
                    return (
                        <CustomReportChart
                            key={child.config_id}
                            schema={child}
                            dashboard={dashboard}
                            {...chartProps}
                        />
                    )
            }
        })

    return renderChildren(dashboard.children)
}
