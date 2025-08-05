import { useGridSize } from '@repo/hooks'

import { useCleanStatsFilters } from 'domains/reporting/hooks/useCleanStatsFilters'
import { FilterKey } from 'domains/reporting/models/stat/types'
import FiltersPanelWrapper, {
    FiltersPanelWrapperProps,
} from 'domains/reporting/pages/common/filters/FiltersPanelWrapper/FiltersPanelWrapper'
import DashboardGridCell from 'domains/reporting/pages/common/layout/DashboardGridCell'
import DashboardSection from 'domains/reporting/pages/common/layout/DashboardSection'
import { DragAndResizeChart } from 'domains/reporting/pages/dashboards/DragAndResizeChart.tsx/DragAndResizeChart'
import {
    DashboardChild,
    DashboardChildType,
    DashboardSchema,
} from 'domains/reporting/pages/dashboards/types'
import { useFiltersFromDashboard } from 'domains/reporting/pages/dashboards/useFiltersFromDashboard'

export type DashboardProps = {
    dashboard: DashboardSchema
    pinnedFilter: FiltersPanelWrapperProps['pinnedFilter']
}

export const NewDashboard = ({ dashboard, pinnedFilter }: DashboardProps) => {
    const getGridCellSize = useGridSize()

    useCleanStatsFilters()
    const { persistentFilters, optionalFilters } =
        useFiltersFromDashboard(dashboard)

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
            {renderDashboard(dashboard)}
        </>
    )
}

const renderDashboard = (dashboard: DashboardSchema) => {
    const renderChildren = (children: DashboardChild[]) =>
        children.map((child: DashboardChild, index: number) => {
            const key = `${child.type}-${index}`

            switch (child.type) {
                case DashboardChildType.Row:
                    return <div key={key}>{renderChildren(child.children)}</div>

                case DashboardChildType.Section:
                    return <div key={key}>{renderChildren(child.children)}</div>

                case DashboardChildType.Chart:
                    return (
                        <DragAndResizeChart
                            key={child.config_id}
                            schema={child}
                            dashboard={dashboard}
                        />
                    )
            }
        })

    return renderChildren(dashboard.children)
}
