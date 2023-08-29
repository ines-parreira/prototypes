import React from 'react'
import {ShoutoutConfig} from 'pages/stats/shoutouts-config'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/agentPerformanceSlice'

import useAppSelector from 'hooks/useAppSelector'
import Shoutout, {
    SHOUTOUT_HEIGHT_PX,
} from 'pages/common/components/Shoutout/Shoutout'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'

import {useShoutoutTopResults} from './useShoutoutTopResults'

export default function AgentsShoutout(props: ShoutoutConfig) {
    const {useQuery, queryOrder} = props
    const {cleanStatsFilters, userTimezone} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )
    const queryResult = useQuery(cleanStatsFilters, userTimezone, queryOrder)

    const data = useShoutoutTopResults(queryResult, props)

    if (queryResult.isFetching) return <Skeleton height={SHOUTOUT_HEIGHT_PX} />

    return (
        <Shoutout
            testId={`shoutout-for-${props.measure}`}
            persons={data.agents.map((agent) => ({
                name: agent.name,
                image: agent.meta?.profile_picture_url,
            }))}
            multiplePersonsLabel={(count) => `${count} agents`}
            metricName={props.metricName}
            value={data.metricValue}
        />
    )
}
