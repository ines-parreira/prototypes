import { TicketChannel } from 'business/types/ticket'
import { HelpdeskMessageCubeWithJoins } from 'models/reporting/cubes/HelpdeskMessageCube'
import {
    TicketDimension,
    TicketMeasure,
} from 'models/reporting/cubes/TicketCube'
import {
    fetchPostReporting,
    usePostReporting,
    UsePostReportingQueryData,
} from 'models/reporting/queries'
import { workloadPerChannelDistributionQueryFactory } from 'models/reporting/queryFactories/support-performance/workloadPerChannel'
import { StatsFilters } from 'models/stat/types'
import { OneDimensionalDataItem } from 'pages/stats/types'
import { humanizeChannel } from 'state/ticket/utils'
import { getPreviousPeriod } from 'utils/reporting'

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
