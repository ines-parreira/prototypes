import uniq from 'lodash/uniq'

import {useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters} from 'hooks/reporting/common/useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters'
import {StaticFilter} from 'models/stat/types'
import {OptionalFilter} from 'pages/stats/common/filters/FiltersPanel'
import {getComponentConfig} from 'pages/stats/custom-reports/CustomReportChart'
import {CustomReportSchema} from 'pages/stats/custom-reports/types'
import {getChildrenOfTypeChart} from 'pages/stats/custom-reports/utils'

function getFiltersByConfigId(chartId: string) {
    const {config} = getComponentConfig(chartId)

    return {
        persistentFilters: config?.reportFilters.persistent || [],
        optionalFilters: config?.reportFilters.optional || [],
    }
}

export function useFiltersFromDashboard(dashboard: CustomReportSchema) {
    const persistentFilters: StaticFilter[] = []
    const optionalFilters: OptionalFilter[] = []

    const charts = getChildrenOfTypeChart(dashboard)
    charts.forEach((chart) => {
        const reportsFilters = getFiltersByConfigId(chart.config_id)
        persistentFilters.push(...reportsFilters.persistentFilters)
        optionalFilters.push(...reportsFilters.optionalFilters)
    })

    const optionalFiltersWithAutoQaAndSatisfactionScore =
        useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters(
            optionalFilters
        )

    return {
        persistentFilters: uniq(persistentFilters),
        optionalFilters: uniq(optionalFiltersWithAutoQaAndSatisfactionScore),
    }
}
