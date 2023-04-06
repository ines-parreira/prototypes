export enum ReportingFilterMember {}

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

export enum ReportingDimension {
    CreatedDatetime = 'created_datetime',
}

export enum ReportingMeasure {
    CustomerSatisfaction = 'ticketStateCube.CustomerSatisfaction',
    FirstResponseTime = 'ticketStateCube.TicketFirstResponseTime',
    ResolutionTime = 'ticketStateCube.ResolutionTime',
    MessagesPerTicket = 'ticketStateCube.MessagesPerTicket',
    OpenTickets = 'ticketStateCube.OpenTickets',
    ClosedTickets = 'ticketStateCube.ClosedTickets',
    TicketsCreated = 'ticketStateCube.TicketsCreated',
    TicketsReplied = 'ticketStateCube.TicketsReplied',
    MessagesSent = 'ticketStateCube.MessagesSent',
}

export enum ReportingTimeDimensionGranularity {
    Quarter = 'quarter',
    Day = 'day',
    Month = 'month',
    Year = 'year',
    Week = 'week',
    Hour = 'hour',
    Minute = 'minute',
    Second = 'second',
    Null = 'null',
}

export type ReportingOrder = [
    ReportingDimension | ReportingMeasure,
    'asc' | 'desc'
]

export type ReportingTimeDimension = {
    dimension: ReportingDimension
    granularity?: ReportingTimeDimensionGranularity
    dateRange?: string[]
}

export type GetReportingParams = {
    dimensions: ReportingDimension[]
    filters: ReportingFilter[]
    limit?: number
    measures: ReportingMeasure[]
    order?: ReportingOrder[]
    timeDimensions: ReportingTimeDimension[]
    timezone?: string
}

export type GetReportingResponse<TData extends unknown[]> = {
    annotation: {
        title: string
        shortTitle: string
        type: string
    }
    data: TData
    query: string
}
