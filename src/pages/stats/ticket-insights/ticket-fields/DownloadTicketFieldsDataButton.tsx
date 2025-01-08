import React from 'react'

import {logEvent, SegmentEvent} from 'common/segment'
import {useNewStatsFilters} from 'hooks/reporting/support-performance/useNewStatsFilters'
import {useCustomFieldsTicketCountTimeSeries} from 'hooks/reporting/timeSeries'
import {getPeriodDateTimes} from 'hooks/reporting/useTimeSeries'
import useAppSelector from 'hooks/useAppSelector'
import Button from 'pages/common/components/button/Button'
import {DOWNLOAD_DATA_BUTTON_LABEL} from 'pages/stats/constants'

import {formatDates} from 'pages/stats/utils'
import {saveReport} from 'services/reporting/ticketFieldsReportingService'
import {getCustomFieldsOrder} from 'state/ui/stats/ticketInsightsSlice'
import {getFilterDateRange} from 'utils/reporting'

const DOWNLOAD_BUTTON_TITLE = 'Download Ticket Fields Data'

export const DownloadTicketFieldsDataButton = ({
    selectedCustomFieldId,
}: {
    selectedCustomFieldId: number
}) => {
    const {cleanStatsFilters, userTimezone, granularity} = useNewStatsFilters()
    const order = useAppSelector(getCustomFieldsOrder)
    const dateTimes = getPeriodDateTimes(
        getFilterDateRange(cleanStatsFilters.period),
        granularity
    )
    const {data: timeSeriesData, isLoading} =
        useCustomFieldsTicketCountTimeSeries(
            cleanStatsFilters,
            userTimezone,
            granularity,
            String(selectedCustomFieldId)
        )

    return (
        <Button
            intent="secondary"
            fillStyle="ghost"
            onClick={async () => {
                logEvent(SegmentEvent.StatDownloadClicked, {
                    name: 'all-metrics',
                })

                await saveReport(
                    timeSeriesData,
                    dateTimes.map((item) => formatDates(granularity, item)),
                    cleanStatsFilters.period,
                    order.direction
                )
            }}
            title={DOWNLOAD_BUTTON_TITLE}
            isDisabled={isLoading}
            leadingIcon="file_download"
        >
            {DOWNLOAD_DATA_BUTTON_LABEL}
        </Button>
    )
}
