import {useMemo} from 'react'
import {CubeFilterParams, CubeMetric} from 'pages/stats/revenue/clients/types'
import {
    getCampaignEventsTotalsData,
    getCampaignOrderTotalsData,
    getStoreRevenueTotalData,
} from 'pages/stats/revenue/clients/CampaignCubeQueries'
import {
    getMetricFromCubeData,
    transformToCampaignCalculatedTotals,
    transformToCampaignEventsTotals,
    transformToCampaignOrdersTotals,
    transformToStoreTotal,
} from 'pages/stats/revenue/services/CampaignMetricsHelper'
import {CampaignsTotals} from 'pages/stats/revenue/services/types'
import {usePostReporting} from 'models/reporting/queries'

const OVERRIDES = {
    select: getMetricFromCubeData,
}

export type GetTotalsQuery = {
    isFetching: boolean
    isError: boolean
    data?: CampaignsTotals
}

export const useGetTotalsStat = (
    namespacedShopName: string,
    campaignIds: string[],
    allCampaignIds: string[],
    currency: string,
    startDate: string,
    endDate: string,
    timezone: string
): GetTotalsQuery => {
    const attrs: CubeFilterParams = useMemo(
        () => ({
            shopName: namespacedShopName,
            campaignIds,
            startDate,
            endDate,
            timezone,
        }),
        [namespacedShopName, campaignIds, startDate, endDate, timezone]
    )

    const campaignEventsTotalsQuery = useMemo(
        () => getCampaignEventsTotalsData(attrs),
        [attrs]
    )
    const campaignOrderTotalsQuery = useMemo(
        () => getCampaignOrderTotalsData(attrs),
        [attrs]
    )
    const storeTotalQuery = useMemo(
        () => getStoreRevenueTotalData(attrs),
        [attrs]
    )

    const eventsTotals = usePostReporting<[CubeMetric], CubeMetric>(
        campaignEventsTotalsQuery,
        OVERRIDES
    )
    const orderTotals = usePostReporting<[CubeMetric], CubeMetric>(
        campaignOrderTotalsQuery,
        OVERRIDES
    )
    const storeTotal = usePostReporting<[CubeMetric], CubeMetric>(
        storeTotalQuery,
        OVERRIDES
    )

    const data = useMemo(() => {
        return {
            ...transformToCampaignEventsTotals(eventsTotals.data),
            ...transformToCampaignOrdersTotals(orderTotals.data, currency),
            ...transformToStoreTotal(storeTotal.data, currency),
            ...transformToCampaignCalculatedTotals(
                orderTotals.data,
                storeTotal.data
            ),
        }
    }, [eventsTotals.data, orderTotals.data, storeTotal.data, currency])

    return {
        isFetching:
            eventsTotals.isFetching ||
            orderTotals.isFetching ||
            storeTotal.isFetching,
        isError:
            eventsTotals.isError || orderTotals.isError || storeTotal.isError,
        data: data,
    }
}
