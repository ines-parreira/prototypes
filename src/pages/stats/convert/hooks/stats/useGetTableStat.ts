import {useMemo} from 'react'
import {
    CubeData,
    CubeFilterParams,
    CubeMetric,
} from 'pages/stats/convert/clients/types'
import {
    getCampaignEventsOrdersPerformanceData,
    getCampaignEventsPerformanceData,
    getCampaignOrderPerformanceData,
    getStoreRevenueTotalData,
} from 'pages/stats/convert/clients/CampaignCubeQueries'
import {
    getDataFromResult,
    getMetricFromCubeData,
    transformToCampaignsPerformanceTable,
} from 'pages/stats/convert/services/CampaignMetricsHelper'
import {CampaignsPerformanceDataset} from 'pages/stats/convert/services/types'
import {usePostReporting} from 'models/reporting/queries'

const OVERRIDES = {
    select: getDataFromResult,
}

export type GetTableQuery = {
    isFetching: boolean
    isError: boolean
    data?: CampaignsPerformanceDataset
}

export const useGetTableStat = (
    namespacedShopName: string,
    campaignIds: string[] | null,
    startDate: string,
    endDate: string,
    timezone: string
): GetTableQuery => {
    const attrs: CubeFilterParams = useMemo(
        () => ({
            shopName: namespacedShopName,
            campaignIds: campaignIds || [],
            startDate,
            endDate,
            timezone,
        }),
        [namespacedShopName, campaignIds, startDate, endDate, timezone]
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
    const storeTotalQuery = useMemo(
        () => getStoreRevenueTotalData(attrs),
        [attrs]
    )

    const eventsPerformance = usePostReporting<[CubeData], CubeData>(
        eventsQuery,
        {...OVERRIDES, enabled: campaignIds !== null}
    )
    const ordersPerformance = usePostReporting<[CubeData], CubeData>(
        ordersQuery,
        {...OVERRIDES, enabled: campaignIds !== null}
    )
    const eventsOrdersPerformance = usePostReporting<[CubeData], CubeData>(
        eventsOrdersQuery,
        {...OVERRIDES, enabled: campaignIds !== null}
    )
    const storeTotal = usePostReporting<[CubeMetric], CubeMetric>(
        storeTotalQuery,
        {select: getMetricFromCubeData, enabled: campaignIds !== null}
    )

    const data = useMemo(() => {
        return transformToCampaignsPerformanceTable(
            eventsPerformance.data,
            ordersPerformance.data,
            eventsOrdersPerformance.data,
            storeTotal.data
        )
    }, [
        eventsPerformance.data,
        ordersPerformance.data,
        eventsOrdersPerformance.data,
        storeTotal.data,
    ])

    return {
        isFetching:
            eventsPerformance.isFetching ||
            ordersPerformance.isFetching ||
            eventsOrdersPerformance.isFetching ||
            storeTotal.isFetching,
        isError:
            eventsPerformance.isError ||
            ordersPerformance.isError ||
            eventsOrdersPerformance.isError ||
            storeTotal.isError,
        data: data,
    }
}
