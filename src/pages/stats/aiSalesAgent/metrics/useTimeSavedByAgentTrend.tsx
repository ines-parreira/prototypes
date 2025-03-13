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
    fetchTotalNumberOfAgentConverationsTrend,
    useTotalNumberOfAgentConverationsTrend,
} from './useTotalNumberOfAgentConverationsTrend'

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
    const totalNumberOfAgentConverationsData =
        useTotalNumberOfAgentConverationsTrend(filters, timezone)
    const ticketHandleTimeData = useTicketHandleTimeTrend(filters, timezone)
    const successRateData = useSuccessRateTrend(filters, timezone)

    const isFetching =
        totalNumberOfAgentConverationsData.isFetching ||
        ticketHandleTimeData.isFetching ||
        successRateData.isFetching
    const isError =
        totalNumberOfAgentConverationsData.isError ||
        ticketHandleTimeData.isError ||
        successRateData.isError

    const data = useMemo(() => {
        if (
            !totalNumberOfAgentConverationsData.data ||
            !ticketHandleTimeData.data ||
            !successRateData.data ||
            isFetching ||
            isError
        ) {
            return undefined
        }

        return calculateTimeSavedByAgents(
            totalNumberOfAgentConverationsData,
            ticketHandleTimeData,
            successRateData,
        )
    }, [
        totalNumberOfAgentConverationsData,
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
        fetchTotalNumberOfAgentConverationsTrend(filters, timezone),
        fetchTicketHandleTimeTrend(filters, timezone),
        fetchSuccessRateTrend(filters, timezone),
    ])
        .then(
            ([
                totalNumberOfAgentConverationsData,
                ticketHandleTimeData,
                successRateData,
            ]) => {
                return {
                    isFetching: false,
                    isError: false,
                    data: calculateTimeSavedByAgents(
                        totalNumberOfAgentConverationsData,
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
