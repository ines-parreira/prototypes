import {useMemo} from 'react'

import {usePostReporting} from 'models/reporting/queries'
import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'
import {
    getCampaignEventsOrdersPerformanceData,
    getCampaignEventsPerformanceData,
    getCampaignOrderPerformanceData,
    getStoreRevenueTotalData,
} from 'pages/stats/convert/clients/CampaignCubeQueries'
import {
    CampaignCubeFilterParams,
    CubeData,
    CubeMetric,
    GroupDimension,
} from 'pages/stats/convert/clients/types'
import {
    getDataFromResult,
    getMetricFromCubeData,
    transformToCampaignsPerformanceTable,
} from 'pages/stats/convert/services/CampaignMetricsHelper'
import {CampaignsPerformanceDataset} from 'pages/stats/convert/services/types'

const OVERRIDES = {
    select: getDataFromResult,
}

export type GetTableQuery = {
    isFetching: boolean
    isError: boolean
    data?: CampaignsPerformanceDataset
}

type Props = {
    groupDimension: GroupDimension
    namespacedShopName: string
    campaignIds: string[] | null
    campaignsOperator?: LogicalOperatorEnum
    startDate: string
    endDate: string
    timezone: string
    enabled?: boolean
}

export const useGetTableStat = ({
    groupDimension,
    namespacedShopName,
    campaignIds,
    campaignsOperator,
    startDate,
    endDate,
    timezone,
    enabled,
}: Props): GetTableQuery => {
    const attrs: CampaignCubeFilterParams = useMemo(
        () => ({
            shopName: namespacedShopName,
            campaignIds: campaignIds || [],
            campaignsOperator,
            startDate,
            endDate,
            timezone,
            groupDimension,
        }),
        [
            namespacedShopName,
            campaignIds,
            startDate,
            endDate,
            timezone,
            groupDimension,
            campaignsOperator,
        ]
    )

    const isEnabled =
        (enabled !== undefined ? enabled : true) && campaignIds !== null

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
        {...OVERRIDES, enabled: isEnabled}
    )
    const ordersPerformance = usePostReporting<[CubeData], CubeData>(
        ordersQuery,
        {...OVERRIDES, enabled: isEnabled}
    )
    const eventsOrdersPerformance = usePostReporting<[CubeData], CubeData>(
        eventsOrdersQuery,
        {...OVERRIDES, enabled: isEnabled}
    )
    const storeTotal = usePostReporting<[CubeMetric], CubeMetric>(
        storeTotalQuery,
        {select: getMetricFromCubeData, enabled: isEnabled}
    )

    const data = useMemo(() => {
        return transformToCampaignsPerformanceTable(
            groupDimension,
            eventsPerformance.data,
            ordersPerformance.data,
            eventsOrdersPerformance.data,
            storeTotal.data
        )
    }, [
        groupDimension,
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
