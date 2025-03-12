import { OrderDirection } from 'models/api/types'
import { TicketDimension } from 'models/reporting/cubes/TicketCube'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMember,
} from 'models/reporting/cubes/TicketCustomFieldsCube'
import {
    aiAgentTicketsWithIntentQueryFactory,
    aiAgentTouchedTicketQueryFactory,
    allTicketsForAiAgentTotalCountQueryFactory,
    customerSatisfactionPerIntentLevelQueryFactory,
    recommendedResourceQueryFactory,
} from 'models/reporting/queryFactories/ai-agent-insights/metrics'
import { customFieldsTicketCountQueryFactory } from 'models/reporting/queryFactories/ticket-insights/customFieldsTicketCount'
import {
    ReportingFilter,
    ReportingFilterOperator,
} from 'models/reporting/types'
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
    sorting?: OrderDirection,
) =>
    useMetric(
        allTicketsForAiAgentTotalCountQueryFactory({
            filters,
            timezone,
            intentFieldId,
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

export const useAiAgentTicketCountPerIntent = (
    filters: StatsFilters,
    timezone: string,
    intentFieldId: number | undefined,
    ticketIds?: string[] | undefined,
    sorting?: OrderDirection,
    customFieldValue?: string,
) => {
    const additionalFilters: ReportingFilter[] = []
    if (ticketIds && ticketIds.length) {
        additionalFilters.push({
            member: TicketDimension.TicketId,
            operator: ReportingFilterOperator.In,
            values: ticketIds,
        })
    }

    if (customFieldValue) {
        additionalFilters.push({
            member: TicketCustomFieldsMember.TicketCustomFieldsValueString,
            operator: ReportingFilterOperator.StartsWith,
            values: [customFieldValue],
        })
    }

    return useMetricPerDimension(
        customFieldsTicketCountQueryFactory(
            filters,
            timezone,
            String(intentFieldId || -1),
            sorting,
            additionalFilters,
        ),
    )
}

export const useCustomerSatisfactionMetricPerIntentLevel = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    assigneeUserId?: string,
) => {
    return useMetricPerDimension(
        customerSatisfactionPerIntentLevelQueryFactory(
            filters,
            timezone,
            sorting,
            assigneeUserId,
        ),
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
    customFieldId: string | null,
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
            {
                member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
                operator: ReportingFilterOperator.Equals,
                values: [customFieldId],
            },
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
