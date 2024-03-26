import {StatsFilters} from 'models/stat/types'
import {
    automationDatasetDefaultFilters,
    billableTicketDataseteDefaultFilters,
} from 'models/reporting/queryFactories/automate_v2/filters'
import {AutomationDatasetMeasure} from 'models/reporting/cubes/automate_v2/AutomationDatasetCube'
import {BillableTicketDatasetMeasure} from 'models/reporting/cubes/automate_v2/BillableTicketDatasetCube'

export const automationDatasetQueryFactory = (
    filters: StatsFilters,
    timezone: string
) => ({
    measures: [
        AutomationDatasetMeasure.AutomatedInteractions,
        AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders,
    ],
    dimensions: [],
    timezone,
    filters: automationDatasetDefaultFilters(filters),
})

export const billableTicketDatasetQueryFactory = (
    filters: StatsFilters,
    timezone: string
) => ({
    measures: [
        BillableTicketDatasetMeasure.BillableTicketCount,
        BillableTicketDatasetMeasure.TotalFirstResponseTime,
        BillableTicketDatasetMeasure.TotalResolutionTime,
    ],
    dimensions: [],
    timezone,
    filters: billableTicketDataseteDefaultFilters(filters),
})
