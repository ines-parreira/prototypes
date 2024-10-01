import React from 'react'

import {useNewStatsFilters} from 'hooks/reporting/support-performance/useNewStatsFilters'
import {useShoutoutTopResults} from 'hooks/reporting/useShoutoutTopResults'
import Shoutout, {
    SHOUTOUT_HEIGHT_PX,
} from 'pages/common/components/Shoutout/Shoutout'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import {ShoutoutConfig} from 'pages/stats/support-performance/agents/AgentsShoutoutsConfig'

export default function AgentsShoutout({
    useQuery,
    queryOrder,
    metricName,
    measure,
    formatValue,
}: ShoutoutConfig) {
    const {cleanStatsFilters, userTimezone} = useNewStatsFilters()
    const queryResult = useQuery(cleanStatsFilters, userTimezone, queryOrder)

    const data = useShoutoutTopResults(queryResult, formatValue, measure)

    if (queryResult.isFetching) return <Skeleton height={SHOUTOUT_HEIGHT_PX} />

    return (
        <Shoutout
            persons={data.agents.map((agent) => ({
                name: agent.name,
                image: agent.meta?.profile_picture_url,
            }))}
            multiplePersonsLabel={(count) => `${count} agents`}
            metricName={metricName}
            value={data.metricValue}
        />
    )
}
