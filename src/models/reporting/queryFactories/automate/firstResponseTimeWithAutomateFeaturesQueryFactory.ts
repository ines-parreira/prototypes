import {AutomationBillingEventMeasure} from 'models/reporting/cubes/automate/AutomationBillingEventCube'
import {StatsFilters} from 'models/stat/types'
import {automateDefaultFilters} from 'models/reporting/queryFactories/automate/filters'

export const firstResponseTimeWithAutomateFeaturesQueryFactory = (
    filters: StatsFilters,
    timezone: string
) => ({
    measures: [
        AutomationBillingEventMeasure.FirstResponseTimeWithAutomateFeatures,
    ],
    dimensions: [],
    timezone,
    filters: automateDefaultFilters(filters),
})
