import React from 'react'

import {logEvent, SegmentEvent} from 'common/segment'
import {DownloadDataButton} from 'pages/stats/support-performance/components/DownloadDataButton'
import {useTagsReportData} from 'services/reporting/tagsReportingService'
import {saveZippedFiles} from 'utils/file'

const DOWNLOAD_BUTTON_TITLE = 'Download Tags Data'

export const TagsReportDownloadDataButton = () => {
    const {files, fileName, isLoading} = useTagsReportData()

    return (
        <DownloadDataButton
            onClick={async () => {
                logEvent(SegmentEvent.StatDownloadClicked, {
                    name: 'all-metrics',
                })

                await saveZippedFiles(files, fileName)
            }}
            disabled={isLoading}
            title={DOWNLOAD_BUTTON_TITLE}
        />
    )
}
