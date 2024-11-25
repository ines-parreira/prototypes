import React from 'react'

import {logEvent, SegmentEvent} from 'common/segment'
import {useDownloadAgentsPerformanceData} from 'hooks/reporting/support-performance/agents/useDownloadAgentsPerformanceData'

import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {DOWNLOAD_DATA_BUTTON_LABEL} from 'pages/stats/constants'
import {saveZippedFiles} from 'utils/file'

const DOWNLOAD_BUTTON_TITLE = 'Download Agents Performance Data'

export const DownloadAgentsPerformanceDataButton = () => {
    const {files, fileName, isLoading} = useDownloadAgentsPerformanceData()

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
        >
            <ButtonIconLabel icon="file_download">
                {DOWNLOAD_DATA_BUTTON_LABEL}
            </ButtonIconLabel>
        </Button>
    )
}
