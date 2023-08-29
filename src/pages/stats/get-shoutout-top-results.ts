import _takeWhile from 'lodash/takeWhile'
import {User} from 'config/types/user'
import {MetricWithDecile} from 'hooks/reporting/useMetricPerDimension'
import {notUndefined} from 'utils/types'
import {isMetricForAgent} from './common/utils'
import {ShoutoutConfig} from './shoutouts-config'

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
