import type {
    CUSTOM_FIELD_AI_AGENT_CLOSE,
    CUSTOM_FIELD_AI_AGENT_HANDOVER,
} from 'domains/reporting/hooks/automate/types'
import { adjustPeriodForAutomatedInteractions } from 'domains/reporting/hooks/automate/utils'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import { useMetric } from 'domains/reporting/hooks/useMetric'
import { useMetricPerDimension } from 'domains/reporting/hooks/useMetricPerDimension'
import { useMultipleMetricsTrends } from 'domains/reporting/hooks/useMultipleMetricsTrend'
import { TicketDimension } from 'domains/reporting/models/cubes/TicketCube'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMember,
} from 'domains/reporting/models/cubes/TicketCustomFieldsCube'
import {
    AiAgentAutomatedInteractionsTicketsQueryFactory,
    aiAgentAutomatedTicketCountQueryFactory,
    aiAgentTicketsWithIntentQueryFactory,
    aiAgentTouchedTicketQueryFactory,
    aiAgentTouchedTicketTotalCountQueryFactory,
    customerSatisfactionPerIntentLevelQueryFactory,
    recommendedResourceQueryFactory,
} from 'domains/reporting/models/queryFactories/ai-agent-insights/metrics'
import { aiAgentAutomatedInteractionsQueryFactory } from 'domains/reporting/models/queryFactories/automate_v2/metrics'
import {
    aiAgentTicketsFromTicketCustomFieldsPerIntentCountQueryFactory,
    aiAgentTicketsPerIntentCountQueryFactory,
} from 'domains/reporting/models/queryFactories/ticket-insights/customFieldsTicketCount'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import {
    getPreviousPeriod,
    NotSpamNorTrashedTicketsFilter,
} from 'domains/reporting/utils/reporting'
import type { OrderDirection } from 'models/api/types'

export const HOURS_FOR_AUTOMATED_INTERACTIONS = 72

// P2/P3
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
    enabled,
}: {
    filters: StatsFilters
    timezone: string
    outcomeFieldId: number
    intentFieldId?: number
    sorting?: OrderDirection
    integrationIds?: string[]
    enabled?: boolean
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
        undefined,
        enabled,
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
    assigneeUserId?: number,
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
        metricName: METRIC_NAMES.AI_AGENT_TICKET_INTENTS_FOR_TICKETS,
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
    enabled,
}: {
    filters: StatsFilters
    timezone: string
    outcomeFieldId: number
    intentFieldId?: number
    integrationIds?: string[]
    sorting?: OrderDirection
    enabled?: boolean
}) => {
    const aiAgentTicketsData = useAiAgentAutomatedInteractionsTickets({
        filters,
        timezone,
        outcomeFieldId: outcomeFieldId,
        intentFieldId: intentFieldId,
        integrationIds,
        enabled,
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
        enabled,
    })

    const ticketIds = aiAgentTicketsData.data?.allData
        .map((item) => item[TicketDimension.TicketId])
        .filter((id): id is string => typeof id === 'string')

    const prevTicketIds = prevAiAgentTicketsData.data?.allData
        .map((item) => item[TicketDimension.TicketId])
        .filter((id): id is string => typeof id === 'string')

    const adjustedPeriodFilters = adjustPeriodForAutomatedInteractions(
        HOURS_FOR_AUTOMATED_INTERACTIONS,
        filters.period,
    )

    const prevPeriod = getPreviousPeriod(filters.period)
    const adjustedPrevPeriod = adjustPeriodForAutomatedInteractions(
        HOURS_FOR_AUTOMATED_INTERACTIONS,
        prevPeriod,
    )

    const aiAgentAutomatedTickets = useMultipleMetricsTrends(
        aiAgentAutomatedTicketCountQueryFactory({
            filters: { period: adjustedPeriodFilters },
            timezone,
            ticketIds,
            sorting,
        }),
        aiAgentAutomatedTicketCountQueryFactory({
            filters: {
                period: adjustedPrevPeriod,
            },
            timezone,
            ticketIds: prevTicketIds,
            sorting,
        }),
        enabled,
    )

    return {
        ...aiAgentAutomatedTickets,
        isFetching:
            aiAgentTicketsData.isFetching ||
            prevAiAgentTicketsData.isFetching ||
            aiAgentAutomatedTickets.isFetching,
        isError:
            aiAgentTicketsData.isError ||
            prevAiAgentTicketsData.isError ||
            aiAgentAutomatedTickets.isError,
    }
}

export const useAiAgentAutomatedInteractionsCountTrends = ({
    filters,
    timezone,
    enabled,
}: {
    filters: StatsFilters
    timezone: string
    enabled?: boolean
}) => {
    return useMultipleMetricsTrends(
        aiAgentAutomatedInteractionsQueryFactory(filters, timezone),
        aiAgentAutomatedInteractionsQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
        enabled,
    )
}
