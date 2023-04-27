import {
    CampaignOrderEventsDimension,
    CampaignOrderEventsMeasure,
    EventsDimension,
    EventsMeasure,
    EventsSegment,
    OrderConversionDimension,
    OrderConversionMeasure,
} from 'pages/stats/revenue/clients/constants'

export enum TicketStateMeasure {
    SurveyScore = 'TicketState.surveyScore',
    FirstResponseTime = 'TicketState.firstResponseTime',
    ResolutionTime = 'TicketState.resolutionTime',
    MessagesAverage = 'TicketState.messagesAverage',
    TicketCount = 'TicketState.ticketCount',
}

export enum TicketStateDimension {
    CreatedDatetime = 'TicketState.createdDatetime',
    ClosedDatetime = 'TicketState.closedDatetime',
    Channel = 'TicketState.channel',
}

export enum TicketStateSegment {
    SurveyScored = 'TicketState.surveyScored',
    ConversationStarted = 'TicketState.conversationStarted',
    ClosedTickets = 'TicketState.closedTickets',
    WorkloadTickets = 'TicketState.workloadTickets',
}

export enum TicketStateMember {
    PeriodStart = 'TicketState.periodStart',
    PeriodEnd = 'TicketState.periodEnd',
    Channel = 'TicketState.channel',
    CreatedDatetime = 'TicketState.createdDatetime',
    Integration = 'TicketState.integration',
    AssigneeUserId = 'TicketState.assigneeUserId',
    IsTrashed = 'TicketState.isTrashed',
    IsSpam = 'TicketState.isSpam',
    FirstHelpdeskMessageDatetime = 'TicketState.firstHelpdeskMessageDatetime',
    FirstHelpdeskMessageUserId = 'TicketState.firstHelpdeskMessageUserId',
}

export enum OpenTicketStateMeasure {
    TicketCount = 'OpenTicketState.ticketCount',
}

export enum OpenTicketStateMember {
    PeriodStart = 'OpenTicketState.periodStart',
    PeriodEnd = 'OpenTicketState.periodEnd',
    Channel = 'OpenTicketState.channel',
    Integration = 'OpenTicketState.integration',
    AssigneeUserId = 'OpenTicketState.assigneeUserId',
    IsTrashed = 'OpenTicketState.isTrashed',
    IsSpam = 'OpenTicketState.isSpam',
}

export enum MessageStateMeasure {
    TicketCount = 'MessageState.ticketCount',
    MessageCount = 'MessageState.messageCount',
}

export enum MessageStateMember {
    PeriodStart = 'MessageState.periodStart',
    PeriodEnd = 'MessageState.periodEnd',
    Channel = 'MessageState.channel',
    Integration = 'MessageState.integration',
    SenderId = 'MessageState.senderId',
    SentDatetime = 'MessageState.sentDatetime',
}

export enum MessageStateDimension {
    CreatedDatetime = 'MessageState.createdDatetime',
    PeriodStart = 'MessageState.periodStart',
    SentDatetime = 'MessageState.sentDatetime',
}

export type ReportingMeasure =
    | TicketStateMeasure
    | OpenTicketStateMeasure
    | MessageStateMeasure
    | EventsMeasure
    | OrderConversionMeasure
    | CampaignOrderEventsMeasure

export type ReportingDimension =
    | TicketStateDimension
    | MessageStateDimension
    | EventsDimension
    | OrderConversionDimension
    | CampaignOrderEventsDimension

export type ReportingSegment = TicketStateSegment | EventsSegment

export type ReportingFilterMember =
    | TicketStateMember
    | OpenTicketStateMember
    | MessageStateMember

export enum ReportingFilterOperator {
    Equals = 'equals',
    NotEquals = 'notEquals',
    Contains = 'contains',
    NotContains = 'notContains',
    StartsWith = 'startsWith',
    NotStartsWith = 'notStartsWith',
    EndsWith = 'endsWith',
    NotEndsWith = 'notEndsWith',
    In = 'in',
    NotIn = 'notIn',
    Gt = 'gt',
    Gte = 'gte',
    Lt = 'lt',
    Lte = 'lte',
    Set = 'set',
    NotSet = 'notSet',
    InDateRange = 'inDateRange',
    NotInDateRange = 'notInDateRange',
    OnTheDate = 'onTheDate',
    BeforeDate = 'beforeDate',
    AfterDate = 'afterDate',
    MeasureFilter = 'measureFilter',
}

export type ReportingFilter = {
    or?: string
    and?: string
    member?: ReportingFilterMember
    operator?: ReportingFilterOperator
    values?: string[]
}

export enum ReportingGranularity {
    Year = 'year',
    Quarter = 'quarter',
    Month = 'month',
    Week = 'week',
    Day = 'day',
    Hour = 'hour',
    Minute = 'minute',
    Second = 'second',
}

export type ReportingOrder = [
    ReportingDimension | ReportingMeasure,
    'asc' | 'desc'
]

export type ReportingTimeDimension = {
    dimension: ReportingDimension
    granularity?: ReportingGranularity
    dateRange?: string[]
}

export type ReportingQuery = {
    measures: ReportingMeasure[]
    dimensions: ReportingDimension[]
    filters: ReportingFilter[]
    segments?: ReportingSegment[]
    order?: ReportingOrder[]
    limit?: number
    timeDimensions?: ReportingTimeDimension[]
    timezone?: string
}

export type ReportingParams = ReportingQuery[]

export type ReportingResponse<TData extends unknown[]> = {
    annotation: {
        title: string
        shortTitle: string
        type: string
    }
    data: TData
    query: ReportingQuery
}
