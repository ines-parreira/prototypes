import {TicketChannel} from 'business/types/ticket'
import {OrderDirection} from 'models/api/types'
import {HelpdeskMessageCubeWithJoins} from 'models/reporting/cubes/HelpdeskMessageCube'
import {
    TicketMeasure,
    TicketMember,
    TicketSegment,
} from 'models/reporting/cubes/TicketCube'
import {TicketMessagesDimension} from 'models/reporting/cubes/TicketMessagesCube'
import {
    usePostReporting,
    UsePostReportingQueryData,
} from 'models/reporting/queries'
import {ReportingFilterOperator, ReportingQuery} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {OneDimensionalDataItem} from 'pages/stats/types'
import {TICKET_CHANNEL_NAMES} from 'state/ticket/constants'
import {
    getPreviousPeriod,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

const workloadPerChannelDistributionQueryFactory = (
    filters: StatsFilters,
    timezone: string
): ReportingQuery<HelpdeskMessageCubeWithJoins> => ({
    measures: [TicketMeasure.TicketCount],
    order: [[TicketMeasure.TicketCount, OrderDirection.Desc]],
    dimensions: [TicketMessagesDimension.FirstMessageChannel],
    segments: [TicketSegment.WorkloadTickets],
    filters: [
        {
            member: TicketMember.IsSpam,
            operator: ReportingFilterOperator.Equals,
            values: ['0'],
        },
        {
            member: TicketMember.IsTrashed,
            operator: ReportingFilterOperator.Equals,
            values: ['0'],
        },
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
            [TicketMessagesDimension.FirstMessageChannel]: TicketChannel
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
            [TicketMessagesDimension.FirstMessageChannel]: TicketChannel
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
            [TicketMessagesDimension.FirstMessageChannel]: TicketChannel
        }[]
    >
) => {
    return data.data.data.map((item) => ({
        label: TICKET_CHANNEL_NAMES[
            item[TicketMessagesDimension.FirstMessageChannel]
        ],
        value: parseFloat(item[TicketMeasure.TicketCount]),
    }))
}
