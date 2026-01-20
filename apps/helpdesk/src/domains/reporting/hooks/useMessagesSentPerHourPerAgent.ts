import { useMemo } from 'react'

import { calculateMetricPerHour } from 'domains/reporting/hooks/metricCalculations'
import {
    fetchMessagesSentMetricPerAgent,
    fetchOnlineTimePerAgent,
    useMessagesSentMetricPerAgent,
    useOnlineTimePerAgent,
} from 'domains/reporting/hooks/metricsPerAgent'
import { calculateDecile } from 'domains/reporting/hooks/ticket-insights/useCustomFieldsTicketCountPerCustomFields'
import type {
    MetricWithDecile,
    MetricWithDecileFetch,
} from 'domains/reporting/hooks/types'
import { periodAndAgentOnlyFilters } from 'domains/reporting/hooks/useMessagesSentPerHour'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    matchAndCalculateAllEntries,
    sortAllData,
} from 'domains/reporting/utils/reporting'
import type { OrderDirection } from 'models/api/types'

const formatResult = (
    messagesSent: MetricWithDecile,
    onlineTime: MetricWithDecile,
    sorting?: OrderDirection,
): MetricWithDecile['data'] => {
    let metricValue: number | null = null

    if (messagesSent.data?.value && onlineTime.data?.value) {
        metricValue = calculateMetricPerHour(
            messagesSent.data.value,
            onlineTime.data.value,
        )
    }

    const data =
        messagesSent.data && onlineTime.data
            ? matchAndCalculateAllEntries(
                  messagesSent,
                  onlineTime,
                  calculateMetricPerHour,
              )
            : []

    const messageCountField = messagesSent.data?.measures?.[0] || ''
    const sortedData = sortAllData(data, messageCountField, sorting)

    const maxValue = Math.max(
        ...sortedData.map((item) => Number(item[messageCountField])),
    )
    return {
        allData: sortedData,
        value: metricValue,
        decile: calculateDecile(metricValue || 0, maxValue),
        dimensions: messagesSent.data?.dimensions || [],
        measures: messagesSent.data?.measures || [],
    }
}

export const useMessagesSentPerHourPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string,
): MetricWithDecile => {
    const messagesSent = useMessagesSentMetricPerAgent(
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
        () => formatResult(messagesSent, onlineTime, sorting),
        [messagesSent, onlineTime, sorting],
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
    agentAssigneeId?: string,
): Promise<MetricWithDecile> => {
    return Promise.all([
        fetchMessagesSentMetricPerAgent(
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
