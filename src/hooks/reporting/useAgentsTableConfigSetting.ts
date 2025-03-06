import { useMemo } from 'react'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { useTableConfigSetting } from 'hooks/reporting/useTableConfigSetting'
import {
    agentPerformanceTableActiveView,
    agentPerformanceTableActiveViewWithTotal,
    TableColumnsOrder,
    TableRowsOrder,
    TableRowsOrderWithTotal,
} from 'pages/stats/support-performance/agents/AgentsTableConfig'
import { submitAgentTableConfigView } from 'state/currentAccount/actions'
import { getAgentsTableConfigSettingsJS } from 'state/currentAccount/selectors'
import { AgentsTableColumn, AgentsTableRow } from 'state/ui/stats/types'

export const useAgentsTableConfigSetting = () => {
    const isReportingAgentsTableAverageAndTotalEnabled = useFlag(
        FeatureFlagKey.ReportingAgentsTableAverageAndTotal,
    )
    const isReportingZeroTouchTicketsMetricEnabled = useFlag(
        FeatureFlagKey.ReportingZeroTouchTicketsMetric,
    )
    const isReportingMessagesReceivedMetricEnabled = useFlag(
        FeatureFlagKey.ReportingMessagesReceivedMetric,
    )

    const columnsOrder = useMemo(
        () => [
            ...TableColumnsOrder,
            ...(isReportingZeroTouchTicketsMetricEnabled
                ? [AgentsTableColumn.ZeroTouchTickets]
                : []),
            ...(isReportingMessagesReceivedMetricEnabled
                ? [AgentsTableColumn.MessagesReceived]
                : []),
        ],
        [
            isReportingZeroTouchTicketsMetricEnabled,
            isReportingMessagesReceivedMetricEnabled,
        ],
    )

    return useTableConfigSetting<AgentsTableColumn, AgentsTableRow>(
        getAgentsTableConfigSettingsJS,
        isReportingAgentsTableAverageAndTotalEnabled
            ? agentPerformanceTableActiveViewWithTotal
            : agentPerformanceTableActiveView,
        columnsOrder,
        isReportingAgentsTableAverageAndTotalEnabled
            ? TableRowsOrderWithTotal
            : TableRowsOrder,
        submitAgentTableConfigView,
    )
}
