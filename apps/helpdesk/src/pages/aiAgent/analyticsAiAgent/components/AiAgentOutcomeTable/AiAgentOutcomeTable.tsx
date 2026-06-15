import { ReportingMetricBreakdownTable } from '@repo/reporting'

import { useCustomDashboardTableColumns } from 'domains/reporting/hooks/dashboards/useCustomDashboardTableColumns'
import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type {
    DashboardChartSchema,
    DashboardSchema,
} from 'domains/reporting/pages/dashboards/types'
import {
    AI_AGENT_OUTCOME_COLUMNS,
    AI_AGENT_OUTCOME_NAME_COLUMNS,
} from 'pages/aiAgent/analyticsAiAgent/components/AiAgentOutcomeTable/columns'
import { AI_AGENT_OUTCOME_TABLE } from 'pages/aiAgent/analyticsAiAgent/components/AiAgentOutcomeTable/constants'
import {
    DownloadAiAgentOutcomeButton,
    useDownloadAiAgentOutcomeAction,
} from 'pages/aiAgent/analyticsAiAgent/components/AiAgentOutcomeTable/DownloadAiAgentOutcomeButton'
import { useAiAgentOutcomeMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentOutcomeMetrics'

type Props = {
    chartId?: string
    withChartMenu?: boolean
    dashboard?: DashboardSchema
    chartConfig?: { label: string }
    customDashboardChartSchema?: DashboardChartSchema
}

export const AiAgentOutcomeTable = ({
    chartId,
    withChartMenu,
    dashboard,
    chartConfig,
    customDashboardChartSchema,
}: Props) => {
    const { data, loadingStates } = useAiAgentOutcomeMetrics()
    const exportCsvAction = useDownloadAiAgentOutcomeAction()
    const withMenu = withChartMenu && chartId
    const { onSaveColumns } = useCustomDashboardTableColumns({
        customDashboardChartSchema,
        dashboard,
    })

    return (
        <ReportingMetricBreakdownTable
            data={data}
            metricColumns={AI_AGENT_OUTCOME_COLUMNS}
            loadingStates={loadingStates}
            DownloadButton={
                !withMenu ? <DownloadAiAgentOutcomeButton /> : undefined
            }
            nameColumns={AI_AGENT_OUTCOME_NAME_COLUMNS}
            actionMenu={
                withMenu ? (
                    <ChartsActionMenu
                        chartId={chartId}
                        chartName={AI_AGENT_OUTCOME_TABLE.title}
                        dashboard={dashboard}
                        exportCsvAction={exportCsvAction}
                    />
                ) : undefined
            }
            chartId={chartId}
            name={chartConfig?.label}
            customDashboardChartSchema={customDashboardChartSchema}
            onSaveColumns={onSaveColumns}
        />
    )
}
