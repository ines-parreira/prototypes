import { logEvent, SegmentEvent } from '@repo/logging'

import type { TimeSeriesHook } from 'domains/reporting/hooks/useTimeSeries'
import { DownloadDataButton } from 'domains/reporting/pages/support-performance/components/DownloadDataButton'
import { useAggregatedBusiestTimesOfDayReportData } from 'domains/reporting/services/busiestTimesOfDaysReportingService'
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
