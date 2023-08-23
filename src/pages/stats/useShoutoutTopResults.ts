import {useMemo} from 'react'
import {Metric} from 'hooks/reporting/useMetricPerDimension'
import useAppSelector from 'hooks/useAppSelector'
import {getFilteredAgents} from 'state/ui/stats/agentPerformanceSlice'
import {ShoutoutConfig} from './shoutouts-config'
import {getShoutoutTopResults} from './get-shoutout-top-results'

export const useShoutoutTopResults = (
    queryResult: Metric,
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
