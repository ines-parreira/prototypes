import { useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { useIsHrtAiEnabled } from 'domains/reporting/hooks/useIsHrtAiEnabled'
import { useTableConfigSetting } from 'domains/reporting/hooks/useTableConfigSetting'
import {
    agentPerformanceTableActiveView,
    TableColumnsOrder,
    tableColumnsOrderWithoutHrtAi,
    TableRowsOrder,
    TableRowsOrderWithTotal,
} from 'domains/reporting/pages/support-performance/agents/AgentsTableConfig'
import type {
    AgentsTableColumn,
    AgentsTableRow,
} from 'domains/reporting/state/ui/stats/types'
import { submitAgentTableConfigView } from 'state/currentAccount/actions'
import { getAgentsTableConfigSettingsJS } from 'state/currentAccount/selectors'

export const useAgentsTableConfigSetting = () => {
    const isReportingAgentsTableAverageAndTotalEnabled = useFlag(
        FeatureFlagKey.ReportingAgentsTableAverageAndTotal,
    )

    const isHrtAiEnabled = useIsHrtAiEnabled()

    const agentColumns = isHrtAiEnabled
        ? TableColumnsOrder
        : tableColumnsOrderWithoutHrtAi

    const fallbackView = useMemo(
        () => ({
            ...agentPerformanceTableActiveView,
            metrics: agentColumns.map((column) => ({
                id: column,
                visibility: true,
            })),
        }),
        [agentColumns],
    )

    return useTableConfigSetting<AgentsTableColumn, AgentsTableRow>(
        getAgentsTableConfigSettingsJS,
        fallbackView,
        agentColumns,
        isReportingAgentsTableAverageAndTotalEnabled
            ? TableRowsOrderWithTotal
            : TableRowsOrder,
        submitAgentTableConfigView,
    )
}
