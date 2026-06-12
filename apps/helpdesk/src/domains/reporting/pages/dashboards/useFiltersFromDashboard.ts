import uniq from 'lodash/uniq'

import type { StaticFilter } from 'domains/reporting/models/stat/types'
import type { OptionalFilter } from 'domains/reporting/pages/common/filters/FiltersPanel'
import { getComponentConfig } from 'domains/reporting/pages/dashboards/config'
import type { DashboardSchema } from 'domains/reporting/pages/dashboards/types'
import { getChildrenOfTypeChart } from 'domains/reporting/pages/dashboards/utils'

function getFiltersByConfigId(chartId: string) {
    const { reportConfig } = getComponentConfig(chartId)

    return {
        persistentFilters: reportConfig?.reportFilters.persistent || [],
        optionalFilters: reportConfig?.reportFilters.optional || [],
    }
}

export function useFiltersFromDashboard(dashboard: DashboardSchema) {
    const persistentFilters: StaticFilter[] = []
    const optionalFilters: OptionalFilter[] = []

    const charts = getChildrenOfTypeChart(dashboard)
    charts.forEach((chart) => {
        const reportsFilters = getFiltersByConfigId(chart.config_id)
        persistentFilters.push(...reportsFilters.persistentFilters)
        optionalFilters.push(...reportsFilters.optionalFilters)
    })

    return {
        persistentFilters: uniq(persistentFilters),
        optionalFilters: uniq(optionalFilters),
    }
}
