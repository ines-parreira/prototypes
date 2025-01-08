import React from 'react'

import {logEvent, SegmentEvent} from 'common/segment'
import {TimeSeriesHook} from 'hooks/reporting/useTimeSeries'
import Button from 'pages/common/components/button/Button'
import {DOWNLOAD_DATA_BUTTON_LABEL} from 'pages/stats/constants'
import {useAggregatedBusiestTimesOfDayData} from 'pages/stats/support-performance/busiest-times-of-days/useAggregatedBusiestTimesOfDayData'
import {saveReport} from 'services/reporting/busiestTimesOfDaysReportingService'

const DOWNLOAD_BUTTON_TITLE = 'Download Busiest Times of Days Data'

export const BusiestTimesOfDaysDownloadDataButton = ({
    useMetricQuery,
}: {
    useMetricQuery: TimeSeriesHook
}) => {
    const {btodData, isLoading, period} =
        useAggregatedBusiestTimesOfDayData(useMetricQuery)

    return (
        <Button
            intent="secondary"
            fillStyle="ghost"
            onClick={async () => {
                logEvent(SegmentEvent.StatDownloadClicked, {
                    name: 'all-metrics',
                })
                await saveReport(btodData, period)
            }}
            isDisabled={isLoading}
            title={DOWNLOAD_BUTTON_TITLE}
            leadingIcon="file_download"
        >
            {DOWNLOAD_DATA_BUTTON_LABEL}
        </Button>
    )
}
