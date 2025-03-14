import { useMemo } from 'react'

import {
    fetchTicketHandleTimeTrend,
    useTicketHandleTimeTrend,
} from 'hooks/reporting/metricTrends'
import { MetricTrend } from 'hooks/reporting/useMetricTrend'
import { StatsFilters } from 'models/stat/types'
import {
    fetchSuccessRateTrend,
    useSuccessRateTrend,
} from 'pages/stats/aiSalesAgent/metrics/useSuccessRateTrend'

import {
    fetchTotalSalesOportunityAIConvTrend,
    useTotalSalesOportunityAIConvTrend,
} from './useTotalSalesOportunityAIConvTrend'

const calculateTimeSavedByAgents = (
    numberOfInteractions: MetricTrend,
    ticketHandleTimeData: MetricTrend,
    successRateData: MetricTrend,
) => {
    return {
        value:
            (numberOfInteractions.data?.value ?? 0) *
            (successRateData.data?.value ?? 0) *
            (ticketHandleTimeData.data?.value ?? 0),
        prevValue:
            (numberOfInteractions.data?.prevValue ?? 0) *
            (successRateData.data?.prevValue ?? 0) *
            (ticketHandleTimeData.data?.prevValue ?? 0),
    }
}

const useTimeSavedByAgentTrend = (filters: StatsFilters, timezone: string) => {
    const totalNumberOfAgentSalesConverationsData =
        useTotalSalesOportunityAIConvTrend(filters, timezone)
    const ticketHandleTimeData = useTicketHandleTimeTrend(filters, timezone)
    const successRateData = useSuccessRateTrend(filters, timezone)

    const isFetching =
        totalNumberOfAgentSalesConverationsData.isFetching ||
        ticketHandleTimeData.isFetching ||
        successRateData.isFetching
    const isError =
        totalNumberOfAgentSalesConverationsData.isError ||
        ticketHandleTimeData.isError ||
        successRateData.isError

    const data = useMemo(() => {
        if (
            !totalNumberOfAgentSalesConverationsData.data ||
            !ticketHandleTimeData.data ||
            !successRateData.data ||
            isFetching ||
            isError
        ) {
            return undefined
        }

        return calculateTimeSavedByAgents(
            totalNumberOfAgentSalesConverationsData,
            ticketHandleTimeData,
            successRateData,
        )
    }, [
        totalNumberOfAgentSalesConverationsData,
        ticketHandleTimeData,
        successRateData,
        isError,
        isFetching,
    ])
    return {
        data,
        isFetching,
        isError,
    }
}

const fetchTimeSavedByAgentTrend = (
    filters: StatsFilters,
    timezone: string,
) => {
    return Promise.all([
        fetchTotalSalesOportunityAIConvTrend(filters, timezone),
        fetchTicketHandleTimeTrend(filters, timezone),
        fetchSuccessRateTrend(filters, timezone),
    ])
        .then(
            ([
                totalNumberOfAgentSalesConverationsData,
                ticketHandleTimeData,
                successRateData,
            ]) => {
                return {
                    isFetching: false,
                    isError: false,
                    data: calculateTimeSavedByAgents(
                        totalNumberOfAgentSalesConverationsData,
                        ticketHandleTimeData,
                        successRateData,
                    ),
                }
            },
        )
        .catch(() => ({
            isFetching: false,
            isError: true,
            data: undefined,
        }))
}

export { useTimeSavedByAgentTrend, fetchTimeSavedByAgentTrend }
