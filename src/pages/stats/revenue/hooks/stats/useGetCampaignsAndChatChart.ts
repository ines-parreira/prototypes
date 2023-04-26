import {useMemo} from 'react'
import {
    CubeData,
    CubeFilterParams,
    CubeMetric,
} from 'pages/stats/revenue/clients/types'
import {getCampaignsPerformanceGraphData} from 'pages/stats/revenue/clients/CampaignCubeQueries'
import {
    backfillGraphData,
    getDataFromResult,
    transformToCampaignConversionRateOverTime,
    transformToCampaignCTROverTime,
    transformToChatConversionRateOverTime,
} from 'pages/stats/revenue/services/CampaignMetricsHelper'
import {CampaignChatPerformanceData} from 'pages/stats/revenue/services/types'
import {usePostReporting} from 'models/reporting/queries'
import {ReportingGranularity} from 'models/reporting/types'
import {REPORTING_STALE_TIME_MS} from 'hooks/reporting/constants'
import {TicketChannel} from 'business/types/ticket'
import {useTicketsPerformanceChart} from 'pages/stats/revenue/hooks/stats/useGetTicketsPerformanceChart'

const OVERRIDES = {
    staleTime: REPORTING_STALE_TIME_MS,
    select: getDataFromResult,
}

export type GetRevenueUpliftChartQuery = {
    isFetching: boolean
    isError: boolean
    data?: CampaignChatPerformanceData
}

export const useGetCampaignsAndChatChart = (
    namespacedShopName: string,
    campaignIds: string[],
    startDate: string,
    endDate: string,
    integrationId: number | null,
    timeGranularity = ReportingGranularity.Day
): GetRevenueUpliftChartQuery => {
    const attrs: CubeFilterParams = useMemo(
        () => ({
            shopName: namespacedShopName,
            campaignIds,
            startDate,
            endDate,
            granularity: timeGranularity,
        }),
        [namespacedShopName, campaignIds, startDate, endDate, timeGranularity]
    )

    const campaignsPerformanceQuery = useMemo(
        () => getCampaignsPerformanceGraphData(attrs),
        [attrs]
    )

    const campaignsPerformance = usePostReporting<[CubeData], CubeData>(
        campaignsPerformanceQuery,
        OVERRIDES
    )
    const integrationIds = useMemo(
        () => (!!integrationId ? [integrationId] : []),
        [integrationId]
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
        channels
    )

    const data = useMemo(() => {
        // transform individual metrics to the same data format
        const campaignsPerformanceData = campaignsPerformance.data || []
        const campaignsCTR = campaignsPerformanceData.map(
            (dataPoint: CubeMetric) =>
                transformToCampaignCTROverTime(dataPoint, timeGranularity)
        )
        const campaignConversionRate = campaignsPerformanceData.map(
            (dataPoint: CubeMetric) =>
                transformToCampaignConversionRateOverTime(
                    dataPoint,
                    timeGranularity
                )
        )
        const chatConversionRate =
            transformToChatConversionRateOverTime(chatPerformance)

        // make sure there are no gaps in the data to cause lines misalignment
        const [bfCampaignCTR, bfCampaignConversionRate, bfChatConversionRate] =
            backfillGraphData(
                [campaignsCTR, campaignConversionRate, chatConversionRate],
                startDate,
                endDate
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
