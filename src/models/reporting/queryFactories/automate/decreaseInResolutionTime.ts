import {AutomationBillingEventMeasure} from 'models/reporting/cubes/AutomationBillingEventCube'
import {StatsFilters} from 'models/stat/types'
import {automateDefaultFilters} from 'models/reporting/queryFactories/automate/filters'

export const decreaseInResolutionTimeQueryFactory = (
    filters: StatsFilters,
    timezone: string
) => ({
    measures: [
        AutomationBillingEventMeasure.DecreaseInResolutionTimeWithAutomateFeatures,
    ],
    dimensions: [],
    timezone,
    filters: automateDefaultFilters(filters),
})
