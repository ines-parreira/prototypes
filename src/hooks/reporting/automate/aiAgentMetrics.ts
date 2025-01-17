import {CustomField} from 'custom-fields/types'
import {OrderDirection} from 'models/api/types'
import {
    AutomatedDatesetEventTypes,
    AutomationDatasetDimension,
    AutomationDatasetFilterMember,
    AutomationDatasetMeasure,
} from 'models/reporting/cubes/automate_v2/AutomationDatasetCube'
import {TicketDimension} from 'models/reporting/cubes/TicketCube'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMember,
} from 'models/reporting/cubes/TicketCustomFieldsCube'
import {customerSatisfactionPerCustomFieldQueryFactory} from 'models/reporting/queryFactories/ai-agent-insights/metrics'
import {
    automationDatasetAdditionalFilters,
    automationDatasetDefaultFilters,
} from 'models/reporting/queryFactories/automate_v2/filters'
import {
    customFieldsTicketTotalCountQueryFactory,
    customFieldsTicketFactory,
    customFieldsTicketCountQueryFactory,
} from 'models/reporting/queryFactories/ticket-insights/customFieldsTicketCount'
import {ReportingFilterOperator} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'

import {
    formatReportingQueryDate,
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

import {useMetric} from '../useMetric'
import {useMetricPerDimension} from '../useMetricPerDimension'
import {
    CUSTOM_FIELD_AI_AGENT_HANDOVER,
    CUSTOM_FIELD_AI_AGENT_CLOSE,
} from './types'

export const useTotalAiAgentTicketsByCustomField = (
    filters: StatsFilters,
    timezone: string,
    customField: CustomField | undefined,
    sorting?: OrderDirection
) =>
    useMetric(
        customFieldsTicketTotalCountQueryFactory(
            filters,
            timezone,
            String(customField?.id || -1),
            sorting
        )
    )

export const useAiAgenTickets = (
    filters: StatsFilters,
    timezone: string,
    customField: CustomField | undefined,
    customFieldFilter?:
        | typeof CUSTOM_FIELD_AI_AGENT_HANDOVER
        | typeof CUSTOM_FIELD_AI_AGENT_CLOSE,
    sorting?: OrderDirection
) =>
    useMetricPerDimension(
        customFieldsTicketFactory(
            filters,
            timezone,
            String(customField?.id || -1),
            customFieldFilter
                ? {
                      member: TicketCustomFieldsMember.TicketCustomFieldsValueString,
                      operator: ReportingFilterOperator.Contains,
                      values: [customFieldFilter],
                  }
                : undefined,
            sorting
        )
    )

export const useAiAgentTicketCountPerIntent = (
    filters: StatsFilters,
    timezone: string,
    customField: CustomField | undefined,
    ticketIds?: string[] | undefined,
    sorting?: OrderDirection
) =>
    useMetricPerDimension(
        customFieldsTicketCountQueryFactory(
            filters,
            timezone,
            String(customField?.id || -1),
            sorting,
            ...(ticketIds && ticketIds.length
                ? [
                      {
                          member: TicketDimension.TicketId,
                          operator: ReportingFilterOperator.In,
                          values: ticketIds,
                      },
                  ]
                : [])
        )
    )

export const useCustomerSatisfactionMetricPerIntent = (
    filters: StatsFilters,
    timezone: string,
    customField: CustomField | undefined,
    sorting?: OrderDirection
) =>
    useMetricPerDimension(
        customerSatisfactionPerCustomFieldQueryFactory(
            filters,
            timezone,
            sorting,
            customField
                ? {
                      member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
                      operator: ReportingFilterOperator.Equals,
                      values: [String(customField.id)],
                  }
                : undefined
        )
    )

export const useAIAgentTicketsWithIntent = (
    filters: StatsFilters,
    timezone: string,
    customFieldId: string | null,
    sorting?: OrderDirection
) => {
    return useMetricPerDimension({
        measures: [],
        dimensions: [
            TicketDimension.TicketId,
            TicketCustomFieldsDimension.TicketCustomFieldsValueString,
        ],
        timezone,
        filters: [
            {
                member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
                operator: ReportingFilterOperator.Equals,
                values: [customFieldId],
            },
            ...NotSpamNorTrashedTicketsFilter,
            ...statsFiltersToReportingFilters(
                TicketStatsFiltersMembers,
                filters
            ),
            {
                member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldUpdatedDatetime,
                operator: ReportingFilterOperator.InDateRange,
                values: [
                    formatReportingQueryDate(filters.period.start_datetime),
                    formatReportingQueryDate(filters.period.end_datetime),
                ],
            },
        ],
        ...(sorting
            ? {
                  order: [
                      [
                          TicketCustomFieldsDimension.TicketCustomFieldsValueString,
                          sorting,
                      ],
                  ],
              }
            : {}),
    })
}

export const useAIAgentResourcePerTicket = (
    filters: StatsFilters,
    timezone: string,
    ticketIds: string[],
    sorting?: OrderDirection,
    enabled?: boolean
) => {
    return useMetricPerDimension(
        {
            measures: [AutomationDatasetMeasure.AutomatedInteractions],
            dimensions: [AutomationDatasetDimension.TicketId],
            timezone,
            filters: [
                ...automationDatasetDefaultFilters(filters),
                ...automationDatasetAdditionalFilters(filters),
                {
                    member: AutomationDatasetFilterMember.TicketId,
                    operator: ReportingFilterOperator.In,
                    values: ticketIds,
                },
                {
                    member: AutomationDatasetFilterMember.EventType,
                    operator: ReportingFilterOperator.Equals,
                    values: [
                        AutomatedDatesetEventTypes.AiAgentRecommendedResource,
                    ],
                },
            ],
            ...(sorting
                ? {
                      order: [[AutomationDatasetDimension.TicketId, sorting]],
                  }
                : {}),
        },
        undefined,
        enabled
    )
}
