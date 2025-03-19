import { useAgentsTableConfigSetting } from 'hooks/reporting/useAgentsTableConfigSetting'
import { EditTableColumns } from 'pages/stats/common/components/Table/EditTableColumns'
import {
    AgentsColumnConfig,
    AgentsRowConfig,
    AgentsTableViews,
    TableLabels,
    TableRowLabels,
} from 'pages/stats/support-performance/agents/AgentsTableConfig'
import { getAgentsTableConfigSettingsJS } from 'state/currentAccount/selectors'
import { AgentsTableColumn, AgentsTableRow } from 'state/ui/stats/types'

export const AgentsEditColumns = ({ canduId }: { canduId?: string }) => {
    return (
        <EditTableColumns<AgentsTableColumn, AgentsTableRow>
            settingsSelector={getAgentsTableConfigSettingsJS}
            fallbackViews={AgentsTableViews}
            tableLabels={TableLabels}
            rowLabels={TableRowLabels}
            tooltips={AgentsColumnConfig}
            rowTooltips={AgentsRowConfig}
            leadColumn={AgentsTableColumn.AgentName}
            leadRow={AgentsTableRow.Total}
            useTableSetting={useAgentsTableConfigSetting}
            canduId={canduId}
        />
    )
}
