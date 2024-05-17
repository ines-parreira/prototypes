import {StatsFilters} from 'models/stat/types'
import {
    automationDatasetDefaultFilters,
    billableTicketDatasetDefaultFilters,
} from 'models/reporting/queryFactories/automate_v2/filters'
import {AutomationDatasetMeasure} from 'models/reporting/cubes/automate_v2/AutomationDatasetCube'
import {
    BillableTicketDatasetCube,
    BillableTicketDatasetDimension,
    BillableTicketDatasetMeasure,
} from 'models/reporting/cubes/automate_v2/BillableTicketDatasetCube'
import {ReportingFilterOperator, ReportingQuery} from 'models/reporting/types'

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
): ReportingQuery<BillableTicketDatasetCube> => ({
    measures: [
        BillableTicketDatasetMeasure.BillableTicketCount,
        BillableTicketDatasetMeasure.TotalFirstResponseTime,
        BillableTicketDatasetMeasure.TotalResolutionTime,
    ],
    dimensions: [],
    timezone,
    filters: billableTicketDatasetDefaultFilters(filters),
})

export const billableTicketDatasetExcludingAIAgentQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    aiAgentUserId?: string
): ReportingQuery<BillableTicketDatasetCube> => ({
    measures: [
        BillableTicketDatasetMeasure.BillableTicketCount,
        BillableTicketDatasetMeasure.TotalFirstResponseTime,
        BillableTicketDatasetMeasure.TotalResolutionTime,
    ],
    dimensions: [],
    timezone,
    filters: [
        ...billableTicketDatasetDefaultFilters(filters),
        ...(aiAgentUserId
            ? [
                  {
                      member: BillableTicketDatasetDimension.ResolvedByAgentUserId,
                      operator: ReportingFilterOperator.NotEquals,
                      values: [aiAgentUserId],
                  },
              ]
            : []),
    ],
})

export const billableTicketDatasetResolvedByAIAgentQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    aiAgentUserId?: string
): ReportingQuery<BillableTicketDatasetCube> => ({
    measures: [
        BillableTicketDatasetMeasure.BillableTicketCount,
        BillableTicketDatasetMeasure.TotalFirstResponseTime,
        BillableTicketDatasetMeasure.TotalResolutionTime,
    ],
    dimensions: [],
    timezone,
    filters: [
        ...billableTicketDatasetDefaultFilters(filters),
        ...(aiAgentUserId
            ? [
                  {
                      member: BillableTicketDatasetDimension.ResolvedByAgentUserId,
                      operator: ReportingFilterOperator.Equals,
                      values: [aiAgentUserId],
                  },
              ]
            : []),
    ],
})
