import { logEvent, SegmentEvent } from '@repo/logging'

import { useDownloadAgentsAvailabilityData } from 'domains/reporting/hooks/support-performance/agents/useDownloadAgentsAvailabilityData'
import { DOWNLOAD_BUTTON_TITLES } from 'domains/reporting/pages/support-performance/agents/constants'
import { DownloadDataButton } from 'domains/reporting/pages/support-performance/components/DownloadDataButton'
import { saveZippedFiles } from 'utils/file'

export const DownloadAgentsAvailabilityButton = () => {
    const { files, fileName, isLoading } = useDownloadAgentsAvailabilityData()

    return (
        <DownloadDataButton
            onClick={async () => {
                logEvent(SegmentEvent.StatDownloadClicked, {
                    name: 'agent-availability',
                })
                await saveZippedFiles(files, fileName)
            }}
            disabled={isLoading}
            title={DOWNLOAD_BUTTON_TITLES.AGENT_AVAILABILITY}
        />
    )
}
