import {TicketChannel} from 'business/types/ticket'
import {ReportingGranularity} from 'models/reporting/types'

export type CubeFilter = {
    member: any
    operator: any
    values: string[]
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
    timezone?: string
} & RequiredFilterParams

export type CubeFilterParams = FilterParams

export type RevenueAttributionFilterParams = {
    integrationIds?: number[]
    channels?: TicketChannel[]
} & FilterParams

export type CubeData = CubeMetric[]
