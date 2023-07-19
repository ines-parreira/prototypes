import {useMemo} from 'react'
import {
    CubeData,
    CubeFilterParams,
    CubeMetric,
} from 'pages/stats/revenue/clients/types'
import {
    getRevenueGraphData,
    getRevenueShareGraphData,
} from 'pages/stats/revenue/clients/CampaignCubeQueries'
import {
    getDataFromResult,
    transformToRevenueByDate,
    transformToRevenueShareOverTime,
} from 'pages/stats/revenue/services/CampaignMetricsHelper'
import {RevenueGraphDataPoint} from 'pages/stats/revenue/services/types'
import {usePostReporting} from 'models/reporting/queries'
import {ReportingGranularity} from 'models/reporting/types'

const OVERRIDES = {
    select: getDataFromResult,
}

export type GetRevenueShareChartQuery = {
    isFetching: boolean
    isError: boolean
    data?: RevenueGraphDataPoint[]
}

export const useGetRevenueShareChart = (
    namespacedShopName: string,
    campaignIds: string[],
    startDate: string,
    endDate: string,
    timezone: string,
    timeGranularity = ReportingGranularity.Day
): GetRevenueShareChartQuery => {
    const attrs: CubeFilterParams = useMemo(
        () => ({
            shopName: namespacedShopName,
            campaignIds,
            startDate,
            endDate,
            granularity: timeGranularity,
            timezone,
        }),
        [
            namespacedShopName,
            campaignIds,
            startDate,
            endDate,
            timeGranularity,
            timezone,
        ]
    )

    const revenueShareChartQuery = useMemo(
        () => getRevenueShareGraphData(attrs),
        [attrs]
    )
    const revenueQuery = useMemo(() => getRevenueGraphData(attrs), [attrs])

    const revenueShareChart = usePostReporting<[CubeData], CubeData>(
        revenueShareChartQuery,
        OVERRIDES
    )
    const revenue = usePostReporting<[CubeData], CubeData>(
        revenueQuery,
        OVERRIDES
    )

    const data = useMemo(() => {
        const revenueData = transformToRevenueByDate(revenue.data)

        const data = revenueShareChart.data || []
        return data.map((dataPoint: CubeMetric) =>
            transformToRevenueShareOverTime(
                dataPoint,
                revenueData,
                timeGranularity
            )
        )
    }, [revenueShareChart.data, revenue.data, timeGranularity])

    return {
        isFetching: revenueShareChart.isFetching,
        isError: revenueShareChart.isError,
        data: data,
    }
}
