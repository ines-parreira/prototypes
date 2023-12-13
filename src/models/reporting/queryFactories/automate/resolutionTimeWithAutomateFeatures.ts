import {automateDefaultFilters} from 'models/reporting/queryFactories/support-performance/firstResponseTimeWithAutomateFeaturesQueryFactory'
import {AutomationBillingEventMeasure} from 'models/reporting/cubes/AutomationBillingEventCube'
import {StatsFilters} from 'models/stat/types'

export const resolutionTimeWithAutomateFeaturesQueryFactory = (
    filters: StatsFilters,
    timezone: string
) => ({
    measures: [
        AutomationBillingEventMeasure.ResolutionTimeWithAutomateFeatures,
    ],
    dimensions: [],
    timezone,
    filters: automateDefaultFilters(filters),
})
