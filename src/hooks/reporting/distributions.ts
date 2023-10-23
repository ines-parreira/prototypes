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
import {TICKET_CHANNEL_NAMES} from 'state/ticket/constants'
import {getPreviousPeriod} from 'utils/reporting'

export const useWorkloadPerChannelDistribution = (
    filters: StatsFilters,
    timezone: string
) =>
    usePostReporting<
        {
            [TicketMeasure.TicketCount]: string
            [TicketDimension.Channel]: TicketChannel
        }[],
        OneDimensionalDataItem[],
        HelpdeskMessageCubeWithJoins
    >([workloadPerChannelDistributionQueryFactory(filters, timezone)], {
        select: selectPerChannel,
    })

export const useWorkloadPerChannelDistributionForPreviousPeriod = (
    filters: StatsFilters,
    timezone: string
) =>
    usePostReporting<
        {
            [TicketMeasure.TicketCount]: string
            [TicketDimension.Channel]: TicketChannel
        }[],
        OneDimensionalDataItem[],
        HelpdeskMessageCubeWithJoins
    >(
        [
            workloadPerChannelDistributionQueryFactory(
                {
                    ...filters,
                    period: getPreviousPeriod(filters.period),
                },
                timezone
            ),
        ],
        {
            select: selectPerChannel,
        }
    )

const selectPerChannel = (
    data: UsePostReportingQueryData<
        {
            [TicketMeasure.TicketCount]: string
            [TicketDimension.Channel]: TicketChannel
        }[]
    >
) => {
    return data.data.data.map((item) => ({
        label: TICKET_CHANNEL_NAMES[item[TicketDimension.Channel]],
        value: parseFloat(item[TicketMeasure.TicketCount]),
    }))
}
