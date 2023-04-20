import {useEffect, useMemo, useState} from 'react'
import {useAsyncFn} from 'react-use'
import {getCampaignTicketsPerformanceData} from 'pages/stats/revenue/clients/RevenueAttributionClient'
import {RevenueAttributionFilterParams} from 'pages/stats/revenue/clients/types'
import {getDataFromStatResult} from 'pages/stats/revenue/services/CampaignMetricsHelper'
import {TicketPerformanceData} from 'pages/stats/revenue/services/types'

export type GetTicketsPerformanceQuery = {
    isFetching: boolean
    isError: boolean
    data?: TicketPerformanceData
}

export const useTicketsPerformanceStat = (
    campaignIds: string[],
    startDate: string,
    endDate: string
): GetTicketsPerformanceQuery => {
    const [data, setData] = useState<TicketPerformanceData | undefined>(
        undefined
    )
    const [error, setError] = useState<Error | undefined>(undefined)

    const attrs: RevenueAttributionFilterParams = useMemo(
        () => ({
            campaignIds,
            startDate,
            endDate,
        }),
        [campaignIds, startDate, endDate]
    )

    const [{loading}, fetchTotals] = useAsyncFn(async () => {
        try {
            const ticketsPerformance = await getCampaignTicketsPerformanceData(
                attrs
            )
            const ticketsPerformanceData =
                getDataFromStatResult(ticketsPerformance)
            setData(ticketsPerformanceData as TicketPerformanceData)
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
