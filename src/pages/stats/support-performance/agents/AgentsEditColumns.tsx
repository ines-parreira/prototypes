import React from 'react'
import {EditTableColumns} from 'pages/stats/common/components/Table/EditTableColumns'
import {getAgentsTableConfigSettingsJS} from 'state/currentAccount/selectors'

import {useAgentTableSetting} from 'hooks/reporting/useAgentsTableConfigSetting'
import {AgentsTableColumn} from 'state/ui/stats/types'
import {
    AgentsColumnConfig,
    AgentsTableViews,
    TableLabels,
} from 'pages/stats/support-performance/agents/AgentsTableConfig'

export const AgentsEditColumns = () => {
    return (
        <EditTableColumns
            settingsSelector={getAgentsTableConfigSettingsJS}
            fallbackViews={AgentsTableViews}
            tableLabels={TableLabels}
            tooltips={AgentsColumnConfig}
            leadColumn={AgentsTableColumn.AgentName}
            useTableSetting={useAgentTableSetting}
        />
    )
}
