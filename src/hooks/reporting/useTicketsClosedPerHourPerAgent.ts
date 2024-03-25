import {useFlags} from 'launchdarkly-react-client-sdk'
import {useMemo} from 'react'
import {TicketDimension, TicketMeasure} from 'models/reporting/cubes/TicketCube'
import {MetricWithDecile} from 'hooks/reporting/useMetricPerDimension'
import {
    calculateMetricPerHour,
    periodAndAgentOnlyFilters,
} from 'hooks/reporting/useMessagesSentPerHour'
import {FeatureFlagKey} from 'config/featureFlags'
import {
    useClosedTicketsMetricPerAgent,
    useOnlineTimePerAgent,
} from 'hooks/reporting/metricsPerDimension'
import {calculateDecile} from 'hooks/reporting/useCustomFieldsTicketCountPerCustomFields'
import {renameMemberEnriched} from 'hooks/reporting/useEnrichedCubes'
import {OrderDirection} from 'models/api/types'
import {
    AgentTimeTrackingDimension,
    AgentTimeTrackingMeasure,
} from 'models/reporting/cubes/agentxp/AgentTimeTrackingCube'
import {StatsFilters} from 'models/stat/types'
import {matchAndCalculateAllEntries, sortAllData} from 'utils/reporting'

export const useTicketsClosedPerHourPerAgent = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    agentAssigneeId?: string
): MetricWithDecile => {
    const isAnalyticsNewCubes: boolean | undefined =
        useFlags()[FeatureFlagKey.AnalyticsNewCubes]
    const assigneeUserId = isAnalyticsNewCubes
        ? renameMemberEnriched(TicketDimension.AssigneeUserId)
        : TicketDimension.AssigneeUserId
    const userIdField = isAnalyticsNewCubes
        ? renameMemberEnriched(AgentTimeTrackingDimension.UserId)
        : AgentTimeTrackingDimension.UserId
    const ticketCountField = isAnalyticsNewCubes
        ? renameMemberEnriched(TicketMeasure.TicketCount)
        : TicketMeasure.TicketCount
    const onlineTimeField = isAnalyticsNewCubes
        ? renameMemberEnriched(AgentTimeTrackingMeasure.OnlineTime)
        : AgentTimeTrackingMeasure.OnlineTime

    const closedTickets = useClosedTicketsMetricPerAgent(
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

    if (closedTickets.data?.value && onlineTime.data?.value) {
        metricValue = calculateMetricPerHour(
            closedTickets.data.value,
            onlineTime.data.value
        )
    }

    const sortedData = useMemo(() => {
        const data =
            closedTickets.data && onlineTime.data
                ? matchAndCalculateAllEntries(
                      closedTickets,
                      onlineTime,
                      calculateMetricPerHour,
                      assigneeUserId,
                      userIdField,
                      ticketCountField,
                      onlineTimeField
                  )
                : []

        return sortAllData(data, ticketCountField, sorting)
    }, [
        ticketCountField,
        onlineTimeField,
        assigneeUserId,
        userIdField,
        closedTickets,
        onlineTime,
        sorting,
    ])

    const maxValue = Math.max(
        ...sortedData.map((item) => Number(item[ticketCountField]))
    )

    return {
        isFetching: closedTickets.isFetching || onlineTime.isFetching,
        isError: closedTickets.isError || onlineTime.isError,
        data: {
            allData: sortedData,
            value: metricValue,
            decile: calculateDecile(metricValue || 0, maxValue),
        },
    }
}
