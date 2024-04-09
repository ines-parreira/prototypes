import {useEffect, useMemo, useState} from 'react'
import {getTicketsPerformanceData} from 'pages/stats/convert/clients/RevenueAttributionClient'
import {RevenueAttributionFilterParams} from 'pages/stats/convert/clients/types'
import {getDataFromStatResult} from 'pages/stats/convert/services/CampaignMetricsHelper'
import {CampaignGraphData} from 'pages/stats/convert/services/types'
import {TicketChannel} from 'business/types/ticket'
import useAsyncFn from 'hooks/useAsyncFn'

export type GetTicketsPerformanceQuery = {
    isFetching: boolean
    isError: boolean
    data?: CampaignGraphData
}

export const useTicketsPerformanceChart = (
    campaignIds: string[],
    startDate: string,
    endDate: string,
    integrationIds: number[],
    channels: TicketChannel[]
): GetTicketsPerformanceQuery => {
    const [data, setData] = useState<CampaignGraphData | undefined>(undefined)
    const [error, setError] = useState<Error | undefined>(undefined)

    const attrs: RevenueAttributionFilterParams = useMemo(
        () => ({
            campaignIds,
            startDate,
            endDate,
            integrationIds,
            channels,
        }),
        [campaignIds, startDate, endDate, integrationIds, channels]
    )

    const [{loading}, fetchTotals] = useAsyncFn(async () => {
        try {
            const ticketsPerformance = await getTicketsPerformanceData(attrs)
            const ticketsPerformanceData =
                getDataFromStatResult(ticketsPerformance)
            setData(ticketsPerformanceData as CampaignGraphData)
        } catch (error) {
            setError(error as Error)
        }
    }, [attrs])

    useEffect(() => void fetchTotals(), [fetchTotals])

    return {
        isFetching: loading,
        isError: !!error,
        data: data,
    }
}
