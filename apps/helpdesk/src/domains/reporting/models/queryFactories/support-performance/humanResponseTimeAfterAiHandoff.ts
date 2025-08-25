import {
    TicketCubeWithJoins,
    TicketDimension,
} from 'domains/reporting/models/cubes/TicketCube'
import {
    TicketFirstHumanAgentResponseTimeDimension,
    TicketFirstHumanAgentResponseTimeMeasure,
    TicketFirstHumanAgentResponseTimeMember,
} from 'domains/reporting/models/cubes/TicketFirstHumanAgentResponseTime'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    ReportingFilterOperator,
    ReportingQuery,
} from 'domains/reporting/models/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    getFilterDateRange,
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketMessagesEnrichedFirstResponseTimesMembers,
} from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

export function humanResponseTimeAfterAiHandoffQueryFactory(
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketCubeWithJoins> {
    return {
        measures: [
            TicketFirstHumanAgentResponseTimeMeasure.MedianFirstHumanAgentResponseTime,
        ],
        dimensions: [],
        timezone,
        filters: [
            ...NotSpamNorTrashedTicketsFilter,
            {
                member: TicketFirstHumanAgentResponseTimeMember.FirstHumanAgentMessageDatetime,
                operator: ReportingFilterOperator.InDateRange,
                values: getFilterDateRange(statsFilters.period),
            },
            ...statsFiltersToReportingFilters(
                TicketMessagesEnrichedFirstResponseTimesMembers,
                statsFilters,
            ),
        ],
        order: sorting
            ? [
                  [
                      TicketFirstHumanAgentResponseTimeMeasure.MedianFirstHumanAgentResponseTime,
                      sorting,
                  ],
              ]
            : undefined,
    }
}

export function humanResponseTimeAfterAiHandoffPerAgentQueryFactory(
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
) {
    const query = humanResponseTimeAfterAiHandoffQueryFactory(
        statsFilters,
        timezone,
        sorting,
    )

    query.dimensions = [
        TicketFirstHumanAgentResponseTimeDimension.FirstHumanAgentMessageUserId,
    ]

    return query
}

export function humanResponseTimeAfterAiHandoffPerChannelQueryFactory(
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
) {
    const baseQuery = humanResponseTimeAfterAiHandoffQueryFactory(
        statsFilters,
        timezone,
        sorting,
    )

    baseQuery.dimensions = [TicketDimension.Channel]

    return baseQuery
}

export function humanResponseTimeAfterAiHandoffDrillDownQueryFactory(
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
) {
    const query = humanResponseTimeAfterAiHandoffQueryFactory(
        statsFilters,
        timezone,
        sorting,
    )

    query.dimensions.push(
        ...[
            TicketDimension.TicketId,
            TicketFirstHumanAgentResponseTimeDimension.FirstHumanAgentMessageUserId,
            TicketFirstHumanAgentResponseTimeDimension.FirstHumanAgentResponseTime,
        ],
    )

    query.limit = DRILLDOWN_QUERY_LIMIT

    return query
}
