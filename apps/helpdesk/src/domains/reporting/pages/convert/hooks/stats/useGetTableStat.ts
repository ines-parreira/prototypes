import { useMemo } from 'react'

import {
    fetchPostReporting,
    fetchPostReportingV2,
    usePostReporting,
    usePostReportingV2,
} from 'domains/reporting/models/queries'
import { convertCampaignEventsPerformanceQueryFactoryV2 } from 'domains/reporting/models/scopes/convertCampaignEvents'
import { convertCampaignEventsOrdersPerformanceQueryFactoryV2 } from 'domains/reporting/models/scopes/convertCampaignOrderEvents'
import type { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import {
    getCampaignEventsOrdersPerformanceData,
    getCampaignEventsPerformanceData,
    getCampaignOrderPerformanceData,
    getDefaultApiStatsFilters,
    getStoreRevenueTotalData,
} from 'domains/reporting/pages/convert/clients/CampaignCubeQueries'
import type {
    CampaignCubeFilterParams,
    CubeData,
    CubeMetric,
    GroupDimension,
} from 'domains/reporting/pages/convert/clients/types'
import {
    getDataFromResult,
    getMetricFromCubeData,
    transformToCampaignsPerformanceTable,
} from 'domains/reporting/pages/convert/services/CampaignMetricsHelper'
import type { CampaignsPerformanceDataset } from 'domains/reporting/pages/convert/services/types'

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
        ],
    )

    const isEnabled =
        (enabled !== undefined ? enabled : true) && campaignIds !== null

    const eventsQuery = useMemo(
        () => getCampaignEventsPerformanceData(attrs),
        [attrs],
    )
    const ordersQuery = useMemo(
        () => getCampaignOrderPerformanceData(attrs),
        [attrs],
    )
    const eventsOrdersQuery = useMemo(
        () => getCampaignEventsOrdersPerformanceData(attrs),
        [attrs],
    )
    const storeTotalQuery = useMemo(
        () => getStoreRevenueTotalData(attrs),
        [attrs],
    )

    const eventsPerformance = usePostReportingV2(
        eventsQuery,
        convertCampaignEventsPerformanceQueryFactoryV2(
            {
                filters: getDefaultApiStatsFilters(attrs),
                timezone,
            },
            attrs.groupDimension,
        ),
        {
            ...OVERRIDES,
            enabled: isEnabled,
        },
    )
    const ordersPerformance = usePostReporting<[CubeData], CubeData>(
        ordersQuery,
        { ...OVERRIDES, enabled: isEnabled },
    )
    const eventsOrdersPerformance = usePostReportingV2(
        eventsOrdersQuery,
        convertCampaignEventsOrdersPerformanceQueryFactoryV2(
            {
                filters: getDefaultApiStatsFilters({
                    startDate: attrs.startDate,
                    endDate: attrs.endDate,
                    campaignIds: attrs.campaignIds,
                    campaignsOperator: attrs.campaignsOperator,
                }),
                timezone,
            },
            attrs.groupDimension,
        ),
        { ...OVERRIDES, enabled: isEnabled },
    )
    const storeTotal = usePostReporting<[CubeMetric], CubeMetric>(
        storeTotalQuery,
        { select: getMetricFromCubeData, enabled: isEnabled },
    )

    const data = useMemo(() => {
        return transformToCampaignsPerformanceTable(
            groupDimension,
            eventsPerformance.data,
            ordersPerformance.data,
            eventsOrdersPerformance.data,
            storeTotal.data,
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

export const fetchGetTableStat = async ({
    groupDimension,
    namespacedShopName,
    campaignIds,
    campaignsOperator,
    startDate,
    endDate,
    timezone,
}: Props): Promise<GetTableQuery> => {
    const attrs: CampaignCubeFilterParams = {
        shopName: namespacedShopName,
        campaignIds: campaignIds || [],
        campaignsOperator,
        startDate,
        endDate,
        timezone,
        groupDimension,
    }

    const isEnabled = campaignIds !== null

    if (!isEnabled) {
        return Promise.resolve({
            isFetching: false,
            isError: false,
            data: transformToCampaignsPerformanceTable(
                groupDimension,
                undefined,
                undefined,
                undefined,
                getMetricFromCubeData(undefined),
            ),
        })
    }

    const eventsQuery = getCampaignEventsPerformanceData(attrs)

    const ordersQuery = getCampaignOrderPerformanceData(attrs)

    const eventsOrdersQuery = getCampaignEventsOrdersPerformanceData(attrs)
    const storeTotalQuery = getStoreRevenueTotalData(attrs)

    const eventsPerformance = fetchPostReportingV2(
        eventsQuery,
        convertCampaignEventsPerformanceQueryFactoryV2(
            {
                filters: getDefaultApiStatsFilters({
                    startDate,
                    endDate,
                    campaignIds,
                    campaignsOperator,
                }),
                timezone,
            },
            attrs.groupDimension,
        ),
        { ...OVERRIDES, enabled: isEnabled },
    )
    const ordersPerformance = fetchPostReporting<CubeData, CubeData>(
        ordersQuery,
        { ...OVERRIDES, enabled: isEnabled },
    )
    const eventsOrdersPerformance = fetchPostReportingV2(
        eventsOrdersQuery,
        convertCampaignEventsOrdersPerformanceQueryFactoryV2(
            {
                filters: getDefaultApiStatsFilters({
                    startDate,
                    endDate,
                    campaignIds,
                    campaignsOperator,
                }),
                timezone,
            },
            attrs.groupDimension,
        ),
        { ...OVERRIDES, enabled: isEnabled },
    )
    const storeTotal = fetchPostReporting<[CubeMetric], CubeMetric>(
        storeTotalQuery,
        {
            select: getMetricFromCubeData,
            enabled: isEnabled,
        },
    )

    return Promise.all([
        eventsPerformance,
        ordersPerformance,
        eventsOrdersPerformance,
        storeTotal,
    ])
        .then(
            ([
                eventsPerformance,
                ordersPerformance,
                eventsOrdersPerformance,
                storeTotal,
            ]) => {
                const data = transformToCampaignsPerformanceTable(
                    groupDimension,
                    getDataFromResult(eventsPerformance),
                    getDataFromResult(ordersPerformance),
                    getDataFromResult(eventsOrdersPerformance),
                    getMetricFromCubeData(getDataFromResult(storeTotal)),
                )

                return {
                    isFetching: false,
                    isError: false,
                    data: data,
                }
            },
        )
        .catch(() => ({
            isFetching: false,
            isError: true,
            data: undefined,
        }))
}
