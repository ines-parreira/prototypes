import { useMemo } from 'react'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { useTableConfigSetting } from 'hooks/reporting/useTableConfigSetting'
import {
    channelsReportTableActiveView,
    columnsOrder,
} from 'pages/stats/support-performance/channels/ChannelsTableConfig'
import { submitChannelsTableConfigView } from 'state/currentAccount/actions'
import { getChannelsTableConfigSettingsJS } from 'state/currentAccount/selectors'
import { ChannelsTableColumns } from 'state/ui/stats/types'

export const useChannelsTableSetting = () => {
    const isReportingAverageResponseTimeEnabled = useFlag(
        FeatureFlagKey.ReportingAverageResponseTime,
    )

    const channelsColumnsOrder: ChannelsTableColumns[] = useMemo(
        () => [
            ...columnsOrder,
            ...(isReportingAverageResponseTimeEnabled
                ? [ChannelsTableColumns.MedianResponseTime]
                : []),
        ],
        [isReportingAverageResponseTimeEnabled],
    )

    return useTableConfigSetting<ChannelsTableColumns, never>(
        getChannelsTableConfigSettingsJS,
        channelsReportTableActiveView,
        channelsColumnsOrder,
        [],
        submitChannelsTableConfigView,
    )
}
