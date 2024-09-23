import {useMemo} from 'react'
import {
    CubeData,
    CubeFilterParams,
    CubeMetric,
} from 'pages/stats/convert/clients/types'
import {getRevenueShareGraphData} from 'pages/stats/convert/clients/CampaignCubeQueries'
import {
    backfillGraphData,
    getDataFromResult,
    transformToCampaignRevenueOverTime,
} from 'pages/stats/convert/services/CampaignMetricsHelper'
import {RevenueGraphDataPoint} from 'pages/stats/convert/services/types'
import {usePostReporting} from 'models/reporting/queries'
import {ReportingGranularity} from 'models/reporting/types'
import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'

const OVERRIDES = {
    select: getDataFromResult,
}

export type GetCampaignRevenue = {
    isFetching: boolean
    isError: boolean
    data?: RevenueGraphDataPoint[]
}

const useGetCampaignRevenue = (
    namespacedShopName: string,
    campaignIds: string[] | null,
    campaignsOperator: LogicalOperatorEnum,
    startDate: string,
    endDate: string,
    timezone: string,
    timeGranularity = ReportingGranularity.Day
): GetCampaignRevenue => {
    const attrs: CubeFilterParams = useMemo(
        () => ({
            shopName: namespacedShopName,
            campaignIds: campaignIds || [],
            campaignsOperator,
            startDate,
            endDate,
            timezone,
        }),
        [
            namespacedShopName,
            campaignIds,
            startDate,
            endDate,
            timezone,
            campaignsOperator,
        ]
    )

    const revenueChartQuery = useMemo(
        () => getRevenueShareGraphData(attrs),
        [attrs]
    )

    const revenueChart = usePostReporting<[CubeData], CubeData>(
        revenueChartQuery,
        {
            ...OVERRIDES,
            enabled: campaignIds !== null,
        }
    )

    const data = useMemo(() => {
        const data = revenueChart.data || []
        const dataPoints = data.map((dataPoint: CubeMetric) =>
            transformToCampaignRevenueOverTime(dataPoint, timeGranularity)
        )
        const [bfDataPoints] = backfillGraphData(
            [dataPoints],
            startDate,
            endDate
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

export default useGetCampaignRevenue
