import {useTableConfigSetting} from 'hooks/reporting/useTableConfigSetting'
import {
    ChannelsTableColumns,
    columnsOrder,
} from 'pages/stats/support-performance/channels/ChannelsTableConfig'
import {submitChannelsTableConfigView} from 'state/currentAccount/actions'
import {getChannelsTableActiveView} from 'state/currentAccount/selectors'

export const useChannelsTableSetting = () =>
    useTableConfigSetting<ChannelsTableColumns>(
        getChannelsTableActiveView,
        columnsOrder,
        submitChannelsTableConfigView
    )
