import React from 'react'

import {logEvent, SegmentEvent} from 'common/segment'
import {useChannelsReportMetrics} from 'hooks/reporting/support-performance/channels/useChannelsReportMetrics'
import Button from 'pages/common/components/button/Button'
import {DOWNLOAD_DATA_BUTTON_LABEL} from 'pages/stats/constants'
import {saveZippedFiles} from 'utils/file'

const DOWNLOAD_BUTTON_TITLE = 'Channels Report Data'

export const ChannelsDownloadDataButton = () => {
    const {files, fileName, isLoading} = useChannelsReportMetrics()

    return (
        <Button
            intent="secondary"
            fillStyle="ghost"
            onClick={async () => {
                logEvent(SegmentEvent.StatDownloadClicked, {
                    name: 'all-metrics',
                })
                await saveZippedFiles(files, fileName)
            }}
            isDisabled={isLoading}
            title={DOWNLOAD_BUTTON_TITLE}
            leadingIcon="file_download"
        >
            {DOWNLOAD_DATA_BUTTON_LABEL}
        </Button>
    )
}
