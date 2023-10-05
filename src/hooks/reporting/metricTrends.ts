import {TicketMessageSourceType} from 'business/types/ticket'
import useMetricTrend from 'hooks/reporting/useMetricTrend'
import {
    AutomationBillingEventMeasure,
    AutomationBillingEventMember,
} from 'models/reporting/cubes/AutomationBillingEventCube'
import {
    HelpdeskMessageCubeWithJoins,
    HelpdeskMessageMeasure,
    HelpdeskMessageMember,
} from 'models/reporting/cubes/HelpdeskMessageCube'
import {
    TicketMeasure,
    TicketMember,
    TicketSegment,
} from 'models/reporting/cubes/TicketCube'
import {
    TicketMessagesMeasure,
    TicketMessagesMember,
    TicketMessagesSegment,
} from 'models/reporting/cubes/TicketMessagesCube'
import {
    TicketSatisfactionSurveyMeasure,
    TicketSatisfactionSurveySegment,
} from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import {
    ReportingFilter,
    ReportingFilterOperator,
    ReportingQuery,
} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {
    AutomationAddonStatsFiltersMembers,
    formatReportingQueryDate,
    getFilterDateRange,
    getPreviousPeriod,
    HelpdeskMessagesStatsFiltersMembers,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

export const NotSpamNorTrashedTicketsFilter = [
    {
        member: TicketMember.IsTrashed,
        operator: ReportingFilterOperator.Equals,
        values: ['0'],
    },
    {
        member: TicketMember.IsSpam,
        operator: ReportingFilterOperator.Equals,
        values: ['0'],
    },
]

export const customerSatisfactionQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string
) => ({
    measures: [TicketSatisfactionSurveyMeasure.SurveyScore],
    dimensions: [],
    timezone,
    segments: [TicketSatisfactionSurveySegment.SurveyScored],
    filters: [
        ...NotSpamNorTrashedTicketsFilter,
        ...statsFiltersToReportingFilters(
            TicketStatsFiltersMembers,
            statsFilters
        ),
    ],
})

export const useCustomerSatisfactionTrend = (
    filters: StatsFilters,
    timezone: string
) =>
    useMetricTrend(
        customerSatisfactionQueryFactory(filters, timezone),
        customerSatisfactionQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone
        )
    )

export const firstResponseTimeQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string
) => {
    const {agents, ...statFiltersWithoutAgents} = statsFilters
    const commonFilters: ReportingFilter[] = [
        ...NotSpamNorTrashedTicketsFilter,
        {
            member: TicketMessagesMember.FirstHelpdeskMessageDatetime,
            operator: ReportingFilterOperator.InDateRange,
            values: getFilterDateRange(statsFilters),
        },
    ]
    if (agents?.length) {
        commonFilters.push({
            member: TicketMessagesMember.FirstHelpdeskMessageUserId,
            operator: ReportingFilterOperator.Equals,
            values: agents.map((agent) => agent.toString()),
        })
    }

    return {
        measures: [TicketMessagesMeasure.FirstResponseTime],
        dimensions: [],
        timezone,
        segments: [TicketMessagesSegment.ConversationStarted],
        filters: [
            ...commonFilters,
            ...statsFiltersToReportingFilters(
                TicketStatsFiltersMembers,
                statFiltersWithoutAgents
            ),
        ],
    }
}

export const useFirstResponseTimeTrend = (
    filters: StatsFilters,
    timezone: string
) =>
    useMetricTrend(
        firstResponseTimeQueryFactory(filters, timezone),
        firstResponseTimeQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone
        )
    )

export const messagesPerTicketTrendQueryFactory = (
    filters: StatsFilters,
    timezone: string
) => ({
    measures: [TicketMessagesMeasure.MessagesAverage],
    dimensions: [],
    timezone,
    segments: [
        TicketSegment.ClosedTickets,
        TicketMessagesSegment.ConversationStarted,
    ],
    filters: [
        ...NotSpamNorTrashedTicketsFilter,
        ...statsFiltersToReportingFilters(TicketStatsFiltersMembers, filters),
    ],
})

export const useMessagesPerTicketTrend = (
    filters: StatsFilters,
    timezone: string
) =>
    useMetricTrend(
        messagesPerTicketTrendQueryFactory(filters, timezone),
        messagesPerTicketTrendQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone
        )
    )

export const resolutionTimeQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string
) => ({
    measures: [TicketMessagesMeasure.ResolutionTime],
    dimensions: [],
    timezone,
    segments: [
        TicketSegment.ClosedTickets,
        TicketMessagesSegment.ConversationStarted,
    ],
    filters: [
        ...NotSpamNorTrashedTicketsFilter,
        ...statsFiltersToReportingFilters(
            TicketStatsFiltersMembers,
            statsFilters
        ),
    ],
})

