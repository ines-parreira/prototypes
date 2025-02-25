import { useMemo } from 'react'

import { usePostReporting } from 'models/reporting/queries'
import { ReportingGranularity } from 'models/reporting/types'
import { AggregationWindow } from 'models/stat/types'
import { LogicalOperatorEnum } from 'pages/stats/common/components/Filter/constants'
import { getRevenueShareGraphData } from 'pages/stats/convert/clients/CampaignCubeQueries'
import {
    CubeData,
    CubeFilterParams,
    CubeMetric,
} from 'pages/stats/convert/clients/types'
import {
    backFillGraphData,
    getDataFromResult,
    transformToCampaignRevenueOverTime,
} from 'pages/stats/convert/services/CampaignMetricsHelper'
import { RevenueGraphDataPoint } from 'pages/stats/convert/services/types'

const OVERRIDES = {
    select: getDataFromResult,
}

export type GetCampaignRevenue = {
    isFetching: boolean
    isError: boolean
    data?: RevenueGraphDataPoint[]
}

const useGetCampaignRevenueTimeSeries = (
    namespacedShopName: string,
    campaignIds: string[] | null,
    campaignsOperator: LogicalOperatorEnum,
    startDate: string,
    endDate: string,
    timezone: string,
    timeGranularity: AggregationWindow = ReportingGranularity.Day,
): GetCampaignRevenue => {
    const attrs: CubeFilterParams = useMemo(
        () => ({
            shopName: namespacedShopName,
            campaignIds: campaignIds || [],
            campaignsOperator,
            startDate,
            endDate,
            timezone,
            granularity: timeGranularity,
        }),
        [
            namespacedShopName,
            campaignIds,
            startDate,
            endDate,
            timezone,
            campaignsOperator,
            timeGranularity,
        ],
    )

    const revenueChartQuery = useMemo(
        () => getRevenueShareGraphData(attrs),
        [attrs],
    )

    const revenueChart = usePostReporting<[CubeData], CubeData>(
        revenueChartQuery,
        {
            ...OVERRIDES,
            enabled: campaignIds !== null,
        },
    )

    const data = useMemo(() => {
        const data = revenueChart.data || []
        const dataPoints = data.map((dataPoint: CubeMetric) =>
            transformToCampaignRevenueOverTime(dataPoint, timeGranularity),
        )
        const [bfDataPoints] = backFillGraphData(
            [dataPoints],
            startDate,
            endDate,
            timeGranularity,
        )
        // make sure there are no gaps in the data
        return bfDataPoints
    }, [revenueChart.data, timeGranularity, startDate, endDate])

    return {
        isFetching: revenueChart.isFetching,
        isError: revenueChart.isError,
        data: campaignIds === null ? [] : data,
    }
}

export default useGetCampaignRevenueTimeSeries
