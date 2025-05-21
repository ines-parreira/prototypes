import { useMemo } from 'react'

import {
    fetchClosedTicketsMetricPerAgent,
    fetchOneTouchTicketsMetricPerAgent,
    useClosedTicketsMetricPerAgent,
    useOneTouchTicketsMetricPerAgent,
} from 'hooks/reporting/metricsPerAgent'
import { calculateDecile } from 'hooks/reporting/ticket-insights/useCustomFieldsTicketCountPerCustomFields'
import { MetricWithDecile } from 'hooks/reporting/useMetricPerDimension'
import { OrderDirection } from 'models/api/types'
import {
    TicketDimension,
    TicketMeasure,
} from 'models/reporting/cubes/TicketCube'
import { StatsFilters } from 'models/stat/types'
import {
    calculatePercentage,
    matchAndCalculateAllEntries,
    sortAllData,
} from 'utils/reporting'

const assigneeIdField = TicketDimension.AssigneeUserId
const ticketCountField = TicketMeasure.TicketCount

const formatData = (
    oneTouchTickets: MetricWithDecile,
    closedTicketsPerAgent: MetricWithDecile,
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
        assigneeIdField,
        assigneeIdField,
        ticketCountField,
        ticketCountField,
    )
    const sortedData = sortAllData(allData, ticketCountField, sorting)

    const maxValue = Math.max(
        ...sortedData.map((item) => Number(item[ticketCountField])),
    )

    return {
        allData: sortedData,
        value: metricValue,
        decile: calculateDecile(metricValue || 0, maxValue),
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
