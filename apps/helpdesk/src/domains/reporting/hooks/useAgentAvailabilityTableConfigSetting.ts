import { useMemo } from 'react'

import type { CustomUserAvailabilityStatus } from '@gorgias/helpdesk-types'

import { useTableConfigSetting } from 'domains/reporting/hooks/useTableConfigSetting'
import { getAvailabilityTableColumnsOrder } from 'domains/reporting/pages/support-performance/agents/AgentAvailabilityTableConfig'
import { TableRowsOrderWithTotal } from 'domains/reporting/pages/support-performance/agents/AgentsTableConfig'
import type {
    AgentAvailabilityTableColumn,
    AgentsTableRow,
} from 'domains/reporting/state/ui/stats/types'
import { submitAgentAvailabilityTableConfigView } from 'state/currentAccount/actions'
import { getAgentAvailabilityTableConfigSettingsJS } from 'state/currentAccount/selectors'

const AGENT_AVAILABILITY_TABLE_VIEW_ID = 'default-view'
const AGENT_AVAILABILITY_TABLE_VIEW_NAME = 'Default View'

export const useAgentAvailabilityTableConfigSetting = (
    customStatuses: CustomUserAvailabilityStatus[] | undefined,
) => {
    const availabilityColumns = useMemo(
        () => getAvailabilityTableColumnsOrder(customStatuses),
        [customStatuses],
    )

    const fallbackView = useMemo(
        () => ({
            id: AGENT_AVAILABILITY_TABLE_VIEW_ID,
            name: AGENT_AVAILABILITY_TABLE_VIEW_NAME,
            metrics: availabilityColumns.map((column) => ({
                id: column,
                visibility: true,
            })),
            rows: TableRowsOrderWithTotal.map((row) => ({
                id: row,
                visibility: true,
            })),
        }),
        [availabilityColumns],
    )

    return useTableConfigSetting<AgentAvailabilityTableColumn, AgentsTableRow>(
        getAgentAvailabilityTableConfigSettingsJS,
        fallbackView,
        availabilityColumns,
        TableRowsOrderWithTotal,
        submitAgentAvailabilityTableConfigView,
    )
}
