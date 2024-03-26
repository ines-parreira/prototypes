import {AutomationBillingEventMeasure} from 'models/reporting/cubes/automate/AutomationBillingEventCube'
import {StatsFilters} from 'models/stat/types'
import {automateDefaultFilters} from 'models/reporting/queryFactories/automate/filters'

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
