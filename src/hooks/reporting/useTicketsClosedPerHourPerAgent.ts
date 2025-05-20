import { useMemo } from 'react'

import { calculateMetricPerHour } from 'hooks/reporting/metricCalculations'
import {
    fetchClosedTicketsMetricPerAgent,
    fetchOnlineTimePerAgent,
    useClosedTicketsMetricPerAgent,
    useOnlineTimePerAgent,
} from 'hooks/reporting/metricsPerAgent'
import { calculateDecile } from 'hooks/reporting/ticket-insights/useCustomFieldsTicketCountPerCustomFields'
import { periodAndAgentOnlyFilters } from 'hooks/reporting/useMessagesSentPerHour'
import {
    MetricWithDecile,
    MetricWithDecileFetch,
} from 'hooks/reporting/useMetricPerDimension'
import { OrderDirection } from 'models/api/types'
import {
    AgentTimeTrackingDimension,
    AgentTimeTrackingMeasure,
} from 'models/reporting/cubes/agentxp/AgentTimeTrackingCube'
import {
    TicketDimension,
    TicketMeasure,
} from 'models/reporting/cubes/TicketCube'
import { StatsFilters } from 'models/stat/types'
import { matchAndCalculateAllEntries, sortAllData } from 'utils/reporting'

const assigneeUserId = TicketDimension.AssigneeUserId
const userIdField = AgentTimeTrackingDimension.UserId
const ticketCountField = TicketMeasure.TicketCount
const onlineTimeField = AgentTimeTrackingMeasure.OnlineTime

const formatResult = (
    closedTickets: MetricWithDecile,
    onlineTime: MetricWithDecile,
    sorting?: OrderDirection,
): MetricWithDecile['data'] => {
    let metricValue: number | null = null

    if (closedTickets.data?.value && onlineTime.data?.value) {
        metricValue = calculateMetricPerHour(
            closedTickets.data.value,
            onlineTime.data.value,
        )
    }
    const data =
        closedTickets.data && onlineTime.data
            ? matchAndCalculateAllEntries(
                  closedTickets,
                  onlineTime,
                  calculateMetricPerHour,
                  assigneeUserId,
                  userIdField,
                  ticketCountField,
                  onlineTimeField,
              )
            : []

    const sortedData = sortAllData(data, ticketCountField, sorting)

    const maxValue = Math.max(
        ...sortedData.map((item) => Number(item[ticketCountField])),
    )

    return {
        allData: sortedData,
        value: metricValue,
        decile: calculateDecile(metricValue || 0, maxValue),
    }
}

export const useTicketsClosedPerHourPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string,
): MetricWithDecile => {
    const closedTickets = useClosedTicketsMetricPerAgent(
        periodAndAgentOnlyFilters(statsFilters),
        timezone,
        sorting,
        String(agentAssigneeId),
    )
    const onlineTime = useOnlineTimePerAgent(
        periodAndAgentOnlyFilters(statsFilters),
        timezone,
        sorting,
        String(agentAssigneeId),
    )

    const data = useMemo(
        () => formatResult(closedTickets, onlineTime, sorting),
        [closedTickets, onlineTime, sorting],
    )

    return {
        isFetching: closedTickets.isFetching || onlineTime.isFetching,
        isError: closedTickets.isError || onlineTime.isError,
        data: data,
    }
}

export const fetchTicketsClosedPerHourPerAgent: MetricWithDecileFetch = async (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string,
): Promise<MetricWithDecile> => {
    return Promise.all([
        fetchClosedTicketsMetricPerAgent(
            periodAndAgentOnlyFilters(statsFilters),
            timezone,
            sorting,
            agentAssigneeId,
        ),
        fetchOnlineTimePerAgent(
            periodAndAgentOnlyFilters(statsFilters),
            timezone,
            sorting,
            agentAssigneeId,
        ),
    ])
        .then(([closedTickets, onlineTime]) => ({
            isFetching: false,
            isError: false,
            data: formatResult(closedTickets, onlineTime, sorting),
        }))
        .catch(() => ({ isError: true, isFetching: false, data: null }))
}
