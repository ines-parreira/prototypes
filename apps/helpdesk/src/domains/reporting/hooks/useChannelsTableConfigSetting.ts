import { useIsHrtAiEnabled } from 'domains/reporting/hooks/useIsHrtAiEnabled'
import { useTableConfigSetting } from 'domains/reporting/hooks/useTableConfigSetting'
import {
    channelsReportTableActiveView,
    columnsOrder,
    columnsOrderWithoutHrtAi,
} from 'domains/reporting/pages/support-performance/channels/ChannelsTableConfig'
import { ChannelsTableColumns } from 'domains/reporting/state/ui/stats/types'
import { submitChannelsTableConfigView } from 'state/currentAccount/actions'
import { getChannelsTableConfigSettingsJS } from 'state/currentAccount/selectors'

export const useChannelsTableSetting = () => {
    const isHrtAiEnabled = useIsHrtAiEnabled()

    const channelColumns = isHrtAiEnabled
        ? columnsOrder
        : columnsOrderWithoutHrtAi

    return useTableConfigSetting<ChannelsTableColumns, never>(
        getChannelsTableConfigSettingsJS,
        channelsReportTableActiveView,
        channelColumns,
        [],
        submitChannelsTableConfigView,
    )
}
