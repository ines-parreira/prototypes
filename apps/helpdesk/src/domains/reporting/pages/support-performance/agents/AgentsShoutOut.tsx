import { Skeleton } from '@gorgias/axiom'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useShoutoutTopResults } from 'domains/reporting/hooks/useShoutoutTopResults'
import Shoutout, {
    SHOUTOUT_HEIGHT_PX,
} from 'domains/reporting/pages/common/components/Shoutout/Shoutout'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import type { ShoutoutConfig } from 'domains/reporting/pages/support-performance/agents/AgentsShoutOutsConfig'

export default function AgentsShoutOut({
    useQuery,
    queryOrder,
    metricName,
    formatValue,
    chartId,
    dashboard,
}: ShoutoutConfig & DashboardChartProps) {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()
    const queryResult = useQuery(cleanStatsFilters, userTimezone, queryOrder)

    const data = useShoutoutTopResults(queryResult, formatValue)

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
