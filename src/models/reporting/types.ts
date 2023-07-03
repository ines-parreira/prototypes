import {
    CampaignOrderEventsDimension,
    CampaignOrderEventsMeasure,
    EventsDimension,
    EventsMeasure,
    EventsSegment,
    OrderConversionDimension,
    OrderConversionMeasure,
} from 'pages/stats/revenue/clients/constants'

export enum TicketMeasure {
    SurveyScore = 'TicketSatisfactionSurvey.surveyScore',
    FirstResponseTime = 'TicketMessages.firstResponseTime',
    ResolutionTime = 'TicketMessages.resolutionTime',
    MessagesAverage = 'TicketMessages.messagesAverage',
    TicketCount = 'Ticket.ticketCount',
}

export enum TicketDimension {
    CreatedDatetime = 'Ticket.createdDatetime',
    ClosedDatetime = 'Ticket.closedDatetime',
    FirstMessageChannel = 'TicketMessages.firstMessageChannel',
}

export enum TicketSegment {
    SurveyScored = 'TicketSatisfactionSurvey.surveyScored',
    ConversationStarted = 'TicketMessages.conversationStarted',
    ClosedTickets = 'Ticket.closedTickets',
    WorkloadTickets = 'Ticket.workloadTickets',
}

export enum TicketMember {
    PeriodStart = 'Ticket.periodStart',
    PeriodEnd = 'Ticket.periodEnd',
    FirstMessageChannel = 'TicketMessages.firstMessageChannel',
    CreatedDatetime = 'Ticket.createdDatetime',
    Integration = 'TicketMessages.integration',
    AssigneeUserId = 'Ticket.assigneeUserId',
    IsTrashed = 'Ticket.isTrashed',
    IsSpam = 'Ticket.isSpam',
    Status = 'Ticket.status',
    FirstHelpdeskMessageDatetime = 'TicketMessages.firstHelpdeskMessageDatetime',
    FirstHelpdeskMessageUserId = 'TicketMessages.firstHelpdeskMessageUserId',
}

export enum HelpdeskMessageMeasure {
    TicketCount = 'HelpdeskMessage.ticketCount',
    MessageCount = 'HelpdeskMessage.messageCount',
}

export enum HelpdeskMessageDimension {
    TicketId = 'HelpdeskMessage.ticketId',
    PeriodStart = 'HelpdeskMessage.periodStart',
    PeriodEnd = 'HelpdeskMessage.periodEnd',
    SentDatetime = 'HelpdeskMessage.sentDatetime',
    AccountId = 'HelpdeskMessage.accountId',
    SenderId = 'HelpdeskMessage.senderId',
}
export enum HelpdeskMessageMember {
    SentDatetime = 'HelpdeskMessage.sentDatetime',
    AccountId = 'HelpdeskMessage.accountId',
    PeriodStart = 'HelpdeskMessage.periodStart',
    PeriodEnd = 'HelpdeskMessage.periodEnd',
    Channel = 'HelpdeskMessage.channel',
}

export enum TicketMessagesDimension {
    PeriodStart = 'TicketMessages.periodStart',
    PeriodEnd = 'TicketMessages.periodEnd',
}

export type ReportingMeasure =
    | TicketMeasure
    | EventsMeasure
    | OrderConversionMeasure
    | CampaignOrderEventsMeasure
    | HelpdeskMessageMeasure

export type ReportingDimension =
    | TicketDimension
    | EventsDimension
    | OrderConversionDimension
    | CampaignOrderEventsDimension
    | HelpdeskMessageDimension
    | TicketMessagesDimension

export type ReportingSegment = TicketSegment | EventsSegment

export type ReportingFilterMember = TicketMember | HelpdeskMessageMember

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
    member: ReportingFilterMember
    operator: ReportingFilterOperator
    values: string[]
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
