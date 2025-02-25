import React from 'react'

import { useChannelsTableSetting } from 'hooks/reporting/useChannelsTableConfigSetting'
import { EditTableColumns } from 'pages/stats/common/components/Table/EditTableColumns'
import {
    ChannelColumnConfig,
    ChannelsTableLabels,
    ChannelsTableViews,
    LeadColumn,
} from 'pages/stats/support-performance/channels/ChannelsTableConfig'
import { getChannelsTableConfigSettingsJS } from 'state/currentAccount/selectors'

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
