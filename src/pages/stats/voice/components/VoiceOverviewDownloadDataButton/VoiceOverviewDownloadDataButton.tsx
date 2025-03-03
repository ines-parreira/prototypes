import React from 'react'

import { logEvent, SegmentEvent } from 'common/segment'
import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { DownloadDataButton } from 'pages/stats/support-performance/components/DownloadDataButton'
import { DOWNLOAD_BUTTON_TITLE } from 'pages/stats/voice/constants/voiceOverview'
import {
    DEPRECATED_useVoiceOverviewReportData,
    useVoiceOverviewReportData,
} from 'services/reporting/voiceOverviewReportingService'
import { saveZippedFiles } from 'utils/file'

export const VoiceOverviewDownloadDataButton = () => {
    const shouldShowNewUnansweredStatuses = useFlag(
        FeatureFlagKey.ShowNewUnansweredStatuses,
    )

    return shouldShowNewUnansweredStatuses ? (
        <NEW_VoiceOverviewDownloadDataButton />
    ) : (
        <DEPRECATED_VoiceOverviewDownloadDataButton />
    )
}

const NEW_VoiceOverviewDownloadDataButton = () => {
    const { files, fileName, isLoading } = useVoiceOverviewReportData()

    const onClick = async () => {
        logEvent(SegmentEvent.StatDownloadClicked, {
            name: 'all-metrics',
        })
        await saveZippedFiles(files, fileName)
    }

    return (
        <DownloadDataButton
            onClick={onClick}
            disabled={isLoading}
            title={DOWNLOAD_BUTTON_TITLE}
        />
    )
}

const DEPRECATED_VoiceOverviewDownloadDataButton = () => {
    const { files, fileName, isLoading } =
        DEPRECATED_useVoiceOverviewReportData()

    const onClick = async () => {
        logEvent(SegmentEvent.StatDownloadClicked, {
            name: 'all-metrics',
        })
        await saveZippedFiles(files, fileName)
    }

    return (
        <DownloadDataButton
            onClick={onClick}
            disabled={isLoading}
            title={DOWNLOAD_BUTTON_TITLE}
        />
    )
}
