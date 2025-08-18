import { useGridSize } from '@repo/hooks'

import { useCleanStatsFilters } from 'domains/reporting/hooks/useCleanStatsFilters'
import { FilterKey } from 'domains/reporting/models/stat/types'
import FiltersPanelWrapper, {
    FiltersPanelWrapperProps,
} from 'domains/reporting/pages/common/filters/FiltersPanelWrapper/FiltersPanelWrapper'
import DashboardGridCell from 'domains/reporting/pages/common/layout/DashboardGridCell'
import DashboardSection from 'domains/reporting/pages/common/layout/DashboardSection'
import DragAndResizeDashboardGrid from 'domains/reporting/pages/dashboards/DragAndResizeDashboardGrid/DragAndResizeDashboardGrid'
import { DashboardSchema } from 'domains/reporting/pages/dashboards/types'
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
            <DragAndResizeDashboardGrid dashboard={dashboard} />
        </>
    )
}
