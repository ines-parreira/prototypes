import { logEvent, SegmentEvent } from '@repo/logging'
import { saveZippedFiles } from '@repo/utils'

import { useDownloadSLAsData } from 'domains/reporting/hooks/sla/useDownloadSLAsData'
import { DownloadSLAsDataButton } from 'domains/reporting/pages/sla/components/DownloadSLAsDataButton'
import { DOWNLOAD_TICKET_DATA_BUTTON_LABEL } from 'domains/reporting/pages/sla/constants'

export const DownloadTicketsSLAsData = () => {
    const { files, fileName, isLoading } = useDownloadSLAsData()

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
            {DOWNLOAD_TICKET_DATA_BUTTON_LABEL}
        </DownloadSLAsDataButton>
    )
}
