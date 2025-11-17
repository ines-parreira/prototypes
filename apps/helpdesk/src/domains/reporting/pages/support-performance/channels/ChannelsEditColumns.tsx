import { useChannelsTableSetting } from 'domains/reporting/hooks/useChannelsTableConfigSetting'
import { EditTableColumns } from 'domains/reporting/pages/common/components/Table/EditTableColumns'
import {
    ChannelColumnConfig,
    ChannelsTableLabels,
    ChannelsTableViews,
    LeadColumn,
} from 'domains/reporting/pages/support-performance/channels/ChannelsTableConfig'
import type { ChannelsTableColumns } from 'domains/reporting/state/ui/stats/types'
import { getChannelsTableConfigSettingsJS } from 'state/currentAccount/selectors'

export const ChannelsEditColumns = () => {
    return (
        <EditTableColumns<ChannelsTableColumns, never>
            settingsSelector={getChannelsTableConfigSettingsJS}
            fallbackViews={ChannelsTableViews}
            tableLabels={ChannelsTableLabels}
            tooltips={ChannelColumnConfig}
            leadColumn={LeadColumn}
            leadRow={undefined}
            useTableSetting={useChannelsTableSetting}
        />
    )
}
