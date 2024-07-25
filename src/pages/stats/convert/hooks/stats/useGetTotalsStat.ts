import {useMemo} from 'react'
import {CubeFilterParams, CubeMetric} from 'pages/stats/convert/clients/types'
import {
    getCampaignEventsTotalsData,
    getCampaignOrderTotalsData,
    getStoreRevenueTotalData,
} from 'pages/stats/convert/clients/CampaignCubeQueries'
import {
    getMetricFromCubeData,
    transformToCampaignCalculatedTotals,
    transformToCampaignEventsTotals,
    transformToCampaignOrdersTotals,
    transformToStoreTotal,
} from 'pages/stats/convert/services/CampaignMetricsHelper'
import {CampaignsTotals} from 'pages/stats/convert/services/types'
import {usePostReporting} from 'models/reporting/queries'
import {CampaignsTotalsMetricNames} from 'pages/stats/convert/services/constants'
import {getDefaultsForMetricKeys} from 'pages/stats/convert/services/utils'

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
    campaignIds: string[] | null,
    currency: string,
    startDate: string,
    endDate: string,
    timezone: string
): GetTotalsQuery => {
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
        {...OVERRIDES, enabled: campaignIds !== null}
    )
    const orderTotals = usePostReporting<[CubeMetric], CubeMetric>(
        campaignOrderTotalsQuery,
        {...OVERRIDES, enabled: campaignIds !== null}
    )
    const storeTotal = usePostReporting<[CubeMetric], CubeMetric>(
        storeTotalQuery,
        {...OVERRIDES, enabled: campaignIds !== null}
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
        data:
            campaignIds === null
                ? getDefaultsForMetricKeys(CampaignsTotalsMetricNames)
                : data,
    }
}
