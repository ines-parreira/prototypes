import React from 'react'

import { useCleanStatsFiltersWithLogicalOperators } from 'hooks/reporting/useCleanStatsFilters'
import useAppSelector from 'hooks/useAppSelector'
import { useGridSize } from 'hooks/useGridSize'
import { FilterKey } from 'models/stat/types'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import {
    DashboardChart,
    DashboardChartProps,
} from 'pages/stats/dashboards/DashboardChart'
import { DashboardsRow } from 'pages/stats/dashboards/DashboardsRow'
import { DashboardsSection } from 'pages/stats/dashboards/DashboardsSection'
import {
    DraggablePreview,
    Dropzone,
} from 'pages/stats/dashboards/DraggableGridCell'
import {
    DashboardChild,
    DashboardChildType,
    DashboardSchema,
} from 'pages/stats/dashboards/types'
import { useFiltersFromDashboard } from 'pages/stats/dashboards/useFiltersFromDashboard'
import { updateChartPosition } from 'pages/stats/dashboards/utils'
import DashboardSection from 'pages/stats/DashboardSection'
import { getPageStatsFiltersWithLogicalOperators } from 'state/stats/selectors'

type Props = {
    dashboard: DashboardSchema
    onChartMove: (dashboard: DashboardSchema) => void
    onChartMoveEnd: () => void
}

export const Dashboard = ({
    dashboard,
    onChartMove,
    onChartMoveEnd,
}: Props) => {
    const getGridCellSize = useGridSize()

    const pageStatsFiltersWithLogicalOperators = useAppSelector(
        getPageStatsFiltersWithLogicalOperators,
    )
    useCleanStatsFiltersWithLogicalOperators(
        pageStatsFiltersWithLogicalOperators,
    )
    const { persistentFilters, optionalFilters } =
        useFiltersFromDashboard(dashboard)

    const moveChart = (
        srcId: string,
        targetId: string,
        position: 'after' | 'before',
    ) => {
        onChartMove(updateChartPosition(dashboard, srcId, targetId, position))
    }

    const handleDrop = () => {
        onChartMoveEnd()
    }

    const _findChartIndex = (chartId: string): number =>
        findChartIndex(dashboard, chartId)

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
            <Dropzone schemas={dashboard.children} onMove={moveChart} />
            {renderDashboard(dashboard, {
                onMove: moveChart,
                onDrop: handleDrop,
                findChartIndex: _findChartIndex,
            })}
            <DraggablePreview />
        </>
    )
}

export const findChartIndex = (
    dashboard: DashboardSchema,
    chartId: string,
): number => {
    const traverse = (children: DashboardChild[]): number => {
        for (let i = 0; i < children.length; i++) {
            const node = children[i]

            if (
                node.type === DashboardChildType.Chart &&
                node.config_id === chartId
            ) {
                return i
            }

            if (
                node.type === DashboardChildType.Section ||
                node.type === DashboardChildType.Row
            ) {
                const result = traverse(node.children)
                if (result !== -1) return result
            }
        }
        return -1
    }

    return traverse(dashboard.children)
}

const renderDashboard = (
    dashboard: DashboardSchema,
    chartProps: Pick<
        DashboardChartProps,
        'onMove' | 'onDrop' | 'findChartIndex'
    >,
) => {
    const renderChildren = (children: DashboardChild[]) =>
        children.map((child: DashboardChild, index: number) => {
            const key = `${child.type}-${index}`

            switch (child.type) {
                case DashboardChildType.Row:
                    return (
                        <DashboardsRow
                            key={key}
                            charts={child.children}
                            onMove={chartProps.onMove}
                        >
                            {renderChildren(child.children)}
                        </DashboardsRow>
                    )

                case DashboardChildType.Section:
                    return (
                        <DashboardsSection schema={child} key={child.type}>
                            {renderChildren(child.children)}
                        </DashboardsSection>
                    )

                case DashboardChildType.Chart:
                    return (
                        <DashboardChart
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