export const useResolutionTimeTrend = (
    filters: StatsFilters,
    timezone: string
) =>
    useMetricTrend(
        resolutionTimeQueryFactory(filters, timezone),
        resolutionTimeQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone
        )
    )

export const openTicketsTrendQueryFactory = (
    filters: StatsFilters,
    timezone: string
) => ({
    measures: [TicketMeasure.TicketCount],
    dimensions: [],
    timezone,
    filters: [
        ...NotSpamNorTrashedTicketsFilter,
        {
            member: TicketMember.Status,
            operator: ReportingFilterOperator.Equals,
            values: ['open'],
        },
        ...statsFiltersToReportingFilters(
            TicketStatsFiltersMembers,
            filters
        ).filter(
            (filter) => filter.member !== TicketStatsFiltersMembers.periodStart
        ),
    ],
})
export const useOpenTicketsTrend = (filters: StatsFilters, timezone: string) =>
    useMetricTrend(
        openTicketsTrendQueryFactory(filters, timezone),
        openTicketsTrendQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone
        )
    )

export const closedTicketsQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string
) => ({
    measures: [TicketMeasure.TicketCount],
    dimensions: [],
    timezone,
    segments: [TicketSegment.ClosedTickets],
    filters: [
        ...NotSpamNorTrashedTicketsFilter,
        ...statsFiltersToReportingFilters(
            TicketStatsFiltersMembers,
            statsFilters
        ),
    ],
})

export const useClosedTicketsTrend = (
    filters: StatsFilters,
    timezone: string
) =>
    useMetricTrend(
        closedTicketsQueryFactory(filters, timezone),
        closedTicketsQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone
        )
    )

export const ticketsCreatedQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string
) => {
    const {agents, ...statFiltersWithoutAgents} = statsFilters
    const commonFilters: ReportingFilter[] = [
        {
            member: TicketMember.CreatedDatetime,
            operator: ReportingFilterOperator.InDateRange,
            values: getFilterDateRange(statsFilters),
        },
        ...NotSpamNorTrashedTicketsFilter,
    ]
    if (agents?.length) {
        commonFilters.push({
            member: TicketMessagesMember.FirstHelpdeskMessageUserId,
            operator: ReportingFilterOperator.Equals,
            values: agents.map((agent) => agent.toString()),
        })
        commonFilters.push({
            member: TicketMessagesMember.PeriodStart,
            operator: ReportingFilterOperator.AfterDate,
            values: [statFiltersWithoutAgents.period.start_datetime],
        })
    }

    return {
        measures: [TicketMeasure.TicketCount],
        dimensions: [],
        segments: agents?.length
            ? [TicketMessagesSegment.TicketCreatedByAgent]
            : [], //TODO
        timezone,
        filters: [
            ...commonFilters,
            ...statsFiltersToReportingFilters(
                TicketStatsFiltersMembers,
                statFiltersWithoutAgents
            ),
        ],
    }
}

export const useTicketsCreatedTrend = (
    filters: StatsFilters,
    timezone: string
) =>
    useMetricTrend(
        ticketsCreatedQueryFactory(filters, timezone),
        ticketsCreatedQueryFactory(
            {...filters, period: getPreviousPeriod(filters.period)},
            timezone
        )
    )

export const ticketsRepliedQueryFactory = (
    filters: StatsFilters,
    timezone: string
) => ({
    measures: [HelpdeskMessageMeasure.TicketCount],
    dimensions: [],
    timezone,
    filters: [
        ...NotSpamNorTrashedTicketsFilter,
        {
            member: HelpdeskMessageMember.SentDatetime,
            operator: ReportingFilterOperator.InDateRange,
            values: getFilterDateRange(filters),
        },
        {
            member: TicketMember.PeriodStart,
            operator: ReportingFilterOperator.AfterDate,
            values: [formatReportingQueryDate(filters.period.start_datetime)],
        },
        {
            member: TicketMember.PeriodEnd,
            operator: ReportingFilterOperator.BeforeDate,
            values: [formatReportingQueryDate(filters.period.end_datetime)],
        },
        {
            member: TicketMember.Channel,
            operator: ReportingFilterOperator.NotEquals,
            values: [TicketMessageSourceType.InternalNote],
        },
        ...statsFiltersToReportingFilters(
            HelpdeskMessagesStatsFiltersMembers,
            filters
        ),
    ],
})

export const useTicketsRepliedTrend = (
    filters: StatsFilters,
    timezone: string
) =>
    useMetricTrend(
        ticketsRepliedQueryFactory(filters, timezone),
        ticketsRepliedQueryFactory(
            {...filters, period: getPreviousPeriod(filters.period)},
            timezone
        )
    )

