import { FeatureFlagKey } from '@repo/feature-flags'

import { logEvent, SegmentEvent } from 'common/segment'
import { useFlag } from 'core/flags'
import { DownloadDataButton } from 'domains/reporting/pages/support-performance/components/DownloadDataButton'
import { DOWNLOAD_BUTTON_TITLE } from 'domains/reporting/pages/voice/constants/voiceAgents'
import { useVoiceAgentsReportData } from 'domains/reporting/services/voiceAgentsReportingService'
import { saveZippedFiles } from 'utils/file'

export const VoiceAgentsDownloadDataButton = () => {
    const isTransferToExternalNumberEnabled = useFlag(
        FeatureFlagKey.TransferCallToExternalNumber,
    )

    const { files, fileName, isLoading } = useVoiceAgentsReportData(
        isTransferToExternalNumberEnabled,
    )

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
