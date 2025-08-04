import { useEffect, useMemo, useState } from 'react'

import { useAsyncFn } from '@repo/hooks'

import { TicketChannel } from 'business/types/ticket'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { getTicketsPerformanceData } from 'domains/reporting/pages/convert/clients/RevenueAttributionClient'
import { RevenueAttributionFilterParams } from 'domains/reporting/pages/convert/clients/types'
import { getDataFromStatResult } from 'domains/reporting/pages/convert/services/CampaignMetricsHelper'
import { CampaignGraphData } from 'domains/reporting/pages/convert/services/types'

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
    campaignsOperator: LogicalOperatorEnum,
    channels: TicketChannel[],
): GetTicketsPerformanceQuery => {
    const [data, setData] = useState<CampaignGraphData | undefined>(undefined)
    const [error, setError] = useState<Error | undefined>(undefined)

    const attrs: RevenueAttributionFilterParams = useMemo(
        () => ({
            campaignIds,
            startDate,
            endDate,
            integrationIds,
            campaignsOperator,
            channels,
        }),
        [
            campaignIds,
            startDate,
            endDate,
            integrationIds,
            channels,
            campaignsOperator,
        ],
    )

    const [{ loading }, fetchTotals] = useAsyncFn(async () => {
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
