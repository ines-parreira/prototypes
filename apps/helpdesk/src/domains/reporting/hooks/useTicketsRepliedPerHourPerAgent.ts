import { useMemo } from 'react'

import { calculateMetricPerHour } from 'domains/reporting/hooks/metricCalculations'
import {
    fetchOnlineTimePerAgent,
    fetchTicketsRepliedMetricPerAgent,
    useOnlineTimePerAgent,
    useTicketsRepliedMetricPerAgent,
} from 'domains/reporting/hooks/metricsPerAgent'
import { calculateDecile } from 'domains/reporting/hooks/ticket-insights/useCustomFieldsTicketCountPerCustomFields'
import { periodAndAgentOnlyFilters } from 'domains/reporting/hooks/useMessagesSentPerHour'
import type {
    MetricWithDecile,
    MetricWithDecileFetch,
} from 'domains/reporting/hooks/useMetricPerDimension'
import {
    AgentTimeTrackingDimension,
    AgentTimeTrackingMeasure,
} from 'domains/reporting/models/cubes/agentxp/AgentTimeTrackingCube'
import { HelpdeskMessageMeasure } from 'domains/reporting/models/cubes/HelpdeskMessageCube'
import { TicketMember } from 'domains/reporting/models/cubes/TicketCube'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    matchAndCalculateAllEntries,
    sortAllData,
} from 'domains/reporting/utils/reporting'
import type { OrderDirection } from 'models/api/types'

const senderId = TicketMember.MessageSenderId
const userIdField = AgentTimeTrackingDimension.UserId
const ticketCountField = HelpdeskMessageMeasure.TicketCount
const onlineTimeField = AgentTimeTrackingMeasure.OnlineTime

const formatResult = (
    repliedTickets: MetricWithDecile,
    onlineTime: MetricWithDecile,
    sorting?: OrderDirection,
): MetricWithDecile['data'] => {
    let metricValue: number | null = null

    if (repliedTickets.data?.value && onlineTime.data?.value) {
        metricValue = calculateMetricPerHour(
            repliedTickets.data.value,
            onlineTime.data.value,
        )
    }

    const data =
        repliedTickets.data && onlineTime.data
            ? matchAndCalculateAllEntries(
                  repliedTickets,
                  onlineTime,
                  calculateMetricPerHour,
                  senderId,
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

export const useTicketsRepliedPerHourPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string,
): MetricWithDecile => {
    const repliedTickets = useTicketsRepliedMetricPerAgent(
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
        () => formatResult(repliedTickets, onlineTime, sorting),
        [onlineTime, repliedTickets, sorting],
    )

    return {
        isFetching: repliedTickets.isFetching || onlineTime.isFetching,
        isError: repliedTickets.isError || onlineTime.isError,
        data: data,
    }
}

export const fetchTicketsRepliedPerHourPerAgent: MetricWithDecileFetch = async (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string,
): Promise<MetricWithDecile> => {
    return Promise.all([
        fetchTicketsRepliedMetricPerAgent(
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
        .then(([repliedTickets, onlineTime]) => ({
            data: formatResult(repliedTickets, onlineTime, sorting),
            isError: false,
            isFetching: false,
        }))
        .catch(() => ({
            isFetching: false,
            isError: false,
            data: null,
        }))
}
