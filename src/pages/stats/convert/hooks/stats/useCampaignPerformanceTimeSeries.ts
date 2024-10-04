import {useMemo} from 'react'
import {ReportingGranularity} from 'models/reporting/types'
import {CubeFilterParams} from 'pages/stats/convert/clients/types'
import {
    campaignImpressionTimeSeriesQueryFactory,
    campaignOrdersTimeSeriesQueryFactory,
} from 'pages/stats/convert/clients/CampaignCubeQueries'
import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'
import {TimeSeriesDataItem, useTimeSeries} from 'hooks/reporting/useTimeSeries'

export type GetCampaignPerformance = {
    isFetching: boolean
    isError: boolean
    data?: {
        impressionsSeries: TimeSeriesDataItem[][]
        ordersCountSeries: TimeSeriesDataItem[][]
    }
}

const useCampaignPerformanceTimeSeries = (
    namespacedShopName: string,
    campaignIds: string[] | null,
    campaignsOperator: LogicalOperatorEnum,
    startDate: string,
    endDate: string,
    timezone: string,
    granularity?: ReportingGranularity
): GetCampaignPerformance => {
    const attrs: CubeFilterParams = useMemo(
        () => ({
            shopName: namespacedShopName,
            campaignIds: campaignIds || [],
            campaignsOperator,
            startDate,
            endDate,
            timezone,
            granularity,
        }),
        [
            namespacedShopName,
            campaignIds,
            startDate,
            endDate,
            timezone,
            campaignsOperator,
            granularity,
        ]
    )

    const campaignImpressionsSeries = useTimeSeries(
        campaignImpressionTimeSeriesQueryFactory(attrs)
    )

    const campaignOrdersSeries = useTimeSeries(
        campaignOrdersTimeSeriesQueryFactory(attrs)
    )

    const data = useMemo(() => {
        return {
            impressionsSeries: campaignImpressionsSeries.data ?? [],
            ordersCountSeries: campaignOrdersSeries.data ?? [],
        }
    }, [campaignImpressionsSeries, campaignOrdersSeries])

    return {
        isFetching:
            campaignImpressionsSeries.isFetching ||
            campaignOrdersSeries.isFetching,
        isError:
            campaignImpressionsSeries.isError || campaignOrdersSeries.isError,
        data: campaignIds === null ? undefined : data,
    }
}

export default useCampaignPerformanceTimeSeries
