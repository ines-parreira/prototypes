import {useMemo} from 'react'

import {
    fetchMessagesSentMetricPerAgent,
    fetchOnlineTimePerAgent,
    useMessagesSentMetricPerAgent,
    useOnlineTimePerAgent,
} from 'hooks/reporting/metricsPerAgent'
import {calculateDecile} from 'hooks/reporting/ticket-insights/useCustomFieldsTicketCountPerCustomFields'
import {
    calculateMetricPerHour,
    periodAndAgentOnlyFilters,
} from 'hooks/reporting/useMessagesSentPerHour'
import {
    MetricWithDecile,
    MetricWithDecileFetch,
} from 'hooks/reporting/useMetricPerDimension'
import {OrderDirection} from 'models/api/types'
import {
    AgentTimeTrackingDimension,
    AgentTimeTrackingMeasure,
} from 'models/reporting/cubes/agentxp/AgentTimeTrackingCube'
import {
    HelpdeskMessageDimension,
    HelpdeskMessageMeasure,
} from 'models/reporting/cubes/HelpdeskMessageCube'
import {StatsFilters} from 'models/stat/types'
import {matchAndCalculateAllEntries, sortAllData} from 'utils/reporting'

const senderIdField = HelpdeskMessageDimension.SenderId
const userIdField = AgentTimeTrackingDimension.UserId
const messageCountField = HelpdeskMessageMeasure.MessageCount
const onlineTimeField = AgentTimeTrackingMeasure.OnlineTime

const formatResult = (
    messagesSent: MetricWithDecile,
    onlineTime: MetricWithDecile,
    sorting?: OrderDirection
): MetricWithDecile['data'] => {
    let metricValue: number | null = null

    if (messagesSent.data?.value && onlineTime.data?.value) {
        metricValue = calculateMetricPerHour(
            messagesSent.data.value,
            onlineTime.data.value
        )
    }

    const data =
        messagesSent.data && onlineTime.data
            ? matchAndCalculateAllEntries(
                  messagesSent,
                  onlineTime,
                  calculateMetricPerHour,
                  senderIdField,
                  userIdField,
                  messageCountField,
                  onlineTimeField
              )
            : []

    const sortedData = sortAllData(data, messageCountField, sorting)

    const maxValue = Math.max(
        ...sortedData.map((item) => Number(item[messageCountField]))
    )
    return {
        allData: sortedData,
        value: metricValue,
        decile: calculateDecile(metricValue || 0, maxValue),
    }
}

export const useMessagesSentPerHourPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string
): MetricWithDecile => {
    const messagesSent = useMessagesSentMetricPerAgent(
        periodAndAgentOnlyFilters(statsFilters),
        timezone,
        sorting,
        String(agentAssigneeId)
    )
    const onlineTime = useOnlineTimePerAgent(
        periodAndAgentOnlyFilters(statsFilters),
        timezone,
        sorting,
        String(agentAssigneeId)
    )

    const data = useMemo(
        () => formatResult(messagesSent, onlineTime, sorting),
        [messagesSent, onlineTime, sorting]
    )

    return {
        isFetching: messagesSent.isFetching || onlineTime.isFetching,
        isError: messagesSent.isError || onlineTime.isError,
        data: data,
    }
}

export const fetchMessagesSentPerHourPerAgent: MetricWithDecileFetch = async (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string
): Promise<MetricWithDecile> => {
    return Promise.all([
        fetchMessagesSentMetricPerAgent(
            periodAndAgentOnlyFilters(statsFilters),
            timezone,
            sorting,
            agentAssigneeId
        ),
        fetchOnlineTimePerAgent(
            periodAndAgentOnlyFilters(statsFilters),
            timezone,
            sorting,
            agentAssigneeId
        ),
    ])
        .then(([messagesSent, onlineTime]) => ({
            data: formatResult(messagesSent, onlineTime, sorting),
            isFetching: false,
            isError: false,
        }))
        .catch(() => ({
            data: null,
            isFetching: false,
            isError: true,
        }))
}
