import { useCallback } from 'react'

import type { CustomUserAvailabilityStatus } from '@gorgias/helpdesk-types'

import { useAgentAvailabilityTableConfigSetting } from 'domains/reporting/hooks/useAgentAvailabilityTableConfigSetting'
import { EditTableColumns } from 'domains/reporting/pages/common/components/Table/EditTableColumns'
import {
    AgentAvailabilityTableViews,
    getColumnConfig,
} from 'domains/reporting/pages/support-performance/agents/AgentAvailabilityTableConfig'
import {
    AgentsRowConfig,
    TableRowLabels,
} from 'domains/reporting/pages/support-performance/agents/AgentsTableConfig'
import { AGENT_AVAILABILITY_COLUMNS } from 'domains/reporting/pages/support-performance/agents/constants'
import type { AgentAvailabilityTableColumn } from 'domains/reporting/state/ui/stats/types'
import { AgentsTableRow } from 'domains/reporting/state/ui/stats/types'
import { getAgentAvailabilityTableConfigSettingsJS } from 'state/currentAccount/selectors'

type AgentAvailabilityEditColumnsProps = {
    canduId?: string
    customStatuses?: CustomUserAvailabilityStatus[]
}

export const AgentAvailabilityEditColumns = ({
    canduId,
    customStatuses,
}: AgentAvailabilityEditColumnsProps) => {
    const tableConfig = useAgentAvailabilityTableConfigSetting(customStatuses)
    const useTableSetting = useCallback(() => tableConfig, [tableConfig])

    const columnConfig = getColumnConfig(customStatuses)
    const tableLabels = Object.entries(columnConfig).reduce(
        (acc, [key, value]) => {
            acc[key as AgentAvailabilityTableColumn] = value.label
            return acc
        },
        {} as Record<AgentAvailabilityTableColumn, string>,
    )

    const tooltips = Object.entries(columnConfig).reduce(
        (acc, [key, value]) => {
            acc[key as AgentAvailabilityTableColumn] = value.hint
            return acc
        },
        {} as Record<AgentAvailabilityTableColumn, any>,
    )

    return (
        <EditTableColumns<AgentAvailabilityTableColumn, AgentsTableRow>
            settingsSelector={getAgentAvailabilityTableConfigSettingsJS}
            fallbackViews={AgentAvailabilityTableViews}
            tableLabels={tableLabels}
            rowLabels={TableRowLabels}
            tooltips={tooltips}
            rowTooltips={AgentsRowConfig}
            leadColumn={AGENT_AVAILABILITY_COLUMNS.AGENT_NAME_COLUMN}
            leadRow={AgentsTableRow.Total}
            useTableSetting={useTableSetting}
            canduId={canduId}
        />
    )
}
