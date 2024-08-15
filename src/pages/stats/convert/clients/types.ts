import {TicketChannel} from 'business/types/ticket'
import {ReportingGranularity} from 'models/reporting/types'
import {OrderDirection} from 'models/api/types'
import {SharedDimension} from './constants'

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
    abVariant?: string
} & RequiredFilterParams

export type FilterParams = {
    shopName?: string
    campaignIds?: string[]
    abVariant?: string
    granularity?: ReportingGranularity
    limit?: number
    offset?: number
    timezone?: string
    sorting?: OrderDirection
} & RequiredFilterParams

export type CubeFilterParams = FilterParams

export type GroupDimension =
    | SharedDimension.campaignId
    | SharedDimension.abVariant

export type CampaignCubeFilterParams = FilterParams & {
    groupDimension: GroupDimension
}

export type RevenueAttributionFilterParams = {
    integrationIds?: number[]
    channels?: TicketChannel[]
} & FilterParams

export type CubeData = CubeMetric[]
