import {useMemo} from 'react'
import {
    CubeData,
    CubeFilterParams,
    CubeMetric,
} from 'pages/stats/revenue/clients/types'
import {
    getRevenueGraphData,
    getRevenueUpliftGraphData,
} from 'pages/stats/revenue/clients/CampaignCubeQueries'
import {
    getDataFromResult,
    transformToRevenueByDate,
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
    timezone: string,
    timeGranularity = ReportingGranularity.Day
): GetRevenueUpliftChartQuery => {
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

    const revenueUpliftChartQuery = useMemo(
        () => getRevenueUpliftGraphData(attrs),
        [attrs]
    )
    const revenueQuery = useMemo(() => getRevenueGraphData(attrs), [attrs])

    const revenueUpliftChart = usePostReporting<[CubeData], CubeData>(
        revenueUpliftChartQuery,
        OVERRIDES
    )
    const revenue = usePostReporting<[CubeData], CubeData>(
        revenueQuery,
        OVERRIDES
    )

    const data = useMemo(() => {
        const revenueData = transformToRevenueByDate(revenue.data)

        const data = revenueUpliftChart.data || []
        return data.map((dataPoint: CubeMetric) =>
            transformToRevenueUpliftOverTime(
                dataPoint,
                revenueData,
                timeGranularity
            )
        )
    }, [revenueUpliftChart.data, revenue.data, timeGranularity])

    return {
        isFetching: revenueUpliftChart.isFetching,
        isError: revenueUpliftChart.isError,
        data: data,
    }
}
