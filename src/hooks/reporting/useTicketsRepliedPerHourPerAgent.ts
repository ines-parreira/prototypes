import {useFlags} from 'launchdarkly-react-client-sdk'
import {useMemo} from 'react'
import {HelpdeskMessageDimension} from 'models/reporting/cubes/HelpdeskMessageCube'
import {TicketMeasure} from 'models/reporting/cubes/TicketCube'
import {MetricWithDecile} from 'hooks/reporting/useMetricPerDimension'
import {
    calculateMessagesPerHour,
    periodAndAgentOnlyFilters,
} from 'hooks/reporting/useMessagesSentPerHour'
import {FeatureFlagKey} from 'config/featureFlags'
import {
    useOnlineTimePerAgent,
    useTicketsRepliedMetricPerAgent,
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
import {StatsFilters} from 'models/stat/types'

export const useTicketsRepliedPerHourPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string
): MetricWithDecile => {
    const isAnalyticsNewCubes: boolean | undefined =
        useFlags()[FeatureFlagKey.AnalyticsNewCubes]
    const senderId = isAnalyticsNewCubes
        ? renameMemberEnriched(HelpdeskMessageDimension.SenderId)
        : HelpdeskMessageDimension.SenderId
    const userIdField = isAnalyticsNewCubes
        ? renameMemberEnriched(AgentTimeTrackingDimension.UserId)
        : AgentTimeTrackingDimension.UserId
    const ticketCountField = isAnalyticsNewCubes
        ? renameMemberEnriched(TicketMeasure.TicketCount)
        : TicketMeasure.TicketCount
    const onlineTimeField = isAnalyticsNewCubes
        ? renameMemberEnriched(AgentTimeTrackingMeasure.OnlineTime)
        : AgentTimeTrackingMeasure.OnlineTime

    const repliedTickets = useTicketsRepliedMetricPerAgent(
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

    if (repliedTickets.data?.value && onlineTime.data?.value) {
        metricValue = calculateMessagesPerHour(
            repliedTickets.data.value,
            onlineTime.data.value
        )
    }

    const sortedData = useMemo(() => {
        const data =
            repliedTickets.data && onlineTime.data
                ? matchAndCalculateAllEntries(
                      repliedTickets,
                      onlineTime,
                      calculateMessagesPerHour,
                      senderId,
                      userIdField,
                      ticketCountField,
                      onlineTimeField
                  )
                : []

        return sortAllData(data, ticketCountField, sorting)
    }, [
        ticketCountField,
        onlineTimeField,
        senderId,
        userIdField,
        repliedTickets,
        onlineTime,
        sorting,
    ])

    const maxValue = Math.max(
        ...sortedData.map((item) => Number(item[ticketCountField]))
    )

    return {
        isFetching: repliedTickets.isFetching || onlineTime.isFetching,
        isError: repliedTickets.isError || onlineTime.isError,
        data: {
            allData: sortedData,
            value: metricValue,
            decile: calculateDecile(metricValue || 0, maxValue),
        },
    }
}
