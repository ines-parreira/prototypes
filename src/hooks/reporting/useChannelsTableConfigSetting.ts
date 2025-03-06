import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { useTableConfigSetting } from 'hooks/reporting/useTableConfigSetting'
import {
    channelsReportTableActiveView,
    columnsOrder,
    columnsOrderWithMessagesReceived,
} from 'pages/stats/support-performance/channels/ChannelsTableConfig'
import { submitChannelsTableConfigView } from 'state/currentAccount/actions'
import { getChannelsTableConfigSettingsJS } from 'state/currentAccount/selectors'
import { ChannelsTableColumns } from 'state/ui/stats/types'

export const useChannelsTableSetting = () => {
    const isReportingMessagesReceivedMetricEnabled = useFlag(
        FeatureFlagKey.ReportingMessagesReceivedMetric,
    )

    return useTableConfigSetting<ChannelsTableColumns, never>(
        getChannelsTableConfigSettingsJS,
        channelsReportTableActiveView,
        isReportingMessagesReceivedMetricEnabled
            ? columnsOrderWithMessagesReceived
            : columnsOrder,
        [],
        submitChannelsTableConfigView,
    )
}
