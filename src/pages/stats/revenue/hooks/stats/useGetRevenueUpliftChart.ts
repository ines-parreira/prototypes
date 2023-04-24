import {useMemo} from 'react'
import {
    CubeData,
    CubeFilterParams,
    CubeMetric,
} from 'pages/stats/revenue/clients/types'
import {
    getRevenueUpliftGraphData,
    getStoreRevenueTotalData,
} from 'pages/stats/revenue/clients/CampaignCubeQueries'
import {
    getDataFromResult,
    getMetricFromCubeData,
    transformToRevenueUpliftOverTime,
} from 'pages/stats/revenue/services/CampaignMetricsHelper'
import {RevenueGraphDataPoint} from 'pages/stats/revenue/services/types'
import {usePostReporting} from 'models/reporting/queries'
import {ReportingGranularity} from 'models/reporting/types'
import {REPORTING_STALE_TIME_MS} from 'hooks/reporting/constants'

const OVERRIDES = {
    staleTime: REPORTING_STALE_TIME_MS,
    select: getDataFromResult,
}

export type GetRevenueUpliftChartQuery = {
    isFetching: boolean
    isError: boolean
    data?: RevenueGraphDataPoint[]
}

export const useGetRevenueUpliftChart = (
    namespacedShopName: string,
    campaignIds: string[],
    startDate: string,
    endDate: string,
    timeGranularity = ReportingGranularity.Day
): GetRevenueUpliftChartQuery => {
    const attrs: CubeFilterParams = useMemo(
        () => ({
            shopName: namespacedShopName,
            campaignIds,
            startDate,
            endDate,
            granularity: timeGranularity,
        }),
        [namespacedShopName, campaignIds, startDate, endDate, timeGranularity]
    )

    const revenueUpliftChartQuery = useMemo(
        () => getRevenueUpliftGraphData(attrs),
        [attrs]
    )
    const storeTotalQuery = useMemo(
        () => getStoreRevenueTotalData(attrs),
        [attrs]
    )

    const revenueUpliftChart = usePostReporting<[CubeData], CubeData>(
        revenueUpliftChartQuery,
        {...OVERRIDES, select: getDataFromResult}
    )
    const storeTotal = usePostReporting<[CubeMetric], CubeMetric>(
        storeTotalQuery,
        {...OVERRIDES, select: getMetricFromCubeData}
    )

    const data = useMemo(() => {
        const data = revenueUpliftChart.data || []
        return data.map((dataPoint: CubeMetric) =>
            transformToRevenueUpliftOverTime(
                dataPoint,
                storeTotal.data,
                timeGranularity
            )
        )
    }, [revenueUpliftChart.data, storeTotal.data, timeGranularity])

    return {
        isFetching: revenueUpliftChart.isFetching,
        isError: revenueUpliftChart.isError,
        data: data,
    }
}
