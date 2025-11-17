import type { TicketChannel } from 'business/types/ticket'
import type { HelpdeskMessageCubeWithJoins } from 'domains/reporting/models/cubes/HelpdeskMessageCube'
import {
    TicketDimension,
    TicketMeasure,
} from 'domains/reporting/models/cubes/TicketCube'
import type { UsePostReportingQueryData } from 'domains/reporting/models/queries'
import {
    fetchPostReporting,
    usePostReporting,
} from 'domains/reporting/models/queries'
import { workloadPerChannelDistributionQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/workloadPerChannel'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { OneDimensionalDataItem } from 'domains/reporting/pages/types'
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

    return usePostReporting<
        {
            [TICKET_COUNT_MEASURE]: string
            [CHANNEL_DIMENSION]: TicketChannel
        }[],
        OneDimensionalDataItem[],
        HelpdeskMessageCubeWithJoins
    >([query], {
        select: (data) =>
            selectPerChannel(data, CHANNEL_DIMENSION, TICKET_COUNT_MEASURE),
        enabled,
    })
}

export const fetchWorkloadPerChannelDistribution = (
    filters: StatsFilters,
    timezone: string,
) => {
    const query = workloadPerChannelDistributionQueryFactory(filters, timezone)

    return fetchPostReporting<
        {
            [TICKET_COUNT_MEASURE]: string
            [CHANNEL_DIMENSION]: TicketChannel
        }[],
        OneDimensionalDataItem[],
        HelpdeskMessageCubeWithJoins
    >([query]).then((res) => {
        return {
            data: selectPerChannel(
                res,
                CHANNEL_DIMENSION,
                TICKET_COUNT_MEASURE,
            ),
        }
    })
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
    return usePostReporting<
        {
            [TICKET_COUNT_MEASURE]: string
            [CHANNEL_DIMENSION]: TicketChannel
        }[],
        OneDimensionalDataItem[],
        HelpdeskMessageCubeWithJoins
    >([query], {
        select: (data) =>
            selectPerChannel(data, CHANNEL_DIMENSION, TICKET_COUNT_MEASURE),
        enabled,
    })
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

    return fetchPostReporting<
        {
            [TICKET_COUNT_MEASURE]: string
            [CHANNEL_DIMENSION]: TicketChannel
        }[],
        OneDimensionalDataItem[],
        HelpdeskMessageCubeWithJoins
    >([query]).then((res) => {
        return {
            data: selectPerChannel(
                res,
                CHANNEL_DIMENSION,
                TICKET_COUNT_MEASURE,
            ),
        }
    })
}

export const selectPerChannel = (
    data: UsePostReportingQueryData<
        {
            [TICKET_COUNT_MEASURE]: string
            [CHANNEL_DIMENSION]: TicketChannel
        }[]
    >,
    dimension: typeof CHANNEL_DIMENSION,
    measure: typeof TICKET_COUNT_MEASURE,
) => {
    return data.data.data.map((item) => ({
        label: humanizeChannel(item[dimension]),
        value: parseFloat(item[measure]),
    }))
}
