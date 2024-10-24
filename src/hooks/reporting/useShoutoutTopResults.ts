import _takeWhile from 'lodash/takeWhile'
import {useMemo} from 'react'

import {User} from 'config/types/user'
import {MetricWithDecile} from 'hooks/reporting/useMetricPerDimension'
import useAppSelector from 'hooks/useAppSelector'
import {HelpdeskMessageCubeWithJoins} from 'models/reporting/cubes/HelpdeskMessageCube'
import {formatMetricValue, isMetricForAgent} from 'pages/stats/common/utils'
import {agentIdFields} from 'pages/stats/support-performance/agents/AgentsTableConfig'
import {getFilteredAgents} from 'state/ui/stats/agentPerformanceSlice'
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

    return useMemo(
        () =>
            getShoutoutTopResults({
                queryResult,
                formatValue,
                measure,
                filteredAgents,
                agentIdFields,
            }),
        [queryResult, formatValue, measure, filteredAgents]
    )
}
