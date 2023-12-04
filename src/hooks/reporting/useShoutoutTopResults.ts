import _takeWhile from 'lodash/takeWhile'
import {useMemo} from 'react'
import {User} from 'config/types/user'
import {MetricWithDecile} from 'hooks/reporting/useMetricPerDimension'
import useAppSelector from 'hooks/useAppSelector'
import {isMetricForAgent} from 'pages/stats/common/utils'
import {ShoutoutConfig} from 'pages/stats/AgentsShoutoutsConfig'
import {getFilteredAgents} from 'state/ui/stats/agentPerformanceSlice'
import {notUndefined} from 'utils/types'

interface GetShoutoutTopResultsArgs {
    filteredAgents: User[]
    queryResult: MetricWithDecile
    config: ShoutoutConfig
}

type GetShoutoutTopResultsReturnType = {
    agents: User[]
    metricValue: string | null
}

export function getShoutoutTopResults({
    filteredAgents,
    queryResult,
    config,
}: GetShoutoutTopResultsArgs): GetShoutoutTopResultsReturnType {
    const allData = queryResult.data?.allData || []
    const filteredData = allData?.filter((metric) =>
        filteredAgents.find((agent) => isMetricForAgent(metric, agent.id))
    )

    if (!filteredData.length) return {agents: [], metricValue: null}

    const firstMetric = filteredData[0]

    const sameValueMetrics = _takeWhile(
        filteredData,
        (metric) =>
            config.formatValue(Number(metric[config.measure])) ===
            config.formatValue(Number(firstMetric[config.measure]))
    )

    const agents = sameValueMetrics
        .map((metric) =>
            filteredAgents.find((agent) => isMetricForAgent(metric, agent.id))
        )
        .filter(notUndefined)

    return {
        agents,
        metricValue: config.formatValue(Number(firstMetric[config.measure])),
    }
}

export const useShoutoutTopResults = (
    queryResult: MetricWithDecile,
    config: ShoutoutConfig
) => {
    const filteredAgents = useAppSelector(getFilteredAgents)

    return useMemo(
        () =>
            getShoutoutTopResults({
                queryResult,
                config,
                filteredAgents,
            }),
        [queryResult, config, filteredAgents]
    )
}