export const messagesSentQueryFactory = (
    filters: StatsFilters,
    timezone: string
): ReportingQuery<HelpdeskMessageCubeWithJoins> => ({
    measures: [HelpdeskMessageMeasure.MessageCount],
    dimensions: [],
    timezone,
    filters: [
        {
            member: TicketMember.PeriodStart,
            operator: ReportingFilterOperator.AfterDate,
            values: [formatReportingQueryDate(filters.period.start_datetime)],
        },
        {
            member: TicketMember.PeriodEnd,
            operator: ReportingFilterOperator.BeforeDate,
            values: [formatReportingQueryDate(filters.period.end_datetime)],
        },
        {
            member: HelpdeskMessageMember.SentDatetime,
            operator: ReportingFilterOperator.InDateRange,
            values: getFilterDateRange(filters),
        },
        ...statsFiltersToReportingFilters(
            HelpdeskMessagesStatsFiltersMembers,
            filters
        ),
    ],
})

export const useMessagesSentTrend = (filters: StatsFilters, timezone: string) =>
    useMetricTrend(
        messagesSentQueryFactory(filters, timezone),
        messagesSentQueryFactory(
            {...filters, period: getPreviousPeriod(filters.period)},
            timezone
        )
    )

const automationAddOnDefaultFilters = (filters: StatsFilters) => [
    {
        member: AutomationBillingEventMember.CreatedDate,
        operator: ReportingFilterOperator.InDateRange,
        values: getFilterDateRange(filters),
    },
    ...statsFiltersToReportingFilters(
        AutomationAddonStatsFiltersMembers,
        filters
    ),
]

export const firstResponseTimeWithAutomationQueryFactory = (
    filters: StatsFilters,
    timezone: string
) => ({
    measures: [AutomationBillingEventMeasure.FirstResponseTimeWithAutomation],
    dimensions: [],
    timezone,
    filters: automationAddOnDefaultFilters(filters),
})

export const useFirstResponseTimeWithAutomationTrend = (
    filters: StatsFilters,
    timezone: string
) =>
    useMetricTrend(
        firstResponseTimeWithAutomationQueryFactory(filters, timezone),
        firstResponseTimeWithAutomationQueryFactory(
            {...filters, period: getPreviousPeriod(filters.period)},
            timezone
        )
    )

export const resolutionTimeWithAutomationQueryFactory = (
    filters: StatsFilters,
    timezone: string
) => ({
    measures: [AutomationBillingEventMeasure.ResolutionTimeWithAutomation],
    dimensions: [],
    timezone,
    filters: automationAddOnDefaultFilters(filters),
})

export const useResolutionTimeWithAutomationTrend = (
    filters: StatsFilters,
    timezone: string
) =>
    useMetricTrend(
        resolutionTimeWithAutomationQueryFactory(filters, timezone),
        resolutionTimeWithAutomationQueryFactory(
            {...filters, period: getPreviousPeriod(filters.period)},
            timezone
        )
    )

export const overallTimeSavedWithAutomationQueryFactory = (
    filters: StatsFilters,
    timezone: string
) => ({
    measures: [AutomationBillingEventMeasure.OverallTimeSaved],
    dimensions: [],
    timezone,
    filters: automationAddOnDefaultFilters(filters),
})

export const useOverallTimeSavedWithAutomationTrend = (
    filters: StatsFilters,
    timezone: string
) =>
    useMetricTrend(
        overallTimeSavedWithAutomationQueryFactory(filters, timezone),
        overallTimeSavedWithAutomationQueryFactory(
            {...filters, period: getPreviousPeriod(filters.period)},
            timezone
        )
    )

export const automationRateQueryFactory = (
    filters: StatsFilters,
    timezone: string
) => ({
    measures: [AutomationBillingEventMeasure.AutomationRate],
    dimensions: [],
    timezone,
    filters: automationAddOnDefaultFilters(filters),
})

export const useAutomationRateTrend = (
    filters: StatsFilters,
    timezone: string
) =>
    useMetricTrend(
        automationRateQueryFactory(filters, timezone),
        automationRateQueryFactory(
            {...filters, period: getPreviousPeriod(filters.period)},
            timezone
        )
    )

export const automatedInteractionsQueryFactory = (
    filters: StatsFilters,
    timezone: string
) => ({
    measures: [AutomationBillingEventMeasure.AutomatedInteractions],
    dimensions: [],
    timezone,
    filters: automationAddOnDefaultFilters(filters),
})

export const useAutomatedInteractionsTrend = (
    filters: StatsFilters,
    timezone: string
) =>
    useMetricTrend(
        automatedInteractionsQueryFactory(filters, timezone),
        automatedInteractionsQueryFactory(
            {...filters, period: getPreviousPeriod(filters.period)},
            timezone
        )
    )
