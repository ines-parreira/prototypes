import {useFlags} from 'launchdarkly-react-client-sdk'
import {useMemo} from 'react'
import {MetricWithDecile} from 'hooks/reporting/useMetricPerDimension'
import {
    calculateMessagesPerHour,
    periodAndAgentOnlyFilters,
} from 'hooks/reporting/useMessagesSentPerHour'
import {FeatureFlagKey} from 'config/featureFlags'
import {
    useMessagesSentMetricPerAgent,
    useOnlineTimePerAgent,
} from 'hooks/reporting/metricsPerDimension'
import {calculateDecile} from 'hooks/reporting/useCustomFieldsTicketCountPerCustomFields'
import {renameMemberEnriched} from 'hooks/reporting/useEnrichedCubes'
import {
    matchAndCalculateAllEntries,
    sortAllData,
} from 'hooks/reporting/useOneTouchTicketsPercentageMetricPerAgent'
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

export const useMessagesSentPerHourPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string
): MetricWithDecile => {
    const isAnalyticsNewCubes: boolean | undefined =
        useFlags()[FeatureFlagKey.AnalyticsNewCubes]
    const senderIdField = isAnalyticsNewCubes
        ? renameMemberEnriched(HelpdeskMessageDimension.SenderId)
        : HelpdeskMessageDimension.SenderId
    const userIdField = isAnalyticsNewCubes
        ? renameMemberEnriched(AgentTimeTrackingDimension.UserId)
        : AgentTimeTrackingDimension.UserId
    const messageCountField = isAnalyticsNewCubes
        ? renameMemberEnriched(HelpdeskMessageMeasure.MessageCount)
        : HelpdeskMessageMeasure.MessageCount
    const onlineTimeField = isAnalyticsNewCubes
        ? renameMemberEnriched(AgentTimeTrackingMeasure.OnlineTime)
        : AgentTimeTrackingMeasure.OnlineTime

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

    let metricValue: number | null = null

    if (messagesSent.data?.value && onlineTime.data?.value) {
        metricValue = calculateMessagesPerHour(
            messagesSent.data.value,
            onlineTime.data.value
        )
    }

    const sortedData = useMemo(() => {
        const data =
            messagesSent.data && onlineTime.data
                ? matchAndCalculateAllEntries(
                      messagesSent,
                      onlineTime,
                      calculateMessagesPerHour,
                      senderIdField,
                      userIdField,
                      messageCountField,
                      onlineTimeField
                  )
                : []

        return sortAllData(data, messageCountField, sorting)
    }, [
        messageCountField,
        onlineTimeField,
        senderIdField,
        userIdField,
        messagesSent,
        onlineTime,
        sorting,
    ])

    const maxValue = Math.max(
        ...sortedData.map((item) => Number(item[messageCountField]))
    )

    return {
        isFetching: messagesSent.isFetching || onlineTime.isFetching,
        isError: messagesSent.isError || onlineTime.isError,
        data: {
            allData: sortedData,
            value: metricValue,
            decile: calculateDecile(metricValue || 0, maxValue),
        },
    }
}
