import {automateDefaultFilters} from 'models/reporting/queryFactories/support-performance/firstResponseTimeWithAutomateFeaturesQueryFactory'
import {AutomationBillingEventMeasure} from 'models/reporting/cubes/AutomationBillingEventCube'
import {StatsFilters} from 'models/stat/types'

export const overallTimeSavedQueryFactory = (
    filters: StatsFilters,
    timezone: string
) => ({
    measures: [AutomationBillingEventMeasure.OverallTimeSaved],
    dimensions: [],
    timezone,
    filters: automateDefaultFilters(filters),
})
