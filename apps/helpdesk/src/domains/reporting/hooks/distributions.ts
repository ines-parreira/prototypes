import type { TicketChannel } from 'business/types/ticket'
import type {
    MetricWithDecile,
    ReportingMetricItemValue,
} from 'domains/reporting/hooks/types'
import {
    fetchMetricPerDimensionV2,
    useMetricPerDimensionV2,
} from 'domains/reporting/hooks/useMetricPerDimension'
import type { Cubes } from 'domains/reporting/models/cubes'
import {
    TicketDimension,
    TicketMeasure,
} from 'domains/reporting/models/cubes/TicketCube'
import { workloadPerChannelDistributionQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/workloadPerChannel'
import { workloadTicketsPerChannelQueryV2Factory } from 'domains/reporting/models/scopes/workloadTickets'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { humanizeChannel } from 'state/ticket/utils'

export const CHANNEL_DIMENSION = TicketDimension.Channel
export const TICKET_COUNT_MEASURE = TicketMeasure.TicketCount

export type MetricPerDimensionFetch = (
    filters: StatsFilters,
    timezone: string,
) => Promise<{
    data: { label: string; value: number }[]
}>

export const useWorkloadPerChannelDistribution = (
    filters: StatsFilters,
    timezone: string,
    enabled?: boolean,
) => {
    const query = workloadPerChannelDistributionQueryFactory(filters, timezone)
    const queryV2 = workloadTicketsPerChannelQueryV2Factory({
        filters,
        timezone,
    })

    return formatLabel(
        useMetricPerDimensionV2(query, queryV2, undefined, enabled),
    )
}

export const fetchWorkloadPerChannelDistribution = (
    filters: StatsFilters,
    timezone: string,
) => {
    const query = workloadPerChannelDistributionQueryFactory(filters, timezone)
    const queryV2 = workloadTicketsPerChannelQueryV2Factory({
        filters,
        timezone,
    })

    return fetchMetricPerDimensionV2(query, queryV2).then(formatLabel)
}

export const useWorkloadPerChannelDistributionForPreviousPeriod = (
    filters: StatsFilters,
    timezone: string,
    enabled?: boolean,
) => {
    const query = workloadPerChannelDistributionQueryFactory(
        {
            ...filters,
            period: getPreviousPeriod(filters.period),
        },
        timezone,
    )
    const queryV2 = workloadTicketsPerChannelQueryV2Factory({
        filters: {
            ...filters,
            period: getPreviousPeriod(filters.period),
        },
        timezone,
    })
    return formatLabel(
        useMetricPerDimensionV2(query, queryV2, undefined, enabled),
    )
}

export const fetchWorkloadPerChannelDistributionForPreviousPeriod = (
    filters: StatsFilters,
    timezone: string,
) => {
    const query = workloadPerChannelDistributionQueryFactory(
        {
            ...filters,
            period: getPreviousPeriod(filters.period),
        },
        timezone,
    )

    const queryV2 = workloadTicketsPerChannelQueryV2Factory({
        filters: {
            ...filters,
            period: getPreviousPeriod(filters.period),
        },
        timezone,
    })

    return fetchMetricPerDimensionV2(query, queryV2).then(formatLabel)
}

const formatLabel = <
    TValue extends ReportingMetricItemValue = ReportingMetricItemValue,
    TCube extends Cubes = Cubes,
>(
    data: MetricWithDecile<TValue, TCube>,
) => {
    return {
        ...data,
        data:
            data.data?.allValues?.map((item) => ({
                value: item.value || 0,
                decile: item.decile || 0,
                label: humanizeChannel(item.dimension as TicketChannel),
            })) ?? [],
    }
}
