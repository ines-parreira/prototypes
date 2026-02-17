import { logEvent, SegmentEvent } from '@repo/logging'
import { saveZippedFiles } from '@repo/utils'

import { useDownloadVoiceCallsSLAsData } from 'domains/reporting/hooks/sla/useDownloadVoiceCallsSLAsData'
import { DownloadSLAsDataButton } from 'domains/reporting/pages/sla/components/DownloadSLAsDataButton'
import { DOWNLOAD_VOICE_CALLS_DATA_BUTTON_LABEL } from 'domains/reporting/pages/sla/constants'

export const DownloadVoiceCallsSLAsData = () => {
    const { files, fileName, isLoading } = useDownloadVoiceCallsSLAsData()

    return (
        <DownloadSLAsDataButton
            onClick={async () => {
                logEvent(SegmentEvent.StatDownloadClicked, {
                    name: 'all-metrics',
                })
                await saveZippedFiles(files, fileName)
            }}
            disabled={isLoading}
        >
            {DOWNLOAD_VOICE_CALLS_DATA_BUTTON_LABEL}
        </DownloadSLAsDataButton>
    )
}
