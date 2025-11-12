import { logEvent, SegmentEvent } from '@repo/logging'

import { LegacyButton as Button } from '@gorgias/axiom'

import { useChannelsReportMetrics } from 'domains/reporting/hooks/support-performance/channels/useChannelsReportMetrics'
import { DOWNLOAD_DATA_BUTTON_LABEL } from 'domains/reporting/pages/constants'
import { saveZippedFiles } from 'utils/file'

const DOWNLOAD_BUTTON_TITLE = 'Channels Report Data'

export const ChannelsDownloadDataButton = () => {
    const { files, fileName, isLoading } = useChannelsReportMetrics()

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
