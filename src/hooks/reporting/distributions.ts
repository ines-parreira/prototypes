import {TicketChannel} from 'business/types/ticket'
import {OrderDirection} from 'models/api/types'
import {HelpdeskMessageCubeWithJoins} from 'models/reporting/cubes/HelpdeskMessageCube'
import {
    TicketDimension,
    TicketMeasure,
    TicketSegment,
} from 'models/reporting/cubes/TicketCube'
import {
    usePostReporting,
    UsePostReportingQueryData,
} from 'models/reporting/queries'
import {ReportingQuery} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {OneDimensionalDataItem} from 'pages/stats/types'
import {TICKET_CHANNEL_NAMES} from 'state/ticket/constants'
import {
    getPreviousPeriod,
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

const workloadPerChannelDistributionQueryFactory = (
    filters: StatsFilters,
    timezone: string
): ReportingQuery<HelpdeskMessageCubeWithJoins> => ({
    measures: [TicketMeasure.TicketCount],
    order: [[TicketMeasure.TicketCount, OrderDirection.Desc]],
    dimensions: [TicketDimension.Channel],
    segments: [TicketSegment.WorkloadTickets],
    filters: [
        ...NotSpamNorTrashedTicketsFilter,
        ...statsFiltersToReportingFilters(TicketStatsFiltersMembers, filters),
    ],
    timezone,
})

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
