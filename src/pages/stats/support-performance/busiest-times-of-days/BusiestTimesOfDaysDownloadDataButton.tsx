import React from 'react'

import { logEvent, SegmentEvent } from 'common/segment'
import { TimeSeriesHook } from 'hooks/reporting/useTimeSeries'
import { DownloadDataButton } from 'pages/stats/support-performance/components/DownloadDataButton'
import { useAggregatedBusiestTimesOfDayReportData } from 'services/reporting/busiestTimesOfDaysReportingService'
import { saveZippedFiles } from 'utils/file'

const DOWNLOAD_BUTTON_TITLE = 'Download Busiest Times of Days Data'

export const BusiestTimesOfDaysDownloadDataButton = ({
    useMetricQuery,
}: {
    useMetricQuery: TimeSeriesHook
}) => {
    const { files, fileName, isLoading } =
        useAggregatedBusiestTimesOfDayReportData(useMetricQuery)

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
