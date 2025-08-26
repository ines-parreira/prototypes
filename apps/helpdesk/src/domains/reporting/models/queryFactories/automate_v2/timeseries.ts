import { AutomateEventType } from 'domains/reporting/hooks/automate/utils'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    AIAgentAutomatedInteractionsCube,
    AIAgentInteractionsBySkillDatasetDimension,
    AIAgentInteractionsBySkillFilterMember,
    AIAgentInteractionsBySkillMeasure,
} from 'domains/reporting/models/cubes/automate_v2/AIAgentIntercationsBySkillDatasetCube'
import {
    AutomationDatasetCube,
    AutomationDatasetDimension,
    AutomationDatasetFilterMember,
    AutomationDatasetMeasure,
} from 'domains/reporting/models/cubes/automate_v2/AutomationDatasetCube'
import {
    BillableTicketDatasetCube,
    BillableTicketDatasetDimension,
    BillableTicketDatasetMeasure,
} from 'domains/reporting/models/cubes/automate_v2/BillableTicketDatasetCube'
import {
    automationDatasetAdditionalFilters,
    automationDatasetDefaultFilters,
    billableTicketDatasetDefaultFilters,
} from 'domains/reporting/models/queryFactories/automate_v2/filters'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    ReportingFilterOperator,
    ReportingGranularity,
    TimeSeriesQuery,
} from 'domains/reporting/models/types'
import {
    getFilterDateRange,
    statsFiltersToReportingFilters,
} from 'domains/reporting/utils/reporting'

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
    metricName: METRIC_NAMES.AUTOMATE_INTERACTIONS,
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
    metricName: METRIC_NAMES.AUTOMATE_INTERACTIONS_BY_EVENT_TYPE,
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
    metricName:
        METRIC_NAMES.AUTOMATE_BILLABLE_TICKET_DATASET_EXCLUDING_AI_AGENT_TIME_SERIES,
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
        metricName: METRIC_NAMES.AUTOMATE_AI_AGENT_INTERACTIONS_BY_SKILL,
    }
}

export const articleRecommendedInteractionsTimeSeriesQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
): TimeSeriesQuery<AutomationDatasetCube> => ({
    measures: [AutomationDatasetMeasure.AutomatedInteractions],
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
        // Filter for article recommendation events only
        {
            member: AutomationDatasetFilterMember.EventType,
            operator: ReportingFilterOperator.Equals,
            values: [AutomateEventType.ARTICLE_RECOMMENDATION_STARTED],
        },
    ],
    metricName: METRIC_NAMES.AUTOMATE_ARTICLE_RECOMMENDATION_INTERACTIONS,
})
