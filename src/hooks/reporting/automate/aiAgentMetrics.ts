import { OrderDirection } from 'models/api/types'
import { TicketDimension } from 'models/reporting/cubes/TicketCube'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMember,
} from 'models/reporting/cubes/TicketCustomFieldsCube'
import {
    AiAgentAutomatedInteractionsTicketsQueryFactory,
    aiAgentAutomatedTicketCountQueryFactory,
    aiAgentTicketsWithIntentQueryFactory,
    aiAgentTouchedTicketQueryFactory,
    aiAgentTouchedTicketTotalCountQueryFactory,
    customerSatisfactionPerIntentLevelQueryFactory,
    recommendedResourceQueryFactory,
} from 'models/reporting/queryFactories/ai-agent-insights/metrics'
import {
    aiAgentTicketsFromTicketCustomFieldsPerIntentCountQueryFactory,
    aiAgentTicketsPerIntentCountQueryFactory,
} from 'models/reporting/queryFactories/ticket-insights/customFieldsTicketCount'
import { ReportingFilterOperator } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import {
    getPreviousPeriod,
    NotSpamNorTrashedTicketsFilter,
} from 'utils/reporting'

import { useMetric } from '../useMetric'
import { useMetricPerDimension } from '../useMetricPerDimension'
import { useMultipleMetricsTrends } from '../useMultipleMetricsTrend'
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
    integrationIds?: string[],
) =>
    useMetric(
        aiAgentTouchedTicketTotalCountQueryFactory({
            filters,
            timezone,
            intentFieldId,
            outcomeFieldId,
            sorting,
            integrationIds,
        }),
    )

export const useAiAgentTickets = ({
    filters,
    timezone,
    outcomeFieldId,
    intentFieldId,
    operator = ReportingFilterOperator.Contains,
    customFieldFilter,
    sorting,
    integrationIds,
}: {
    filters: StatsFilters
    timezone: string
    outcomeFieldId: number
    intentFieldId?: number
    operator?: ReportingFilterOperator
    customFieldFilter?:
        | typeof CUSTOM_FIELD_AI_AGENT_HANDOVER
        | typeof CUSTOM_FIELD_AI_AGENT_CLOSE
    sorting?: OrderDirection
    integrationIds?: string[]
}) =>
    useMetricPerDimension(
        aiAgentTouchedTicketQueryFactory({
            filters,
            timezone,
            outcomeFieldId,
            intentFieldId,
            operator,
            customFieldFilter,
            sorting,
            integrationIds,
        }),
    )

export const useAiAgentAutomatedInteractionsTickets = ({
    filters,
    timezone,
    outcomeFieldId,
    intentFieldId,
    sorting,
    integrationIds,
}: {
    filters: StatsFilters
    timezone: string
    outcomeFieldId: number
    intentFieldId?: number
    sorting?: OrderDirection
    integrationIds?: string[]
}) =>
    useMetricPerDimension(
        AiAgentAutomatedInteractionsTicketsQueryFactory({
            filters,
            timezone,
            outcomeFieldId,
            intentFieldId,
            sorting,
            integrationIds,
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

export const useAiAgentTicketCountFromTicketCustomFieldsPerIntent = ({
    filters,
    timezone,
    intentFieldId,
    outcomeFieldId,
    integrationIds,
    sorting,
    intentId,
    outcomeValuesToExclude,
    outcomeValueToInclude,
}: {
    filters: StatsFilters
    timezone: string
    intentFieldId: number
    outcomeFieldId: number
    integrationIds?: string[]
    sorting?: OrderDirection
    intentId?: string
    outcomeValuesToExclude?: string[]
    outcomeValueToInclude?: string
}) => {
    return useMetricPerDimension(
        aiAgentTicketsFromTicketCustomFieldsPerIntentCountQueryFactory({
            filters,
            timezone,
            intentFieldId: intentFieldId,
            outcomeFieldId,
            sorting,
            integrationIds: integrationIds,
            intentId: intentId,
            outcomeValuesToExclude,
            outcomeValueToInclude,
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
    integrationIds?: string[],
) => {
    return useMetricPerDimension(
        customerSatisfactionPerIntentLevelQueryFactory({
            filters,
            timezone,
            sorting,
            assigneeUserId,
            intentFieldId: intentCustomFieldId,
            outcomeFieldId: outcomeCustomFieldId,
            integrationIds,
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

export const useAiAgentAutomatedTicketsCountTrends = ({
    filters,
    timezone,
    outcomeFieldId,
    intentFieldId,
    integrationIds,
    sorting,
}: {
    filters: StatsFilters
    timezone: string
    outcomeFieldId: number
    intentFieldId?: number
    integrationIds?: string[]
    sorting?: OrderDirection
}) => {
    const aiAgentTicketsData = useAiAgentAutomatedInteractionsTickets({
        filters,
        timezone,
        outcomeFieldId: outcomeFieldId,
        intentFieldId: intentFieldId,
        integrationIds,
    })
    const prevAiAgentTicketsData = useAiAgentAutomatedInteractionsTickets({
        filters: {
            ...filters,
            period: getPreviousPeriod(filters.period),
        },
        timezone,
        outcomeFieldId: outcomeFieldId,
        intentFieldId: intentFieldId,
        integrationIds,
    })

    const ticketIds = aiAgentTicketsData.data?.allData
        .map((item) => item[TicketDimension.TicketId])
        .filter((id): id is string => typeof id === 'string')

    const prevTicketIds = prevAiAgentTicketsData.data?.allData
        .map((item) => item[TicketDimension.TicketId])
        .filter((id): id is string => typeof id === 'string')

    return useMultipleMetricsTrends(
        aiAgentAutomatedTicketCountQueryFactory({
            timezone,
            ticketIds,
            sorting,
        }),
        aiAgentAutomatedTicketCountQueryFactory({
            timezone,
            ticketIds: prevTicketIds,
            sorting,
        }),
    )
}
