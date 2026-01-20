import { useMemo } from 'react'

import _takeWhile from 'lodash/takeWhile'

import type { User } from 'config/types/user'
import type { MetricWithDecile } from 'domains/reporting/hooks/types'
import type { formatMetricValue } from 'domains/reporting/pages/common/utils'
import { isMetricForAgent } from 'domains/reporting/pages/common/utils'
import { agentIdFields } from 'domains/reporting/pages/support-performance/agents/AgentsTableConfig'
import { getFilteredAgents } from 'domains/reporting/state/ui/stats/agentPerformanceSlice'
import useAppSelector from 'hooks/useAppSelector'
import { notUndefined } from 'utils/types'

interface GetShoutoutTopResultsArgs {
    filteredAgents: User[]
    queryResult: MetricWithDecile
    formatValue: typeof formatMetricValue
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
    agentIdFields,
}: GetShoutoutTopResultsArgs): GetShoutoutTopResultsReturnType {
    const allData = queryResult.data?.allData || []
    const filteredData = allData?.filter((metric) =>
        filteredAgents.find((agent) =>
            isMetricForAgent(metric, agent.id, agentIdFields),
        ),
    )

    const measure = queryResult.data?.measures?.[0]
    if (!measure) {
        return { agents: [], metricValue: null }
    }

    if (!filteredData.length) return { agents: [], metricValue: null }

    const firstMetric = filteredData[0]

    const sameValueMetrics = _takeWhile(
        filteredData,
        (metric) =>
            formatValue(Number(metric[measure])) ===
            formatValue(Number(firstMetric[measure])),
    )

    const agents = sameValueMetrics
        .map((metric) =>
            filteredAgents.find((agent) =>
                isMetricForAgent(metric, agent.id, agentIdFields),
            ),
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
) => {
    const filteredAgents = useAppSelector(getFilteredAgents)

    return useMemo(
        () =>
            getShoutoutTopResults({
                queryResult,
                formatValue,
                filteredAgents,
                agentIdFields,
            }),
        [queryResult, formatValue, filteredAgents],
    )
}
