import { useTableConfigSetting } from 'hooks/reporting/useTableConfigSetting'
import {
    channelsReportTableActiveView,
    columnsOrder,
} from 'pages/stats/support-performance/channels/ChannelsTableConfig'
import { submitChannelsTableConfigView } from 'state/currentAccount/actions'
import { getChannelsTableConfigSettingsJS } from 'state/currentAccount/selectors'
import { ChannelsTableColumns } from 'state/ui/stats/types'

export const useChannelsTableSetting = () =>
    useTableConfigSetting<ChannelsTableColumns>(
        getChannelsTableConfigSettingsJS,
        channelsReportTableActiveView,
        columnsOrder,
        submitChannelsTableConfigView,
    )
