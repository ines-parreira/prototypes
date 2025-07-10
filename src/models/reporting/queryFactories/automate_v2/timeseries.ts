import {
    AIAgentAutomatedInteractionsCube,
    AIAgentInteractionsBySkillDatasetDimension,
    AIAgentInteractionsBySkillFilterMember,
    AIAgentInteractionsBySkillMeasure,
} from 'models/reporting/cubes/automate_v2/AIAgentIntercationsBySkillDatasetCube'
import {
    AutomationDatasetCube,
    AutomationDatasetDimension,
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
import {
    ReportingFilterOperator,
    ReportingGranularity,
    TimeSeriesQuery,
} from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import {
    getFilterDateRange,
    statsFiltersToReportingFilters,
} from 'utils/reporting'

export const interactionsTimeSeriesQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
): TimeSeriesQuery<AutomationDatasetCube> => ({
    measures: [
        AutomationDatasetMeasure.AutomatedInteractions,
        AutomationDatasetMeasure.AutomatedInteractionsByAutoResponders,
    ],
    dimensions: [],
    timeDimensions: [
        {
            dimension:
                AutomationDatasetDimension.AutomationEventCreatedDatetime,
            granularity,
            dateRange: getFilterDateRange(filters.period),
        },
    ],
    timezone,
    filters: [
        ...automationDatasetDefaultFilters(filters),
        ...automationDatasetAdditionalFilters(filters),
    ],
})

export const interactionsByEventTypeTimeSeriesQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
): TimeSeriesQuery<AutomationDatasetCube> => ({
    measures: [AutomationDatasetMeasure.AutomatedInteractions],
    dimensions: [AutomationDatasetDimension.EventType],
    timeDimensions: [
        {
            dimension:
                AutomationDatasetDimension.AutomationEventCreatedDatetime,
            granularity,
            dateRange: getFilterDateRange(filters.period),
        },
    ],
    timezone,
    filters: [
        ...automationDatasetDefaultFilters(filters),
        ...automationDatasetAdditionalFilters(filters),
    ],
})

export const billableTicketDatasetExcludingAIAgentTimeSeriesQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    aiAgentUserId?: number,
): TimeSeriesQuery<BillableTicketDatasetCube> => ({
    measures: [BillableTicketDatasetMeasure.BillableTicketCount],
    dimensions: [],
    timeDimensions: [
        {
            dimension: BillableTicketDatasetDimension.TicketCreatedDatetime,
            granularity,
            dateRange: getFilterDateRange(filters.period),
        },
    ],
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

export const AIAgentInteractionsFiltersMembers = {
    periodStart: AIAgentInteractionsBySkillFilterMember.PeriodStart,
    periodEnd: AIAgentInteractionsBySkillFilterMember.PeriodEnd,
}

export const AIAgentInteractionsBySkillTimeSeriesQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
): TimeSeriesQuery<AIAgentAutomatedInteractionsCube> => {
    return {
        measures: [AIAgentInteractionsBySkillMeasure.Count],
        dimensions: [AIAgentInteractionsBySkillDatasetDimension.BillableType],
        timezone,
        timeDimensions: [
            {
                dimension:
                    AIAgentInteractionsBySkillDatasetDimension.AutomationEventCreatedDatetime,
                granularity,
                dateRange: getFilterDateRange(filters.period),
            },
        ],
        filters: [
            ...statsFiltersToReportingFilters(
                AIAgentInteractionsFiltersMembers,
                filters,
            ),
        ],
    }
}
