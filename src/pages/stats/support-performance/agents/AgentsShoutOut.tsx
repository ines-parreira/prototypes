import React from 'react'

import { Skeleton } from '@gorgias/merchant-ui-kit'

import { useNewStatsFilters } from 'hooks/reporting/support-performance/useNewStatsFilters'
import { useShoutoutTopResults } from 'hooks/reporting/useShoutoutTopResults'
import Shoutout, {
    SHOUTOUT_HEIGHT_PX,
} from 'pages/stats/common/components/Shoutout/Shoutout'
import { DashboardChartProps } from 'pages/stats/dashboards/types'
import { ShoutoutConfig } from 'pages/stats/support-performance/agents/AgentsShoutOutsConfig'

export default function AgentsShoutOut({
    useQuery,
    queryOrder,
    metricName,
    measure,
    formatValue,
    chartId,
    dashboard,
}: ShoutoutConfig & DashboardChartProps) {
    const { cleanStatsFilters, userTimezone } = useNewStatsFilters()
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
            dashboard={dashboard}
            chartId={chartId}
        />
    )
}
