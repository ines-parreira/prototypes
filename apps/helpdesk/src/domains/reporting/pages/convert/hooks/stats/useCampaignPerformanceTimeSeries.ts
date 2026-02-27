import { useMemo } from 'react'

import type { TimeSeriesDataItem } from 'domains/reporting/hooks/useTimeSeries'
import { useTimeSeries } from 'domains/reporting/hooks/useTimeSeries'
import { convertCampaignImpressionTimeSeriesQueryFactoryV2 } from 'domains/reporting/models/scopes/convertCampaignOrderEvents'
import { convertCampaignOrdersTimeSeriesQueryFactoryV2 } from 'domains/reporting/models/scopes/convertOrderConversion'
import type { ReportingGranularity } from 'domains/reporting/models/types'
import type { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import {
    campaignImpressionTimeSeriesQueryFactory,
    campaignOrdersTimeSeriesQueryFactory,
    getDefaultApiStatsFilters,
} from 'domains/reporting/pages/convert/clients/CampaignCubeQueries'
import type { CubeFilterParams } from 'domains/reporting/pages/convert/clients/types'

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
    granularity?: ReportingGranularity,
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
        ],
    )

    const campaignImpressionsSeries = useTimeSeries(
        campaignImpressionTimeSeriesQueryFactory(attrs),
        convertCampaignImpressionTimeSeriesQueryFactoryV2({
            filters: getDefaultApiStatsFilters(attrs),
            timezone,
            granularity,
        }),
    )

    const campaignOrdersSeries = useTimeSeries(
        campaignOrdersTimeSeriesQueryFactory(attrs),
        convertCampaignOrdersTimeSeriesQueryFactoryV2({
            filters: getDefaultApiStatsFilters(attrs),
            timezone,
            granularity,
        }),
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
