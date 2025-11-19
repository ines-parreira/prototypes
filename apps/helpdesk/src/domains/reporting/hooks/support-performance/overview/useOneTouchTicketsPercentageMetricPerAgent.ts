import { useMemo } from 'react'

import {
    fetchClosedTicketsMetricPerAgent,
    fetchOneTouchTicketsMetricPerAgent,
    useClosedTicketsMetricPerAgent,
    useOneTouchTicketsMetricPerAgent,
} from 'domains/reporting/hooks/metricsPerAgent'
import { calculateDecile } from 'domains/reporting/hooks/ticket-insights/useCustomFieldsTicketCountPerCustomFields'
import type {
    MetricWithDecile,
    ReportingMetricItemValue,
} from 'domains/reporting/hooks/useMetricPerDimension'
import type { Cubes } from 'domains/reporting/models/cubes'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    calculatePercentage,
    matchAndCalculateAllEntries,
    sortAllData,
} from 'domains/reporting/utils/reporting'
import type { OrderDirection } from 'models/api/types'

const formatData = (
    oneTouchTickets: MetricWithDecile<ReportingMetricItemValue, Cubes>,
    closedTicketsPerAgent: MetricWithDecile<ReportingMetricItemValue, Cubes>,
    sorting?: OrderDirection,
) => {
    let metricValue: number | null = null

    if (closedTicketsPerAgent.data?.value && oneTouchTickets.data?.value) {
        metricValue = calculatePercentage(
            oneTouchTickets.data.value,
            closedTicketsPerAgent.data.value,
        )
    }
    const allData = matchAndCalculateAllEntries(
        oneTouchTickets,
        closedTicketsPerAgent,
        calculatePercentage,
    )

    const ticketCountField = oneTouchTickets.data?.measures?.[0] || ''
    const sortedData = sortAllData(allData, ticketCountField, sorting)

    const maxValue = Math.max(
        ...sortedData.map((item) => Number(item[ticketCountField])),
    )

    return {
        allData: sortedData,
        value: metricValue,
        decile: calculateDecile(metricValue || 0, maxValue),
        dimensions: oneTouchTickets.data?.dimensions || [],
        measures: oneTouchTickets.data?.measures || [],
    }
}

export const useOneTouchTicketsPercentageMetricPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string,
): MetricWithDecile => {
    const oneTouchTickets = useOneTouchTicketsMetricPerAgent(
        statsFilters,
        timezone,
        sorting,
        agentAssigneeId,
    )

    const closedTicketsPerAgent = useClosedTicketsMetricPerAgent(
        statsFilters,
        timezone,
        sorting,
        agentAssigneeId,
    )

    const data = useMemo(
        () => formatData(oneTouchTickets, closedTicketsPerAgent, sorting),
        [oneTouchTickets, closedTicketsPerAgent, sorting],
    )

    return {
        isFetching:
            oneTouchTickets.isFetching || closedTicketsPerAgent.isFetching,
        isError: oneTouchTickets.isError || closedTicketsPerAgent.isError,
        data: data,
    }
}

export const fetchOneTouchTicketsPercentageMetricPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string,
): Promise<MetricWithDecile> =>
    Promise.all([
        fetchOneTouchTicketsMetricPerAgent(
            statsFilters,
            timezone,
            sorting,
            agentAssigneeId,
        ),
        fetchClosedTicketsMetricPerAgent(
            statsFilters,
            timezone,
            sorting,
            agentAssigneeId,
        ),
    ])
        .then(([oneTouchTickets, closedTickets]) => {
            return {
                isFetching: false,
                isError: false,
                data: formatData(oneTouchTickets, closedTickets, sorting),
            }
        })
        .catch(() => {
            return {
                isFetching: false,
                isError: true,
                data: null,
            }
        })
