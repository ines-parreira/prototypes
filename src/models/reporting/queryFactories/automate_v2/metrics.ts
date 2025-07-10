import { AutomateEventType } from 'hooks/reporting/automate/utils'
import {
    AutomationDatasetFilterMember,
    AutomationDatasetMeasure,
} from 'models/reporting/cubes/automate_v2/AutomationDatasetCube'
import {
    BillableTicketDatasetCube,
    BillableTicketDatasetDimension,
    BillableTicketDatasetMeasure,
} from 'models/reporting/cubes/automate_v2/BillableTicketDatasetCube'
import {
    automationDatasetAdditionalFilters,
    automationDatasetDefaultFilters,
    billableTicketDatasetDefaultFilters,
} from 'models/reporting/queryFactories/automate_v2/filters'
import { ReportingFilterOperator, ReportingQuery } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'

export const automationDatasetQueryFactory = (
    filters: StatsFilters,
    timezone: string,
) => ({
    measures: [
        AutomationDatasetMeasure.AutomatedInteractions,
        AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders,
    ],
    dimensions: [],
    timezone,
    filters: [
        ...automationDatasetDefaultFilters(filters),
        ...automationDatasetAdditionalFilters(filters),
    ],
})

// AUTOMATED INTERACTIONS: fully automated interactions by AI Agent
export const aiAgentAutomatedInteractionsQueryFactory = (
    filters: StatsFilters,
    timezone: string,
) => ({
    measures: [
        AutomationDatasetMeasure.AutomatedInteractions,
        AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders,
    ],
    dimensions: [],
    timezone,
    filters: [
        ...automationDatasetDefaultFilters(filters),
        {
            member: AutomationDatasetFilterMember.EventType,
            operator: ReportingFilterOperator.Equals,
            values: [AutomateEventType.AI_AGENT_TICKET_RESOLVED],
        },
    ],
})

export const billableTicketDatasetQueryFactory = (
    filters: StatsFilters,
    timezone: string,
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
    aiAgentUserId?: number,
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
                      values: [String(aiAgentUserId)],
                  },
              ]
            : []),
    ],
})

export const billableTicketDatasetResolvedByAIAgentQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    aiAgentUserId?: string,
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
        {
            member: BillableTicketDatasetDimension.ResolvedByAgentUserId,
            operator: ReportingFilterOperator.Equals,
            values: [aiAgentUserId ?? '-1'], // -1 ensures no data will be returned if there is no AI agent
        },
    ],
})
