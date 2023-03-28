import {TicketChannel} from 'business/types/ticket'

type KeyValuePair = {
    [key: string]: string | string[]
}

export type CubeQueryBody = {
    measures?: string[]
    dimensions?: string[]
    timeDimensions?: KeyValuePair[]
    order?: string[][]
    filters?: KeyValuePair[]
    segments?: string[]
    limit?: number
    offset?: number
}

export type CubeFilter = {
    [key: string]: any
}

export type CubeMetric = {
    [key: string]: string
}

export type CubeResponse = {
    data: CubeMetric[]
}

export type RequiredFilterParams = {
    startDate: string
    endDate: string
}

export type DefaultFilterParams = {
    cubeName: string
    campaignIds?: string[]
    shopName?: string
} & RequiredFilterParams

export type FilterParams = {
    shopName?: string
    campaignIds?: string[]
    granularity?: TimeGranularity
    limit?: number
    offset?: number
} & RequiredFilterParams

export type CubeFilterParams = FilterParams

export type RevenueAttributionFilterParams = {
    integrationIds?: number[]
    channels?: TicketChannel[]
} & FilterParams

export type TimeGranularity =
    | 'second'
    | 'minute'
    | 'hour'
    | 'day'
    | 'week'
    | 'month'
    | 'quarter'
    | 'year'

export type CubeData = CubeMetric[]
