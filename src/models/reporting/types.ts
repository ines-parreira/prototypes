import {OrderDirection} from 'models/api/types'

import {Cubes} from 'models/reporting/cubes'
import {FilterKey, StatsFilters} from 'models/stat/types'

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
    BeforeOrOnDate = 'beforeOrOnDate',
    AfterOrOnDate = 'afterOrOnDate',
    MeasureFilter = 'measureFilter',
}

export type ReportingFilter = {
    member: Cubes['filters']
    operator: ReportingFilterOperator
    values: (string | null)[]
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

export type ReportingOrder<OrderingField> = [OrderingField, OrderDirection]

export type ReportingTimeDimension<ReportingDimension> = {
    dimension: ReportingDimension
    granularity: ReportingGranularity
    dateRange: string[]
}

export type Cube<
    ReportingMeasure = unknown,
    ReportingDimension = unknown,
    ReportingSegment = unknown,
    ReportingFilterMember = unknown,
    ReportingTimeDimension = unknown,
> = {
    measures: ReportingMeasure
    dimensions: ReportingDimension
    filters: ReportingFilterMember
    segments: ReportingSegment
    timeDimensions: ReportingTimeDimension
}

export type JoinedCubesWithMapping<
    BaseCube extends Cube,
    JoinedCube extends Cube,
> = {
    [Property in keyof Cube]: BaseCube[Property] | JoinedCube[Property]
}

export type ReportingQuery<TCube extends Cube = Cube> = {
    measures: TCube['measures'][]
    dimensions: TCube['dimensions'][]
    filters: ReportingFilter[]
    segments?: TCube['segments'][]
    order?: ReportingOrder<TCube['dimensions'] | TCube['measures']>[]
    limit?: number
    offset?: number
    timeDimensions?: ReportingTimeDimension<TCube['timeDimensions']>[]
    timezone?: string
}

export type TimeSeriesQuery<TCube extends Cube = Cube> = Omit<
    ReportingQuery<TCube>,
    'timeDimensions'
> & {
    timeDimensions: [Required<ReportingTimeDimension<TCube['timeDimensions']>>]
}

export type ReportingParams<TCube extends Cube = Cube> = ReportingQuery<TCube>[]

export type ReportingResponse<TData> = {
    annotation: {
        title: string
        shortTitle: string
        type: string
    }
    data: TData
    query: ReportingQuery
}

export type QueryFactory<T extends Cube> = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
) => ReportingQuery<T>

export enum EnrichmentFields {
    TicketId = 'Ticket.id',
    TicketName = 'Ticket.subject',
    Status = 'Ticket.status',
    Description = 'Ticket.excerpt',
    Channel = 'Ticket.channel',
    AssigneeId = 'Ticket.assignee_user_id',
    CreatedDatetime = 'Ticket.created_datetime',
    ContactReason = 'Ticket.contact_reason',
    IsUnread = 'Ticket.is_unread',
    CustomerIntegrationDataByExternalId = 'CustomerIntegrationDataByExternalId.id',
    OrderCustomerId = 'OrderConversion.customerId',
}

export const SAVABLE_FILTERS: Exclude<FilterKey, FilterKey.Period>[] = [
    FilterKey.CustomFields,
    FilterKey.Channels,
    FilterKey.Integrations,
    FilterKey.Agents,
    FilterKey.Tags,
]
