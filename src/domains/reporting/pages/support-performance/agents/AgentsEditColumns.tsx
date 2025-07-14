import { useAgentsTableConfigSetting } from 'domains/reporting/hooks/useAgentsTableConfigSetting'
import { EditTableColumns } from 'domains/reporting/pages/common/components/Table/EditTableColumns'
import {
    AgentsColumnConfig,
    AgentsRowConfig,
    AgentsTableViews,
    TableLabels,
    TableRowLabels,
} from 'domains/reporting/pages/support-performance/agents/AgentsTableConfig'
import {
    AgentsTableColumn,
    AgentsTableRow,
} from 'domains/reporting/state/ui/stats/types'
import { getAgentsTableConfigSettingsJS } from 'state/currentAccount/selectors'

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
