import {useMemo} from 'react'
import {CubeData, CubeFilterParams} from 'pages/stats/revenue/clients/types'
import {
    getCampaignEventsOrdersPerformanceData,
    getCampaignEventsPerformanceData,
    getCampaignOrderPerformanceData,
    getTrafficData,
} from 'pages/stats/revenue/clients/CampaignCubeQueries'
import {
    getDataFromResult,
    transformToCampaignsPerformanceTable,
} from 'pages/stats/revenue/services/CampaignMetricsHelper'
import {CampaignsPerformanceDataset} from 'pages/stats/revenue/services/types'
import {usePostReporting} from 'models/reporting/queries'
import {useTicketsPerformanceStat} from 'pages/stats/revenue/hooks/stats/useGetTicketsPerformanceStat'
import {REPORTING_STALE_TIME_MS} from 'hooks/reporting/constants'

const OVERRIDES = {
    staleTime: REPORTING_STALE_TIME_MS,
    select: getDataFromResult,
}

export type GetTableQuery = {
    isFetching: boolean
    isError: boolean
    data?: CampaignsPerformanceDataset
}

export const useGetTableStat = (
    namespacedShopName: string,
    campaignIds: string[],
    startDate: string,
    endDate: string
): GetTableQuery => {
    const attrs: CubeFilterParams = useMemo(
        () => ({
            shopName: namespacedShopName,
            campaignIds,
            startDate,
            endDate,
        }),
        [namespacedShopName, campaignIds, startDate, endDate]
    )

    const eventsQuery = useMemo(
        () => getCampaignEventsPerformanceData(attrs),
        [attrs]
    )
    const ordersQuery = useMemo(
        () => getCampaignOrderPerformanceData(attrs),
        [attrs]
    )
    const eventsOrdersQuery = useMemo(
        () => getCampaignEventsOrdersPerformanceData(attrs),
        [attrs]
    )
    const trafficDataQuery = useMemo(() => getTrafficData(attrs), [attrs])

    const eventsPerformance = usePostReporting<[CubeData], CubeData>(
        eventsQuery,
        OVERRIDES
    )
    const ordersPerformance = usePostReporting<[CubeData], CubeData>(
        ordersQuery,
        OVERRIDES
    )
    const eventsOrdersPerformance = usePostReporting<[CubeData], CubeData>(
        eventsOrdersQuery,
        OVERRIDES
    )
    const trafficData = usePostReporting<[CubeData], CubeData>(
        trafficDataQuery,
        OVERRIDES
    )
    const {
        isFetching,
        isError,
        data: ticketsPerformance,
    } = useTicketsPerformanceStat(campaignIds, startDate, endDate)

    const data = useMemo(() => {
        return transformToCampaignsPerformanceTable(
            eventsPerformance.data,
            ordersPerformance.data,
            eventsOrdersPerformance.data,
            trafficData.data,
            ticketsPerformance
        )
    }, [
        eventsPerformance.data,
        ordersPerformance.data,
        eventsOrdersPerformance.data,
        trafficData.data,
        ticketsPerformance,
    ])

    return {
        isFetching:
            isFetching ||
            eventsPerformance.isFetching ||
            ordersPerformance.isFetching ||
            eventsOrdersPerformance.isFetching ||
            trafficData.isFetching,
        isError:
            isError ||
            eventsPerformance.isError ||
            ordersPerformance.isError ||
            eventsOrdersPerformance.isError ||
            trafficData.isError,
        data: data,
    }
}
