import { useMemo } from 'react'

import type { NameColumnConfig } from '@repo/reporting'
import { ReportingMetricBreakdownTable } from '@repo/reporting'

import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import { PERFORMANCE_OVERVIEW_AGENT_COLUMNS } from 'domains/reporting/pages/performance/overview/charts/breakdownTables/PerformanceOverviewAgentTable/columns'
import { DownloadPerformanceOverviewAgentButton } from 'domains/reporting/pages/performance/overview/charts/breakdownTables/PerformanceOverviewAgentTable/DownloadPerformanceOverviewAgentButton'
import { usePerformanceOverviewAgentMetrics } from 'domains/reporting/pages/performance/overview/hooks/agentBreakdown/usePerformanceOverviewAgentMetrics'
import { humanizeAgent } from 'domains/reporting/pages/performance/utils/humanizeAgent'
import { getFilteredAgents } from 'domains/reporting/state/ui/stats/agentPerformanceSlice'
import useAppSelector from 'hooks/useAppSelector'

type Props = {
    chartId?: string
    withChartMenu?: boolean
}

export const PerformanceOverviewAgentTable = ({
    chartId,
    withChartMenu,
}: Props) => {
    const { data, loadingStates } = usePerformanceOverviewAgentMetrics()
    const agents = useAppSelector(getFilteredAgents)

    const nameColumns = useMemo<NameColumnConfig[]>(
        () => [
            {
                accessor: 'entity',
                label: 'Agent',
                formatName: (entity: string) => humanizeAgent(agents, entity),
                getAvatarProps: (entity: string) => {
                    const agent = agents.find((a) => a.id === Number(entity))
                    return {
                        name: agent?.name ?? entity,
                        url: agent?.meta?.profile_picture_url ?? undefined,
                    }
                },
            },
        ],
        [agents],
    )

    return (
        <ReportingMetricBreakdownTable
            data={data}
            metricColumns={PERFORMANCE_OVERVIEW_AGENT_COLUMNS}
            loadingStates={loadingStates}
            DownloadButton={<DownloadPerformanceOverviewAgentButton />}
            nameColumns={nameColumns}
            actionMenu={
                withChartMenu && chartId ? (
                    <ChartsActionMenu chartId={chartId} chartName="Agent" />
                ) : undefined
            }
            chartId={chartId}
            enableSearch
        />
    )
}
