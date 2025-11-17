import { AutomateEventType } from 'domains/reporting/hooks/automate/utils'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import type { AutomationDatasetCube } from 'domains/reporting/models/cubes/automate_v2/AutomationDatasetCube'
import {
    AutomationDatasetFilterMember,
    AutomationDatasetMeasure,
} from 'domains/reporting/models/cubes/automate_v2/AutomationDatasetCube'
import type { BillableTicketDatasetCube } from 'domains/reporting/models/cubes/automate_v2/BillableTicketDatasetCube'
import {
    BillableTicketDatasetDimension,
    BillableTicketDatasetMeasure,
} from 'domains/reporting/models/cubes/automate_v2/BillableTicketDatasetCube'
import {
    automationDatasetAdditionalFilters,
    automationDatasetDefaultFilters,
    billableTicketDatasetDefaultFilters,
} from 'domains/reporting/models/queryFactories/automate_v2/filters'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingQuery } from 'domains/reporting/models/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'

export const automationDatasetQueryFactory = (
    filters: StatsFilters,
    timezone: string,
): ReportingQuery<AutomationDatasetCube> => ({
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
    metricName: METRIC_NAMES.AUTOMATE_AUTOMATION_DATASET,
})

// AUTOMATED INTERACTIONS: fully automated interactions by AI Agent
export const aiAgentAutomatedInteractionsQueryFactory = (
    filters: StatsFilters,
    timezone: string,
): ReportingQuery<AutomationDatasetCube> => ({
    metricName: METRIC_NAMES.AI_AGENT_AUTOMATED_INTERACTIONS,
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
    metricName: METRIC_NAMES.AUTOMATE_BILLABLE_TICKET_DATASET,
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
    metricName:
        METRIC_NAMES.AUTOMATE_BILLABLE_TICKET_DATASET_EXCLUDING_AI_AGENT,
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
    metricName:
        METRIC_NAMES.AUTOMATE_BILLABLE_TICKET_DATASET_RESOLVED_BY_AI_AGENT,
})
