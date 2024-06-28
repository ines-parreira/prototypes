import {TicketChannel} from 'business/types/ticket'
import {HelpdeskMessageCubeWithJoins} from 'models/reporting/cubes/HelpdeskMessageCube'
import {TicketDimension, TicketMeasure} from 'models/reporting/cubes/TicketCube'
import {
    usePostReporting,
    UsePostReportingQueryData,
} from 'models/reporting/queries'
import {workloadPerChannelDistributionQueryFactory} from 'models/reporting/queryFactories/support-performance/workloadPerChannel'
import {StatsFilters} from 'models/stat/types'
import {OneDimensionalDataItem} from 'pages/stats/types'
import {humanizeChannel} from 'state/ticket/utils'
import {getPreviousPeriod} from 'utils/reporting'

const CHANNEL_DIMENSION = TicketDimension.Channel
const TICKET_COUNT_MEASURE = TicketMeasure.TicketCount

export const useWorkloadPerChannelDistribution = (
    filters: StatsFilters,
    timezone: string,
    enabled?: boolean
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

export const useWorkloadPerChannelDistributionForPreviousPeriod = (
    filters: StatsFilters,
    timezone: string,
    enabled?: boolean
) => {
    const query = workloadPerChannelDistributionQueryFactory(
        {
            ...filters,
            period: getPreviousPeriod(filters.period),
        },
        timezone
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

export const selectPerChannel = (
    data: UsePostReportingQueryData<
        {
            [TICKET_COUNT_MEASURE]: string
            [CHANNEL_DIMENSION]: TicketChannel
        }[]
    >,
    dimension: typeof CHANNEL_DIMENSION,
    measure: typeof TICKET_COUNT_MEASURE
) => {
    return data.data.data.map((item) => ({
        label: humanizeChannel(item[dimension]),
        value: parseFloat(item[measure]),
    }))
}
