import { MetricName } from 'domains/reporting/hooks/metricNames'
import { Cubes } from 'domains/reporting/models/cubes'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { OrderDirection } from 'models/api/types'

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
    ReportingMetricName = unknown,
> = {
    measures: ReportingMeasure
    dimensions: ReportingDimension
    metricName: ReportingMetricName
    segments: ReportingSegment
    filters: ReportingFilterMember
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
    metricName: MetricName
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

export type ReportingV2Response<TData> = {
    data: TData
}

export type ReportingV2QueryResponse<TData> = TData

export type QueryFactory<T extends Cube> = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
) => ReportingQuery<T>

export enum EnrichmentFields {
    TicketId = 'Ticket.id',
    TicketName = 'Ticket.subject',
    Status = 'Ticket.status',
    Description = 'Ticket.excerpt',
    Channel = 'Ticket.channel',
    AssigneeId = 'Ticket.assignee_user_id',
    AssigneeName = 'Ticket.assignee_name',
    CreatedDatetime = 'Ticket.created_datetime',
    ContactReason = 'Ticket.contact_reason',
    IsUnread = 'Ticket.is_unread',
    CustomerIntegrationDataByExternalId = 'CustomerIntegrationDataByExternalId.id',
    OrderCustomerId = 'OrderConversion.customerId',
    CustomFields = 'Ticket.custom_fields',
    CustomerName = 'Ticket.customer_name',
    ProductId = 'Product.externalId',
    ProductTitle = 'Product.title',
    ProductHandle = 'Product.handle',
    ProductThumbnailUrl = 'Product.thumbnail_url',
    ProductExternalProductId = 'Product.external_product_id',
    ProductsTitles = 'Products.titles',
    ProductsVariants = 'Products.variants',
}
