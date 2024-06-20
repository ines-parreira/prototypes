import React from 'react'
import {EditTableColumns} from 'pages/stats/common/components/Table/EditTableColumns'
import {getChannelsTableConfigSettingsJS} from 'state/currentAccount/selectors'
import {
    ChannelColumnConfig,
    ChannelsTableLabels,
    ChannelsTableViews,
    LeadColumn,
} from 'pages/stats/support-performance/channels/ChannelsTableConfig'
import {useChannelsTableSetting} from 'hooks/reporting/useChannelsTableConfigSetting'

export const ChannelsEditColumns = () => {
    return (
        <EditTableColumns
            settingsSelector={getChannelsTableConfigSettingsJS}
            fallbackViews={ChannelsTableViews}
            tableLabels={ChannelsTableLabels}
            tooltips={ChannelColumnConfig}
            leadColumn={LeadColumn}
            useTableSetting={useChannelsTableSetting}
        />
    )
}
