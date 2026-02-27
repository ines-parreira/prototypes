import { useMemo } from 'react'

import { usePostReportingV2 } from 'domains/reporting/models/queries'
import { convertCampaignShareGraphQueryFactoryV2 } from 'domains/reporting/models/scopes/convertOrderConversion'
import type { AggregationWindow } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import type { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import {
    getDefaultApiStatsFilters,
    getRevenueShareGraphData,
} from 'domains/reporting/pages/convert/clients/CampaignCubeQueries'
import type {
    CubeFilterParams,
    CubeMetric,
} from 'domains/reporting/pages/convert/clients/types'
import {
    backFillGraphData,
    getDataFromResult,
    transformToCampaignRevenueOverTime,
} from 'domains/reporting/pages/convert/services/CampaignMetricsHelper'
import type { RevenueGraphDataPoint } from 'domains/reporting/pages/convert/services/types'

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

    const revenueChart = usePostReportingV2(
        revenueChartQuery,
        convertCampaignShareGraphQueryFactoryV2({
            filters: getDefaultApiStatsFilters(attrs),
            timezone,
            granularity: timeGranularity,
        }),
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
