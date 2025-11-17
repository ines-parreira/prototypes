import { useMemo } from 'react'

import { TicketChannel } from 'business/types/ticket'
import { usePostReporting } from 'domains/reporting/models/queries'
import { ReportingGranularity } from 'domains/reporting/models/types'
import type { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { getCampaignsPerformanceGraphData } from 'domains/reporting/pages/convert/clients/CampaignCubeQueries'
import type {
    CubeData,
    CubeFilterParams,
    CubeMetric,
} from 'domains/reporting/pages/convert/clients/types'
import { useTicketsPerformanceChart } from 'domains/reporting/pages/convert/hooks/stats/useGetTicketsPerformanceChart'
import {
    backFillGraphData,
    getDataFromResult,
    transformToCampaignConversionRateOverTime,
    transformToCampaignCTROverTime,
    transformToChatConversionRateOverTime,
} from 'domains/reporting/pages/convert/services/CampaignMetricsHelper'
import type { CampaignChatPerformanceData } from 'domains/reporting/pages/convert/services/types'

export type GetCampaignsAndChatChartQuery = {
    isFetching: boolean
    isError: boolean
    data?: CampaignChatPerformanceData
}

export const useGetCampaignsAndChatChart = (
    namespacedShopName: string,
    campaignIds: string[],
    campaignsOperator: LogicalOperatorEnum,
    startDate: string,
    endDate: string,
    integrationId: number | null,
    timezone: string,
    timeGranularity = ReportingGranularity.Day,
): GetCampaignsAndChatChartQuery => {
    const attrs: CubeFilterParams = useMemo(
        () => ({
            shopName: namespacedShopName,
            campaignIds,
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

    const campaignsPerformanceQuery = useMemo(
        () => getCampaignsPerformanceGraphData(attrs),
        [attrs],
    )

    const campaignsPerformance = usePostReporting<[CubeData], CubeData>(
        campaignsPerformanceQuery,
        {
            select: getDataFromResult,
        },
    )
    const integrationIds = useMemo(
        () => (!!integrationId ? [integrationId] : []),
        [integrationId],
    )
    const channels = useMemo(() => [TicketChannel.Chat], [])
    const {
        isFetching,
        isError,
        data: chatPerformance,
    } = useTicketsPerformanceChart(
        campaignIds,
        startDate,
        endDate,
        integrationIds,
        campaignsOperator,
        channels,
    )

    const data = useMemo(() => {
        // transform individual metrics to the same data format
        const campaignsPerformanceData = campaignsPerformance.data || []
        const campaignsCTR = campaignsPerformanceData.map(
            (dataPoint: CubeMetric) =>
                transformToCampaignCTROverTime(dataPoint, timeGranularity),
        )
        const campaignConversionRate = campaignsPerformanceData.map(
            (dataPoint: CubeMetric) =>
                transformToCampaignConversionRateOverTime(
                    dataPoint,
                    timeGranularity,
                ),
        )
        const chatConversionRate =
            transformToChatConversionRateOverTime(chatPerformance)

        // make sure there are no gaps in the data to cause lines misalignment
        const [bfCampaignCTR, bfCampaignConversionRate, bfChatConversionRate] =
            backFillGraphData(
                [campaignsCTR, campaignConversionRate, chatConversionRate],
                startDate,
                endDate,
            )

        return {
            campaignCTR: bfCampaignCTR,
            campaignConversionRate: bfCampaignConversionRate,
            chatConversionRate: bfChatConversionRate,
        }
    }, [
        campaignsPerformance.data,
        chatPerformance,
        startDate,
        endDate,
        timeGranularity,
    ])

    return {
        isFetching: isFetching || campaignsPerformance.isFetching,
        isError: isError || campaignsPerformance.isError,
        data: data,
    }
}
