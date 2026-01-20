import { useMemo } from 'react'

import type { Metric } from 'domains/reporting/hooks/metrics'
import {
    fetchClosedTicketsMetric,
    useClosedTicketsMetric,
} from 'domains/reporting/hooks/metrics'
import {
    fetchClosedTicketsMetricPerAgent,
    useClosedTicketsMetricPerAgent,
} from 'domains/reporting/hooks/metricsPerAgent'
import type {
    MetricWithDecile,
    MetricWithDecileFetch,
} from 'domains/reporting/hooks/types'
import { TicketMeasure } from 'domains/reporting/models/cubes/TicketCube'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { calculatePercentage } from 'domains/reporting/utils/reporting'
import type { OrderDirection } from 'models/api/types'

const ticketCountField = TicketMeasure.TicketCount

const formatResult = (
    closedTicketsPerAgent: MetricWithDecile,
    allClosedTickets: Metric,
): MetricWithDecile['data'] => {
    let metricValue = null
    if (closedTicketsPerAgent.data?.value && allClosedTickets.data?.value) {
        metricValue = calculatePercentage(
            closedTicketsPerAgent.data.value,
            allClosedTickets.data?.value,
        )
    }

    const allData = closedTicketsPerAgent.data?.allData || []

    return {
        value: metricValue,
        decile: closedTicketsPerAgent.data?.decile || null,
        dimensions: closedTicketsPerAgent.data?.dimensions || [],
        measures: closedTicketsPerAgent.data?.measures || [],
        allData: allData.map((item) => ({
            ...item,
            [ticketCountField]:
                item[ticketCountField] && allClosedTickets.data?.value
                    ? String(
                          calculatePercentage(
                              Number(item[ticketCountField]),
                              allClosedTickets.data.value,
                          ),
                      )
                    : item[ticketCountField],
        })),
    }
}

export const usePercentageOfClosedTicketsMetricPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string,
): MetricWithDecile => {
    const closedTicketsPerAgent = useClosedTicketsMetricPerAgent(
        statsFilters,
        timezone,
        sorting,
        agentAssigneeId,
    )
    const allClosedTickets = useClosedTicketsMetric(statsFilters, timezone)

    const data = useMemo(
        () => formatResult(closedTicketsPerAgent, allClosedTickets),
        [allClosedTickets, closedTicketsPerAgent],
    )

    return {
        isFetching:
            allClosedTickets.isFetching || closedTicketsPerAgent.isFetching,
        isError: allClosedTickets.isError || closedTicketsPerAgent.isError,
        data: data,
    }
}

export const fetchPercentageOfClosedTicketsMetricPerAgent: MetricWithDecileFetch =
    async (
        statsFilters: StatsFilters,
        timezone: string,
        sorting?: OrderDirection,
        agentAssigneeId?: string,
    ): Promise<MetricWithDecile> => {
        return Promise.all([
            fetchClosedTicketsMetricPerAgent(
                statsFilters,
                timezone,
                sorting,
                agentAssigneeId,
            ),
            fetchClosedTicketsMetric(statsFilters, timezone),
        ])
            .then(([ticketsPerDimension, allTickets]) => {
                return {
                    data: formatResult(ticketsPerDimension, allTickets),
                    isFetching: false,
                    isError: false,
                }
            })
            .catch(() => ({
                isFetching: false,
                isError: true,
                data: null,
            }))
    }
