import {useFlags} from 'launchdarkly-react-client-sdk'
import {TicketChannel} from 'business/types/ticket'
import {FeatureFlagKey} from 'config/featureFlags'
import {
    renameMemberEnriched,
    useEnrichedCubes,
} from 'hooks/reporting/useEnrichedCubes'
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
    timezone: string
) => {
    const originalQuery = workloadPerChannelDistributionQueryFactory(
        filters,
        timezone
    )
    const isAnalyticsNewCubes: boolean | undefined =
        useFlags()[FeatureFlagKey.AnalyticsNewCubes]
    const query = useEnrichedCubes(originalQuery)
    const dimension = isAnalyticsNewCubes
        ? renameMemberEnriched(CHANNEL_DIMENSION)
        : CHANNEL_DIMENSION
    const measure = isAnalyticsNewCubes
        ? renameMemberEnriched(TICKET_COUNT_MEASURE)
        : TICKET_COUNT_MEASURE

    return usePostReporting<
        {
            [TicketMeasure.TicketCount]: string
            [TicketDimension.Channel]: TicketChannel
        }[],
        OneDimensionalDataItem[],
        HelpdeskMessageCubeWithJoins
    >([query], {
        select: (data) => selectPerChannel(data, dimension, measure),
    })
}

export const useWorkloadPerChannelDistributionForPreviousPeriod = (
    filters: StatsFilters,
    timezone: string
) => {
    const originalQuery = workloadPerChannelDistributionQueryFactory(
        {
            ...filters,
            period: getPreviousPeriod(filters.period),
        },
        timezone
    )
    const isAnalyticsNewCubes: boolean | undefined =
        useFlags()[FeatureFlagKey.AnalyticsNewCubes]
    const query = useEnrichedCubes(originalQuery)
    const dimension = isAnalyticsNewCubes
        ? renameMemberEnriched(CHANNEL_DIMENSION)
        : CHANNEL_DIMENSION
    const measure = isAnalyticsNewCubes
        ? renameMemberEnriched(TICKET_COUNT_MEASURE)
        : TICKET_COUNT_MEASURE
    return usePostReporting<
        {
            [TicketMeasure.TicketCount]: string
            [TicketDimension.Channel]: TicketChannel
        }[],
        OneDimensionalDataItem[],
        HelpdeskMessageCubeWithJoins
    >([query], {
        select: (data) => selectPerChannel(data, dimension, measure),
    })
}

export const selectPerChannel = (
    data: UsePostReportingQueryData<
        {
            [TicketMeasure.TicketCount]: string
            [TicketDimension.Channel]: TicketChannel
        }[]
    >,
    dimension: TicketDimension.Channel,
    measure: TicketMeasure.TicketCount
) => {
    return data.data.data.map((item) => ({
        label: humanizeChannel(item[dimension]),
        value: parseFloat(item[measure]),
    }))
}
