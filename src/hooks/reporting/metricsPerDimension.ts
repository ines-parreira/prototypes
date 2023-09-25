import {useClosedTicketsMetric} from 'hooks/reporting/metrics'
import {
    closedTicketsQueryFactory,
    customerSatisfactionQueryFactory,
    firstResponseTimeQueryFactory,
    messagesSentQueryFactory,
    NotSpamNorTrashedTicketsFilter,
    resolutionTimeQueryFactory,
    ticketsRepliedQueryFactory,
} from 'hooks/reporting/metricTrends'
import {
    MetricWithDecile,
    useMetricPerDimension,
    useMetricPerDimensionWithBreakdown,
} from 'hooks/reporting/useMetricPerDimension'
import {OrderDirection} from 'models/api/types'
import {
    TicketCubeWithJoins,
    TicketDimension,
    TicketMeasure,
} from 'models/reporting/cubes/TicketCube'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMeasure,
    TicketCustomFieldsMember,
} from 'models/reporting/cubes/TicketCustomFieldsCube'
import {
    TicketMessagesDimension,
    TicketMessagesMeasure,
} from 'models/reporting/cubes/TicketMessagesCube'
import {
    HelpdeskMessageCubeWithJoins,
    HelpdeskMessageDimension,
    HelpdeskMessageMeasure,
} from 'models/reporting/cubes/HelpdeskMessageCube'
import {TicketSatisfactionSurveyMeasure} from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import {ReportingFilterOperator, ReportingQuery} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {
    formatReportingQueryDate,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

export const firstResponseTimeMetricPerAgentQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
): ReportingQuery<TicketCubeWithJoins> => ({
    ...firstResponseTimeQueryFactory(filters, timezone),
    dimensions: [TicketMessagesDimension.FirstHelpdeskMessageUserId],
    ...(sorting
        ? {
              order: [[TicketMessagesMeasure.FirstResponseTime, sorting]],
          }
        : {}),
})

export const useFirstResponseTimeMetricPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string
) =>
    useMetricPerDimension(
        firstResponseTimeMetricPerAgentQueryFactory(
            statsFilters,
            timezone,
            sorting
        ),
        agentAssigneeId
    )

export const ticketsRepliedMetricPerAgentQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
): ReportingQuery<HelpdeskMessageCubeWithJoins> => ({
    ...ticketsRepliedQueryFactory(filters, timezone),
    dimensions: [HelpdeskMessageDimension.SenderId],
    ...(sorting
        ? {
              order: [[HelpdeskMessageMeasure.TicketCount, sorting]],
          }
        : {}),
})

export const useTicketsRepliedMetricPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string
) =>
    useMetricPerDimension(
        ticketsRepliedMetricPerAgentQueryFactory(
            statsFilters,
            timezone,
            sorting
        ),
        agentAssigneeId
    )

export const closedTicketsPerAgentQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
): ReportingQuery<HelpdeskMessageCubeWithJoins> => ({
    ...closedTicketsQueryFactory(filters, timezone),
    dimensions: [TicketDimension.AssigneeUserId],

    ...(sorting
        ? {
              order: [[TicketMeasure.TicketCount, sorting]],
          }
        : {}),
})

export const useClosedTicketsMetricPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string
) =>
    useMetricPerDimension(
        closedTicketsPerAgentQueryFactory(statsFilters, timezone, sorting),
        agentAssigneeId
    )

export const usePercentageOfClosedTicketsMetricPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string
) => {
    const closedTicketsPerAgent = useClosedTicketsMetricPerAgent(
        statsFilters,
        timezone,
        sorting,
        agentAssigneeId
    )
    const {data, isFetching, isError} = useClosedTicketsMetric(
        statsFilters,
        timezone
    )

    const calculatePercentage = (x: number, y: number) => (x / y) * 100

    let metricValue = null

    if (closedTicketsPerAgent.data?.value && data?.value) {
        metricValue = calculatePercentage(
            closedTicketsPerAgent.data.value,
            data.value
        )
    }

    const allData = closedTicketsPerAgent.data?.allData || []

    return {
        isFetching: isFetching || closedTicketsPerAgent.isFetching,
        isError: isError || closedTicketsPerAgent.isError,
        data: {
            value: metricValue,
            decile: closedTicketsPerAgent.data?.decile || null,
            allData: allData.map((item) => ({
                ...item,
                [TicketMeasure.TicketCount]:
                    item[TicketMeasure.TicketCount] && data?.value
                        ? String(
                              calculatePercentage(
                                  Number(item[TicketMeasure.TicketCount]),
                                  data.value
                              )
                          )
                        : item[TicketMeasure.TicketCount],
            })),
        },
    }
}

export const messagesSentMetricPerAgentQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
): ReportingQuery<HelpdeskMessageCubeWithJoins> => ({
    ...messagesSentQueryFactory(filters, timezone),
    dimensions: [HelpdeskMessageDimension.SenderId],
    ...(sorting
        ? {
              order: [[HelpdeskMessageMeasure.MessageCount, sorting]],
          }
        : {}),
})

export const useMessagesSentMetricPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string
) =>
    useMetricPerDimension(
        messagesSentMetricPerAgentQueryFactory(statsFilters, timezone, sorting),
        agentAssigneeId
    )

export const resolutionTimeMetricPerAgentQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
): ReportingQuery<HelpdeskMessageCubeWithJoins> => ({
    ...resolutionTimeQueryFactory(filters, timezone),
    dimensions: [TicketDimension.AssigneeUserId],
    ...(sorting
        ? {
              order: [[TicketMessagesMeasure.ResolutionTime, sorting]],
          }
        : {}),
})

export const useResolutionTimeMetricPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string
) =>
    useMetricPerDimension(
        resolutionTimeMetricPerAgentQueryFactory(
            statsFilters,
            timezone,
            sorting
        ),
        agentAssigneeId
    )

export const customerSatisfactionMetricPerAgentQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
): ReportingQuery<HelpdeskMessageCubeWithJoins> => ({
    ...customerSatisfactionQueryFactory(filters, timezone),
    dimensions: [TicketDimension.AssigneeUserId],
    ...(sorting
        ? {
              order: [[TicketSatisfactionSurveyMeasure.SurveyScore, sorting]],
          }
        : {}),
})

export const useCustomerSatisfactionMetricPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string
) =>
    useMetricPerDimension(
        customerSatisfactionMetricPerAgentQueryFactory(
            statsFilters,
            timezone,
            sorting
        ),
        agentAssigneeId
    )

export const customFieldsTicketCountQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    customFieldId: string,
    sorting?: OrderDirection
): ReportingQuery<HelpdeskMessageCubeWithJoins> => ({
    measures: [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount],
    dimensions: [TicketCustomFieldsDimension.TicketCustomFieldsValueString],
    timezone,
    segments: [],
    filters: [
        ...NotSpamNorTrashedTicketsFilter,
        ...statsFiltersToReportingFilters(TicketStatsFiltersMembers, filters),
        {
            member: TicketCustomFieldsMember.TicketCustomFieldsCustomFieldId,
            operator: ReportingFilterOperator.Equals,
            values: [customFieldId],
        },
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
                      TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount,
                      sorting,
                  ],
              ],
          }
        : {}),
})

export const useCustomFieldsTicketCount = (
    statsFilters: StatsFilters,
    timezone: string,
    customFieldId: string,
    sorting?: OrderDirection
): MetricWithDecile =>
    useMetricPerDimension(
        customFieldsTicketCountQueryFactory(
            statsFilters,
            timezone,
            customFieldId,
            sorting
        )
    )

export const useCustomTicketFieldWithBreakdown = (
    statsFilters: StatsFilters,
    timezone: string,
    customFieldId: string,
    sorting?: OrderDirection
): MetricWithDecile =>
    useMetricPerDimensionWithBreakdown(
        customFieldsTicketCountQueryFactory(
            statsFilters,
            timezone,
            customFieldId,
            sorting
        )
    )
