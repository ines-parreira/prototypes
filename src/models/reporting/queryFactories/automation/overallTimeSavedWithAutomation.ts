import {automationAddOnDefaultFilters} from 'models/reporting/queryFactories/support-performance/firstResponseTimeWithAutomationQueryFactory'
import {AutomationBillingEventMeasure} from 'models/reporting/cubes/AutomationBillingEventCube'
import {StatsFilters} from 'models/stat/types'

export const overallTimeSavedWithAutomationQueryFactory = (
    filters: StatsFilters,
    timezone: string
) => ({
    measures: [AutomationBillingEventMeasure.OverallTimeSaved],
    dimensions: [],
    timezone,
    filters: automationAddOnDefaultFilters(filters),
})
