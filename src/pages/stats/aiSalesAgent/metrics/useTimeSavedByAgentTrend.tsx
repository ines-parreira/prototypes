import { useMemo } from 'react'

import {
    fetchOnlineTimeTrend,
    useOnlineTimeTrend,
} from 'hooks/reporting/metricTrends'
import { MetricTrend } from 'hooks/reporting/useMetricTrend'
import { StatsFilters } from 'models/stat/types'

import {
    fetchTotalNumberOfAgentConverationsTrend,
    useTotalNumberOfAgentConverationsTrend,
} from './useTotalNumberOfAgentConverationsTrend'

const calculateTimeSavedByAgents = (
    numberOfInteractions: MetricTrend,
    automatedInteractionTrend: MetricTrend,
) => {
    return {
        value:
            (numberOfInteractions.data?.value ?? 0) *
            (automatedInteractionTrend.data?.value ?? 0),
        prevValue:
            (numberOfInteractions.data?.prevValue ?? 0) *
            (automatedInteractionTrend.data?.prevValue ?? 0),
    }
}

const useTimeSavedByAgentTrend = (filters: StatsFilters, timezone: string) => {
    const totalNumberOfAgentConverationsData =
        useTotalNumberOfAgentConverationsTrend(filters, timezone)
    const onlineTimeData = useOnlineTimeTrend(filters, timezone)

    const isFetching =
        totalNumberOfAgentConverationsData.isFetching ||
        onlineTimeData.isFetching
    const isError =
        totalNumberOfAgentConverationsData.isError || onlineTimeData.isError

    const data = useMemo(() => {
        if (
            !totalNumberOfAgentConverationsData.data ||
            !onlineTimeData.data ||
            isFetching ||
            isError
        ) {
            return undefined
        }

        return calculateTimeSavedByAgents(
            totalNumberOfAgentConverationsData,
            onlineTimeData,
        )
    }, [
        totalNumberOfAgentConverationsData,
        onlineTimeData,
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
        fetchOnlineTimeTrend(filters, timezone),
    ])
        .then(([totalNumberOfAgentConverationsData, onlineTimeData]) => {
            return {
                isFetching: false,
                isError: false,
                data: calculateTimeSavedByAgents(
                    totalNumberOfAgentConverationsData,
                    onlineTimeData,
                ),
            }
        })
        .catch(() => ({
            isFetching: false,
            isError: true,
            data: undefined,
        }))
}

export { useTimeSavedByAgentTrend, fetchTimeSavedByAgentTrend }
