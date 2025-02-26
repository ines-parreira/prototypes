import React from 'react'

import { useAgentTableSetting } from 'hooks/reporting/useAgentsTableConfigSetting'
import { EditTableColumns } from 'pages/stats/common/components/Table/EditTableColumns'
import {
    AgentsColumnConfig,
    AgentsTableViews,
    TableLabels,
} from 'pages/stats/support-performance/agents/AgentsTableConfig'
import { getAgentsTableConfigSettingsJS } from 'state/currentAccount/selectors'
import { AgentsTableColumn } from 'state/ui/stats/types'

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
