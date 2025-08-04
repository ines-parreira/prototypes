import { useGridSize } from '@repo/hooks'

import { useCleanStatsFilters } from 'domains/reporting/hooks/useCleanStatsFilters'
import { FilterKey } from 'domains/reporting/models/stat/types'
import FiltersPanelWrapper, {
    FiltersPanelWrapperProps,
} from 'domains/reporting/pages/common/filters/FiltersPanelWrapper/FiltersPanelWrapper'
import DashboardGridCell from 'domains/reporting/pages/common/layout/DashboardGridCell'
import DashboardSection from 'domains/reporting/pages/common/layout/DashboardSection'
import {
    DashboardChart,
    DashboardChartProps,
} from 'domains/reporting/pages/dashboards/DashboardChart'
import { DashboardsRow } from 'domains/reporting/pages/dashboards/DashboardsRow'
import { DashboardsSection } from 'domains/reporting/pages/dashboards/DashboardsSection'
import {
    DraggablePreview,
    Dropzone,
} from 'domains/reporting/pages/dashboards/DraggableGridCell'
import {
    DashboardChild,
    DashboardChildType,
    DashboardSchema,
} from 'domains/reporting/pages/dashboards/types'
import { useFiltersFromDashboard } from 'domains/reporting/pages/dashboards/useFiltersFromDashboard'
import { updateChartPosition } from 'domains/reporting/pages/dashboards/utils'

export type DashboardProps = {
    dashboard: DashboardSchema
    pinnedFilter: FiltersPanelWrapperProps['pinnedFilter']
    onChartMove: (dashboard: DashboardSchema) => void
    onChartMoveEnd: () => void
}

export const Dashboard = ({
    dashboard,
    pinnedFilter,
    onChartMove,
    onChartMoveEnd,
}: DashboardProps) => {
    const getGridCellSize = useGridSize()

    useCleanStatsFilters()
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
                        pinnedFilter={pinnedFilter}
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
