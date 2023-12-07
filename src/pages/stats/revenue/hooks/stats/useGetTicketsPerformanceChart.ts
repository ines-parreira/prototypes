import {useEffect, useMemo, useState} from 'react'
// [PLTOF-48] Please avoid importing more hooks from 'react-use', prefer using your own implementation of the hook rather than depending on external library
// eslint-disable-next-line no-restricted-imports
import {useAsyncFn} from 'react-use'
import {getTicketsPerformanceData} from 'pages/stats/revenue/clients/RevenueAttributionClient'
import {RevenueAttributionFilterParams} from 'pages/stats/revenue/clients/types'
import {getDataFromStatResult} from 'pages/stats/revenue/services/CampaignMetricsHelper'
import {CampaignGraphData} from 'pages/stats/revenue/services/types'
import {TicketChannel} from 'business/types/ticket'

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
            setError(error)
        }
    }, [attrs])

    useEffect(() => void fetchTotals(), [fetchTotals])

    return {
        isFetching: loading,
        isError: !!error,
        data: data,
    }
}
