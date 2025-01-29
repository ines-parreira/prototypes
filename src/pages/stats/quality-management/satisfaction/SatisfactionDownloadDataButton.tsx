import React from 'react'

import {logEvent, SegmentEvent} from 'common/segment'
import {useSatisfactionMetrics} from 'hooks/reporting/quality-management/satisfaction/useSatisfactionMetrics'

import {DownloadDataButton} from 'pages/stats/support-performance/components/DownloadDataButton'
import {saveReport} from 'services/reporting/satisfactionReportingService'

const DOWNLOAD_SATISFACTION_DATA_BUTTON_TITLE = 'Download Satisfaction data'

export const SatisfactionDownloadDataButton = () => {
    const {reportData, isLoading, period} = useSatisfactionMetrics()

    return (
        <DownloadDataButton
            onClick={async () => {
                logEvent(SegmentEvent.StatDownloadClicked, {
                    name: 'all-metrics',
                })
                await saveReport(reportData, period)
            }}
            disabled={isLoading}
            title={DOWNLOAD_SATISFACTION_DATA_BUTTON_TITLE}
        />
    )
}
