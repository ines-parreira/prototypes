import React from 'react'
import {ShoutoutConfig} from 'pages/stats/AgentsShoutoutsConfig'

import useAppSelector from 'hooks/useAppSelector'
import Shoutout, {
    SHOUTOUT_HEIGHT_PX,
} from 'pages/common/components/Shoutout/Shoutout'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'

import {useShoutoutTopResults} from 'hooks/reporting/useShoutoutTopResults'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/selectors'

export default function AgentsShoutout({
    useQuery,
    queryOrder,
    metricName,
    measure,
    formatValue,
}: ShoutoutConfig) {
    const {cleanStatsFilters, userTimezone} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )
    const queryResult = useQuery(cleanStatsFilters, userTimezone, queryOrder)

    const data = useShoutoutTopResults(queryResult, formatValue, measure)

    if (queryResult.isFetching) return <Skeleton height={SHOUTOUT_HEIGHT_PX} />

    return (
        <Shoutout
            testId={`shoutout-for-${measure}`}
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
