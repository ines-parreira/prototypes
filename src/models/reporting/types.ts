import {OrderDirection} from 'models/api/types'

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
    AssigneeUserId = 'Ticket.assigneeUserId',
    FirstMessageChannel = 'TicketMessages.firstMessageChannel',
    FirstHelpdeskMessageUserId = 'TicketMessages.firstHelpdeskMessageUserId',
}

export enum TicketSegment {
    SurveyScored = 'TicketSatisfactionSurvey.surveyScored',
    ConversationStarted = 'TicketMessages.conversationStarted',
    ClosedTickets = 'Ticket.closedTickets',
    WorkloadTickets = 'Ticket.workloadTickets',
    TicketCreatedByAgent = 'TicketMessages.ticketCreatedByAgent',
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
    Tags = 'Ticket.tags',
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
    SenderId = 'HelpdeskMessage.senderId',
}

export enum TicketMessagesDimension {
    PeriodStart = 'TicketMessages.periodStart',
    PeriodEnd = 'TicketMessages.periodEnd',
}

// Automation add-on

// AutomationEvent
export enum AutomationEventDimension {
    Channel = 'AutomationEvent.channel',
    AccountId = 'AutomationEvent.accountId',
}
export enum AutomationEventMember {
    PeriodStart = 'AutomationEvent.periodStart',
    PeriodEnd = 'AutomationEvent.periodEnd',
    CreatedDate = 'AutomationEvent.createdDate',
}

// AutomationBillingEvent
export enum AutomationBillingEventDimension {
    CreatedDate = 'AutomationBillingEvent.createdDate',
    AccountId = 'AutomationBillingEvent.accountId',
}
export enum AutomationBillingEventMember {
    PeriodStart = 'AutomationBillingEvent.periodStart',
    PeriodEnd = 'AutomationBillingEvent.periodEnd',
    CreatedDate = 'AutomationBillingEvent.createdDate',
    AccountId = 'AutomationBillingEvent.accountId',
    AutomatedInteractions = 'AutomationBillingEvent.automatedInteractions',
}
export enum AutomationBillingEventMeasures {
    FirstResponseTimeWithAutomation = 'AutomationBillingEvent.firstResponseTimeWithAutomation',
    ResolutionTimeWithAutomation = 'AutomationBillingEvent.resolutionTimeWithAutomation',
    OverallTimeSaved = 'AutomationBillingEvent.overallTimeSaved',
    AutomationRate = 'AutomationBillingEvent.automationRate',
    AutomatedInteractions = 'AutomationBillingEvent.automatedInteractions',
    AutomatedInteractionsByTrackOrder = 'AutomationBillingEvent.automatedInteractionsByTrackOrder',
    AutomatedInteractionsByLoopReturns = 'AutomationBillingEvent.automatedInteractionsByLoopReturns',
    AutomatedInteractionsByQuickResponse = 'AutomationBillingEvent.automatedInteractionsByQuickResponse',
    AutomatedInteractionsByArticleRecommendation = 'AutomationBillingEvent.automatedInteractionsByArticleRecommendation',
    AutomatedInteractionsByAutomatedResponse = 'AutomationBillingEvent.automatedInteractionsByAutomatedResponse',
    AutomatedInteractionsByAutoResponders = 'AutomationBillingEvent.automatedInteractionsByAutoResponders',
    AutomatedInteractionsByQuickResponseFlows = 'AutomationBillingEvent.automatedInteractionsByQuickResponseFlows',
}

// BillableData
export enum BillableDataDimension {
    BillableTicketCount = 'BillableData.billableTicketCount',
    AccountId = 'BillableData.accountId',
    FirstMessageChannel = 'BillableData.firstMessageChannel',
    TicketId = 'BillableData.ticketId',
    AvgResolutionTime = 'BillableData.avgResolutionTime',
    AvgFirstResponseTime = 'BillableData.avgFirstResponseTime',
    TicketCreatedDate = 'BillableData.ticketCreatedDate',
}

export type ReportingMeasure =
    | TicketMeasure
    | EventsMeasure
    | OrderConversionMeasure
    | CampaignOrderEventsMeasure
    | HelpdeskMessageMeasure
    | AutomationBillingEventMeasures

export type ReportingDimension =
    | TicketDimension
    | EventsDimension
    | OrderConversionDimension
    | CampaignOrderEventsDimension
    | HelpdeskMessageDimension
    | TicketMessagesDimension
    | AutomationBillingEventDimension
    | AutomationEventDimension

export type ReportingSegment = TicketSegment | EventsSegment

export type ReportingFilterMember =
    | TicketMember
    | HelpdeskMessageMember
    | AutomationBillingEventMember
    | AutomationEventMember

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
    OrderDirection
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
