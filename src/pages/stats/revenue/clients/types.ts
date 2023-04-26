import {TicketChannel} from 'business/types/ticket'
import {ReportingGranularity} from 'models/reporting/types'

export type CubeFilter = {
    [key: string]: any
}

export type CubeMetric = {
    [key: string]: string
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
    granularity?: ReportingGranularity
    limit?: number
    offset?: number
} & RequiredFilterParams

export type CubeFilterParams = FilterParams

export type RevenueAttributionFilterParams = {
    integrationIds?: number[]
    channels?: TicketChannel[]
} & FilterParams

export type CubeData = CubeMetric[]
