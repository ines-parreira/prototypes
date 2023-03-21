export enum AnalyticsFilterMember {}

export enum AnalyticsFilterOperator {
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

export type AnalyticsFilter = {
    or?: string
    and?: string
    member?: AnalyticsFilterMember
    operator?: AnalyticsFilterOperator
    values?: string[]
}

export enum AnalyticsDimension {}

export enum AnalyticsMeasure {}

export enum AnalyticsTimeDimensionGranularity {
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

export type AnalyticsOrder = [
    AnalyticsDimension | AnalyticsMeasure,
    'asc' | 'desc'
]

export type AnalyticsTimeDimension = {
    dimension: AnalyticsDimension
    granularity?: AnalyticsTimeDimensionGranularity
    dateRange?: string[]
}

export type GetAnalyticsParams = {
    dimensions: AnalyticsDimension[]
    filters: AnalyticsFilter[]
    limit?: number
    measures: AnalyticsMeasure[]
    order?: AnalyticsOrder[]
    timeDimensions: AnalyticsTimeDimension[]
    timezone?: string
}

export type GetAnalyticsResponse<TData extends unknown[]> = {
    annotation: {
        title: string
        shortTitle: string
        type: string
    }
    data: TData
    query: string
}
