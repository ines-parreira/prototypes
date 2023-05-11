import {useMemo} from 'react'
import {CubeFilterParams, CubeMetric} from 'pages/stats/revenue/clients/types'
import {
    getCampaignEventsTotalsData,
    getCampaignOrderTotalsData,
    getStoreRevenueTotalData,
} from 'pages/stats/revenue/clients/CampaignCubeQueries'
import {
    getMetricFromCubeData,
    reduceTicketPerformanceData,
    transformToCampaignCalculatedTotals,
    transformToCampaignEventsTotals,
    transformToCampaignOrdersTotals,
    transformToStoreTotal,
} from 'pages/stats/revenue/services/CampaignMetricsHelper'
import {CampaignsTotals} from 'pages/stats/revenue/services/types'
import {usePostReporting} from 'models/reporting/queries'
import {REPORTING_STALE_TIME_MS} from 'hooks/reporting/constants'
import {useTicketsPerformanceStat} from 'pages/stats/revenue/hooks/stats/useGetTicketsPerformanceStat'

const OVERRIDES = {
    staleTime: REPORTING_STALE_TIME_MS,
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
    const campaignsForTicketQuery = useMemo(() => {
        if (campaignIds.length) {
            return campaignIds
        }
        return allCampaignIds
    }, [campaignIds, allCampaignIds])

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
    const {
        isFetching,
        isError,
        data: ticketsPerformance,
    } = useTicketsPerformanceStat(campaignsForTicketQuery, startDate, endDate)

    const data = useMemo(() => {
        const totalCampaignTickets =
            reduceTicketPerformanceData(ticketsPerformance)

        return {
            ...transformToCampaignEventsTotals(
                eventsTotals.data,
                totalCampaignTickets
            ),
            ...transformToCampaignOrdersTotals(orderTotals.data, currency),
            ...transformToStoreTotal(storeTotal.data, currency),
            ...transformToCampaignCalculatedTotals(
                orderTotals.data,
                storeTotal.data
            ),
        }
    }, [
        eventsTotals.data,
        orderTotals.data,
        storeTotal.data,
        ticketsPerformance,
        currency,
    ])

    return {
        isFetching:
            isFetching ||
            eventsTotals.isFetching ||
            orderTotals.isFetching ||
            storeTotal.isFetching,
        isError:
            isError ||
            eventsTotals.isError ||
            orderTotals.isError ||
            storeTotal.isError,
        data: data,
    }
}
