import { useMemo } from 'react'

import { usePostReportingV2 } from 'domains/reporting/models/queries'
import {
    convertCampaignShareGraphQueryFactoryV2,
    convertRevenueGraphQueryFactoryV2,
} from 'domains/reporting/models/scopes/convertOrderConversion'
import { ReportingGranularity } from 'domains/reporting/models/types'
import type { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import {
    getDefaultApiStatsFilters,
    getRevenueGraphData,
    getRevenueShareGraphData,
} from 'domains/reporting/pages/convert/clients/CampaignCubeQueries'
import type {
    CubeFilterParams,
    CubeMetric,
} from 'domains/reporting/pages/convert/clients/types'
import {
    getDataFromResult,
    transformToRevenueByDate,
    transformToRevenueShareOverTime,
} from 'domains/reporting/pages/convert/services/CampaignMetricsHelper'
import type { RevenueGraphDataPoint } from 'domains/reporting/pages/convert/services/types'

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

    const revenueShareChart = usePostReportingV2(
        revenueShareChartQuery,
        convertCampaignShareGraphQueryFactoryV2({
            filters: getDefaultApiStatsFilters(attrs),
            timezone,
            granularity: timeGranularity,
        }),
        { ...OVERRIDES, enabled: campaignIds !== null },
    )
    const revenue = usePostReportingV2(
        revenueQuery,
        convertRevenueGraphQueryFactoryV2({
            filters: getDefaultApiStatsFilters({
                startDate: attrs.startDate,
                endDate: attrs.endDate,
                shopName: attrs.shopName,
                allowNoCampaign: true,
            }),
            timezone,
            granularity: timeGranularity,
        }),
        {
            ...OVERRIDES,
            enabled: campaignIds !== null,
        },
    )

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
