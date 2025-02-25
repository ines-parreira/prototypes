import { useMemo } from 'react'

import { usePostReporting } from 'models/reporting/queries'
import { ReportingGranularity } from 'models/reporting/types'
import { LogicalOperatorEnum } from 'pages/stats/common/components/Filter/constants'
import {
    getRevenueGraphData,
    getRevenueShareGraphData,
} from 'pages/stats/convert/clients/CampaignCubeQueries'
import {
    CubeData,
    CubeFilterParams,
    CubeMetric,
} from 'pages/stats/convert/clients/types'
import {
    getDataFromResult,
    transformToRevenueByDate,
    transformToRevenueShareOverTime,
} from 'pages/stats/convert/services/CampaignMetricsHelper'
import { RevenueGraphDataPoint } from 'pages/stats/convert/services/types'

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
    campaignIds: string[] | null,
    campaignsOperator: LogicalOperatorEnum,
    startDate: string,
    endDate: string,
    timezone: string,
    timeGranularity = ReportingGranularity.Day,
): GetRevenueShareChartQuery => {
    const attrs: CubeFilterParams = useMemo(
        () => ({
            shopName: namespacedShopName,
            campaignIds: campaignIds || [],
            campaignsOperator,
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
            campaignsOperator,
        ],
    )

    const revenueShareChartQuery = useMemo(
        () => getRevenueShareGraphData(attrs),
        [attrs],
    )
    const revenueQuery = useMemo(() => getRevenueGraphData(attrs), [attrs])

    const revenueShareChart = usePostReporting<[CubeData], CubeData>(
        revenueShareChartQuery,
        { ...OVERRIDES, enabled: campaignIds !== null },
    )
    const revenue = usePostReporting<[CubeData], CubeData>(revenueQuery, {
        ...OVERRIDES,
        enabled: campaignIds !== null,
    })

    const data = useMemo(() => {
        const revenueData = transformToRevenueByDate(revenue.data)

        const data = revenueShareChart.data || []
        return data.map((dataPoint: CubeMetric) =>
            transformToRevenueShareOverTime(
                dataPoint,
                revenueData,
                timeGranularity,
            ),
        )
    }, [revenueShareChart.data, revenue.data, timeGranularity])

    return {
        isFetching: revenueShareChart.isFetching,
        isError: revenueShareChart.isError,
        data: campaignIds === null ? [] : data,
    }
}
