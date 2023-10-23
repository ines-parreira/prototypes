import {automationAddOnDefaultFilters} from 'models/reporting/queryFactories/support-performance/firstResponseTimeWithAutomationQueryFactory'
import {AutomationBillingEventMeasure} from 'models/reporting/cubes/AutomationBillingEventCube'
import {StatsFilters} from 'models/stat/types'

export const resolutionTimeWithAutomationQueryFactory = (
    filters: StatsFilters,
    timezone: string
) => ({
    measures: [AutomationBillingEventMeasure.ResolutionTimeWithAutomation],
    dimensions: [],
    timezone,
    filters: automationAddOnDefaultFilters(filters),
})
