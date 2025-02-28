import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { useTableConfigSetting } from 'hooks/reporting/useTableConfigSetting'
import {
    agentPerformanceTableActiveView,
    agentPerformanceTableActiveViewWithTotal,
    TableColumnsOrder,
    TableColumnsOrderWithZeroTouchTickets,
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

    return useTableConfigSetting<AgentsTableColumn, AgentsTableRow>(
        getAgentsTableConfigSettingsJS,
        isReportingAgentsTableAverageAndTotalEnabled
            ? agentPerformanceTableActiveViewWithTotal
            : agentPerformanceTableActiveView,
        isReportingZeroTouchTicketsMetricEnabled
            ? TableColumnsOrderWithZeroTouchTickets
            : TableColumnsOrder,
        isReportingAgentsTableAverageAndTotalEnabled
            ? TableRowsOrderWithTotal
            : TableRowsOrder,
        submitAgentTableConfigView,
    )
}
