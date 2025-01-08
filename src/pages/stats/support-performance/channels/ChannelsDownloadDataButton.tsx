import React from 'react'

import {logEvent, SegmentEvent} from 'common/segment'
import {useChannelsReportMetrics} from 'hooks/reporting/useChannelsReportMetrics'
import {useChannelsTableSetting} from 'hooks/reporting/useChannelsTableConfigSetting'
import Button from 'pages/common/components/button/Button'
import {DOWNLOAD_DATA_BUTTON_LABEL} from 'pages/stats/constants'
import {saveReport} from 'services/reporting/channelsReportingService'

const DOWNLOAD_BUTTON_TITLE = 'Channels Report Data'

export const ChannelsDownloadDataButton = () => {
    const {reportData, isLoading, period} = useChannelsReportMetrics()
    const {columnsOrder} = useChannelsTableSetting()

    return (
        <Button
            intent="secondary"
            fillStyle="ghost"
            onClick={async () => {
                logEvent(SegmentEvent.StatDownloadClicked, {
                    name: 'all-metrics',
                })
                await saveReport(reportData, columnsOrder, period)
            }}
            isDisabled={isLoading}
            title={DOWNLOAD_BUTTON_TITLE}
            leadingIcon="file_download"
        >
            {DOWNLOAD_DATA_BUTTON_LABEL}
        </Button>
    )
}
