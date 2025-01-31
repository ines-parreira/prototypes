import {useMemo} from 'react'

import {
    fetchClosedTicketsMetric,
    Metric,
    useClosedTicketsMetric,
} from 'hooks/reporting/metrics'
import {
    fetchClosedTicketsMetricPerAgent,
    useClosedTicketsMetricPerAgent,
} from 'hooks/reporting/metricsPerAgent'
import {
    MetricWithDecile,
    MetricWithDecileFetch,
} from 'hooks/reporting/useMetricPerDimension'
import {OrderDirection} from 'models/api/types'
import {TicketMeasure} from 'models/reporting/cubes/TicketCube'
import {StatsFilters} from 'models/stat/types'
import {calculatePercentage} from 'utils/reporting'

const ticketCountField = TicketMeasure.TicketCount

const formatResult = (
    closedTicketsPerAgent: MetricWithDecile,
    allClosedTickets: Metric
): MetricWithDecile['data'] => {
    let metricValue = null
    if (closedTicketsPerAgent.data?.value && allClosedTickets.data?.value) {
        metricValue = calculatePercentage(
            closedTicketsPerAgent.data.value,
            allClosedTickets.data?.value
        )
    }

    const allData = closedTicketsPerAgent.data?.allData || []

    return {
        value: metricValue,
        decile: closedTicketsPerAgent.data?.decile || null,
        allData: allData.map((item) => ({
            ...item,
            [ticketCountField]:
                item[ticketCountField] && allClosedTickets.data?.value
                    ? String(
                          calculatePercentage(
                              Number(item[ticketCountField]),
                              allClosedTickets.data.value
                          )
                      )
                    : item[ticketCountField],
        })),
    }
}

export const usePercentageOfClosedTicketsMetricPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string
): MetricWithDecile => {
    const closedTicketsPerAgent = useClosedTicketsMetricPerAgent(
        statsFilters,
        timezone,
        sorting,
        agentAssigneeId
    )
    const allClosedTickets = useClosedTicketsMetric(statsFilters, timezone)

    const data = useMemo(
        () => formatResult(closedTicketsPerAgent, allClosedTickets),
        [allClosedTickets, closedTicketsPerAgent]
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
        agentAssigneeId?: string
    ): Promise<MetricWithDecile> => {
        return Promise.all([
            fetchClosedTicketsMetricPerAgent(
                statsFilters,
                timezone,
                sorting,
                agentAssigneeId
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
