import { useTableConfigSetting } from 'domains/reporting/hooks/useTableConfigSetting'
import {
    channelsReportTableActiveView,
    columnsOrder,
} from 'domains/reporting/pages/support-performance/channels/ChannelsTableConfig'
import { ChannelsTableColumns } from 'domains/reporting/state/ui/stats/types'
import { submitChannelsTableConfigView } from 'state/currentAccount/actions'
import { getChannelsTableConfigSettingsJS } from 'state/currentAccount/selectors'

export const useChannelsTableSetting = () => {
    return useTableConfigSetting<ChannelsTableColumns, never>(
        getChannelsTableConfigSettingsJS,
        channelsReportTableActiveView,
        columnsOrder,
        [],
        submitChannelsTableConfigView,
    )
}
