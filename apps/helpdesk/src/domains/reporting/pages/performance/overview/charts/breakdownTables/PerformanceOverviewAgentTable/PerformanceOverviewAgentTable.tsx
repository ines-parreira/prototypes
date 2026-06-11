import { useMemo } from 'react'

import type { NameColumnConfig } from '@repo/reporting'
import { ReportingMetricBreakdownTable } from '@repo/reporting'

import { useCustomDashboardTableColumns } from 'domains/reporting/hooks/dashboards/useCustomDashboardTableColumns'
import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type {
    DashboardChartSchema,
    DashboardSchema,
} from 'domains/reporting/pages/dashboards/types'
import { PERFORMANCE_OVERVIEW_AGENT_COLUMNS } from 'domains/reporting/pages/performance/overview/charts/breakdownTables/PerformanceOverviewAgentTable/columns'
import { useDownloadPerformanceOverviewAgentData } from 'domains/reporting/pages/performance/overview/hooks/agentBreakdown/useDownloadPerformanceOverviewAgentData'
import { usePerformanceOverviewAgentMetrics } from 'domains/reporting/pages/performance/overview/hooks/agentBreakdown/usePerformanceOverviewAgentMetrics'
import { humanizeAgent } from 'domains/reporting/pages/performance/utils/humanizeAgent'
import { getFilteredAgents } from 'domains/reporting/state/ui/stats/agentPerformanceSlice'
import { useAppSelector } from 'hooks/useAppSelector'
import {
    DownloadTableButton,
    useDownloadTableAction,
} from 'pages/aiAgent/analyticsOverview/components/shared/DownloadTableButton'

const SEGMENT_EVENT_NAME = 'performance-overview_agent-breakdown-table' as const

type Props = {
    chartId?: string
    withChartMenu?: boolean
    dashboard?: DashboardSchema
    chartConfig?: { label: string }
    customDashboardChartSchema?: DashboardChartSchema
}

export const PerformanceOverviewAgentTable = ({
    chartId,
    withChartMenu,
    dashboard,
    chartConfig,
    customDashboardChartSchema,
}: Props) => {
    const { data, loadingStates } = usePerformanceOverviewAgentMetrics()
    const agents = useAppSelector(getFilteredAgents)
    const downloadData = useDownloadPerformanceOverviewAgentData()
    const exportCsvAction = useDownloadTableAction({
        ...downloadData,
        segmentEventName: SEGMENT_EVENT_NAME,
    })
    const withMenu = withChartMenu && chartId
    const { onSaveColumns } = useCustomDashboardTableColumns({
        customDashboardChartSchema,
        dashboard,
    })

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
            DownloadButton={
                !withMenu ? (
                    <DownloadTableButton
                        {...downloadData}
                        segmentEventName={SEGMENT_EVENT_NAME}
                    />
                ) : undefined
            }
            nameColumns={nameColumns}
            actionMenu={
                withMenu ? (
                    <ChartsActionMenu
                        chartId={chartId}
                        chartName="Agent"
                        dashboard={dashboard}
                        exportCsvAction={exportCsvAction}
                    />
                ) : undefined
            }
            chartId={chartId}
            enableSearch
            name={chartConfig?.label}
            customDashboardChartSchema={customDashboardChartSchema}
            onSaveColumns={onSaveColumns}
        />
    )
}
