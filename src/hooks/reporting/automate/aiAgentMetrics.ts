import { OrderDirection } from 'models/api/types'
import { TicketDimension } from 'models/reporting/cubes/TicketCube'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMember,
} from 'models/reporting/cubes/TicketCustomFieldsCube'
import {
    aiAgentTicketsWithIntentQueryFactory,
    aiAgentTouchedTicketQueryFactory,
    aiAgentTouchedTicketTotalCountQueryFactory,
    customerSatisfactionPerIntentLevelQueryFactory,
    recommendedResourceQueryFactory,
} from 'models/reporting/queryFactories/ai-agent-insights/metrics'
import { aiAgentTicketsPerIntentCountQueryFactory } from 'models/reporting/queryFactories/ticket-insights/customFieldsTicketCount'
import { ReportingFilterOperator } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import { NotSpamNorTrashedTicketsFilter } from 'utils/reporting'

import { useMetric } from '../useMetric'
import { useMetricPerDimension } from '../useMetricPerDimension'
import {
    CUSTOM_FIELD_AI_AGENT_CLOSE,
    CUSTOM_FIELD_AI_AGENT_HANDOVER,
} from './types'

export const useTotalAiAgentTicketsByCustomField = (
    filters: StatsFilters,
    timezone: string,
    intentFieldId: number,
    outcomeFieldId: number,
    sorting?: OrderDirection,
) =>
    useMetric(
        aiAgentTouchedTicketTotalCountQueryFactory({
            filters,
            timezone,
            intentFieldId,
            outcomeFieldId,
            sorting,
        }),
    )

export const useAiAgentTickets = (
    filters: StatsFilters,
    timezone: string,
    outcomeFieldId: number,
    intentFieldId?: number,
    operator: ReportingFilterOperator = ReportingFilterOperator.Contains,
    customFieldFilter?:
        | typeof CUSTOM_FIELD_AI_AGENT_HANDOVER
        | typeof CUSTOM_FIELD_AI_AGENT_CLOSE,
    sorting?: OrderDirection,
) =>
    useMetricPerDimension(
        aiAgentTouchedTicketQueryFactory({
            filters,
            timezone,
            outcomeFieldId,
            intentFieldId,
            operator,
            customFieldFilter,
            sorting,
        }),
    )

export const useAiAgentTicketCountPerIntent = ({
    filters,
    timezone,
    intentFieldId,
    ticketIds,
    sorting,
    intentId,
}: {
    filters: StatsFilters
    timezone: string
    intentFieldId: number
    ticketIds?: string[]
    sorting?: OrderDirection
    intentId?: string
}) => {
    return useMetricPerDimension(
        aiAgentTicketsPerIntentCountQueryFactory({
            filters,
            timezone,
            intentFieldId: intentFieldId,
            sorting,
            ticketIds: ticketIds,
            intentId: intentId,
        }),
    )
}

export const useCustomerSatisfactionMetricPerIntentLevel = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    assigneeUserId?: string,
    intentCustomFieldId?: number,
    outcomeCustomFieldId?: number,
) => {
    return useMetricPerDimension(
        customerSatisfactionPerIntentLevelQueryFactory({
            filters,
            timezone,
            sorting,
            assigneeUserId,
            intentFieldId: intentCustomFieldId,
            outcomeFieldId: outcomeCustomFieldId,
        }),
    )
}

export const useAIAgentTicketsWithIntent = (
    filters: StatsFilters,
    timezone: string,
    intentFieldId: number | undefined,
    ticketIds?: string[],
    sorting?: OrderDirection,
    intentId?: string,
) => {
    return useMetricPerDimension(
        aiAgentTicketsWithIntentQueryFactory(
            filters,
            timezone,
            intentFieldId,
            ticketIds,
            sorting,
            intentId,
        ),
    )
}

export const useGetTicketIntentsForTicketIds = (
    timezone: string,
    customFieldId?: number,
    sorting?: OrderDirection,
    ticketIds?: string[] | null,
) => {
    return useMetricPerDimension({
        measures: [],
        dimensions: [
            TicketDimension.TicketId,
            TicketCustomFieldsDimension.TicketCustomFieldsValueString,
        ],
        timezone,
        filters: [
            ...(customFieldId
                ? [
                      {
                          member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
                          operator: ReportingFilterOperator.Equals,
                          values: [String(customFieldId)],
                      },
                  ]
                : []),
            ...(ticketIds
                ? [
                      {
                          member: TicketDimension.TicketId,
                          operator: ReportingFilterOperator.Equals,
                          values: ticketIds,
                      },
                  ]
                : []),
            ...NotSpamNorTrashedTicketsFilter,
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
    enabled?: boolean,
) => {
    return useMetricPerDimension(
        recommendedResourceQueryFactory(filters, timezone, ticketIds, sorting),
        undefined,
        enabled,
    )
}
