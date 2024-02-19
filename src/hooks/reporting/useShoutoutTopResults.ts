import {useFlags} from 'launchdarkly-react-client-sdk'
import _takeWhile from 'lodash/takeWhile'
import {useMemo} from 'react'
import {renameMemberEnriched} from 'hooks/reporting/useEnrichedCubes'
import {AgentTimeTrackingMember} from 'models/reporting/cubes/agentxp/AgentTimeTrackingCube'
import {TicketMember} from 'models/reporting/cubes/TicketCube'
import {TicketMessagesMember} from 'models/reporting/cubes/TicketMessagesCube'
import {
    HelpdeskMessageCubeWithJoins,
    HelpdeskMessageMember,
} from 'models/reporting/cubes/HelpdeskMessageCube'
import {FeatureFlagKey} from 'config/featureFlags'
import {User} from 'config/types/user'
import {MetricWithDecile} from 'hooks/reporting/useMetricPerDimension'
import useAppSelector from 'hooks/useAppSelector'
import {formatMetricValue, isMetricForAgent} from 'pages/stats/common/utils'
import {getFilteredAgents} from 'state/ui/stats/agentPerformanceSlice'
import {renameMember} from 'utils/reporting'
import {notUndefined} from 'utils/types'

interface GetShoutoutTopResultsArgs {
    filteredAgents: User[]
    queryResult: MetricWithDecile
    formatValue: typeof formatMetricValue
    measure: HelpdeskMessageCubeWithJoins['measures']
    agentIdFields: string[]
}

type GetShoutoutTopResultsReturnType = {
    agents: User[]
    metricValue: string | null
}

export function getShoutoutTopResults({
    filteredAgents,
    queryResult,
    formatValue,
    measure,
    agentIdFields,
}: GetShoutoutTopResultsArgs): GetShoutoutTopResultsReturnType {
    const allData = queryResult.data?.allData || []
    const filteredData = allData?.filter((metric) =>
        filteredAgents.find((agent) =>
            isMetricForAgent(metric, agent.id, agentIdFields)
        )
    )

    if (!filteredData.length) return {agents: [], metricValue: null}

    const firstMetric = filteredData[0]

    const sameValueMetrics = _takeWhile(
        filteredData,
        (metric) =>
            formatValue(Number(metric[measure])) ===
            formatValue(Number(firstMetric[measure]))
    )

    const agents = sameValueMetrics
        .map((metric) =>
            filteredAgents.find((agent) =>
                isMetricForAgent(metric, agent.id, agentIdFields)
            )
        )
        .filter(notUndefined)

    return {
        agents,
        metricValue: formatValue(Number(firstMetric[measure])),
    }
}

export const useShoutoutTopResults = (
    queryResult: MetricWithDecile,
    formatValue: typeof formatMetricValue,
    measure: HelpdeskMessageCubeWithJoins['measures']
) => {
    const filteredAgents = useAppSelector(getFilteredAgents)
    const isAnalyticsNewCubes: boolean | undefined =
        useFlags()[FeatureFlagKey.AnalyticsNewCubes]
    const currentMeasure = isAnalyticsNewCubes
        ? renameMember<typeof measure>(
              measure,
              'HelpdeskMessage',
              'HelpdeskMessageEnriched'
          )
        : measure

    const agentIdFields = [
        TicketMember.AssigneeUserId,
        TicketMessagesMember.FirstHelpdeskMessageUserId,
        HelpdeskMessageMember.SenderId,
        AgentTimeTrackingMember.UserId,
    ]
    const currentAgentIdFields: typeof agentIdFields = isAnalyticsNewCubes
        ? agentIdFields.map((field) => renameMemberEnriched(field))
        : agentIdFields

    return useMemo(
        () =>
            getShoutoutTopResults({
                queryResult,
                formatValue,
                measure: currentMeasure,
                filteredAgents,
                agentIdFields: currentAgentIdFields,
            }),
        [
            queryResult,
            formatValue,
            currentMeasure,
            filteredAgents,
            currentAgentIdFields,
        ]
    )
}
